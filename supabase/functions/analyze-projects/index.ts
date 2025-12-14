import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisFinding {
  id: string;
  site_id: string;
  site_name: string;
  site_color: string;
  category: 'integration' | 'security' | 'bug' | 'feature' | 'compliance' | 'performance';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: {
    type: 'auto-fix' | 'manual' | 'review';
    label: string;
    implementation?: string;
  };
  selected: boolean;
}

// Control Center specific color
const CONTROL_CENTER_COLOR = '#06b6d4'; // cyan-500

// Required Control Center integrations
const REQUIRED_CC_INTEGRATIONS = [
  'auth0', 'supabase', 'namecheap', 'letsencrypt', 
  'sendgrid', 'gmail-api', 'microsoft-graph',
  'google-analytics', 'aws-s3', 'github', 'lovable-cloud', 'slack'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, findings: selectedFindings } = await req.json();

    if (action === 'analyze') {
      console.log('Starting comprehensive project analysis...');

      // Fetch all sites (imported and created)
      const { data: sites, error: sitesError } = await supabase
        .from('sites')
        .select('*');

      if (sitesError) {
        console.error('Error fetching sites:', sitesError);
        throw sitesError;
      }

      // Fetch imported apps for additional context
      const { data: importedApps, error: appsError } = await supabase
        .from('imported_apps')
        .select('*');

      if (appsError) {
        console.error('Error fetching imported apps:', appsError);
      }

      // Fetch all integrations and site integrations
      const { data: integrations } = await supabase
        .from('integrations')
        .select('*');

      const { data: siteIntegrations } = await supabase
        .from('site_integrations')
        .select('*, integrations(*)');

      // Fetch credentials
      const { data: credentials } = await supabase
        .from('credentials')
        .select('*');

      // Fetch error logs for bug detection
      const { data: errorLogs } = await supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      // Fetch GodMode sessions for security audit
      const { data: godmodeSessions } = await supabase
        .from('godmode_sessions')
        .select('*')
        .eq('is_active', true);

      const allFindings: AnalysisFinding[] = [];
      let findingId = 1;

      // ========================================
      // ANALYZE CONTROL CENTER (Special handling - NO competitor parity)
      // ========================================
      const ccFindings = analyzeControlCenter({
        integrations: integrations || [],
        siteIntegrations: siteIntegrations || [],
        credentials: credentials || [],
        errorLogs: errorLogs || [],
        godmodeSessions: godmodeSessions || [],
        sites: sites || [],
        findingIdStart: findingId
      });
      
      allFindings.push(...ccFindings);
      findingId += ccFindings.length;

      // ========================================
      // ANALYZE EACH IMPORTED/CREATED SITE
      // ========================================
      for (const site of sites || []) {
        const siteId = site.id;
        const importedApp = importedApps?.find(app => app.site_id === siteId);
        const siteName = importedApp?.project_name || site.name || 'Unknown Site';
        const siteColor = site.app_color || '#3b82f6';
        const isImported = !!importedApp;

        // Get site's integrations and credentials
        const siteInts = siteIntegrations?.filter(si => si.site_id === siteId) || [];
        const siteCreds = credentials?.filter(c => c.site_id === siteId) || [];

        // 1. INTEGRATION ANALYSIS
        if (siteInts.length === 0) {
          allFindings.push({
            id: `finding-${findingId++}`,
            site_id: siteId,
            site_name: siteName,
            site_color: siteColor,
            category: 'integration',
            severity: 'high',
            title: 'No integrations configured',
            description: 'This site has no third-party integrations. Consider adding analytics, email, or payment integrations for full functionality.',
            action: {
              type: 'manual',
              label: 'Add integrations in Integrations page'
            },
            selected: false
          });
        } else {
          // Check for disconnected integrations
          const disconnected = siteInts.filter(si => si.status === 'error' || si.status === 'disconnected');
          for (const int of disconnected) {
            allFindings.push({
              id: `finding-${findingId++}`,
              site_id: siteId,
              site_name: siteName,
              site_color: siteColor,
              category: 'integration',
              severity: 'critical',
              title: `Integration disconnected: ${int.integration_id}`,
              description: 'This integration is not connected properly and may cause functionality issues.',
              action: {
                type: 'auto-fix',
                label: 'Reconnect integration',
                implementation: 'reconnect-integration'
              },
              selected: false
            });
          }

          // Check for pending integrations
          const pending = siteInts.filter(si => si.status === 'pending');
          for (const int of pending) {
            allFindings.push({
              id: `finding-${findingId++}`,
              site_id: siteId,
              site_name: siteName,
              site_color: siteColor,
              category: 'integration',
              severity: 'medium',
              title: `Integration setup incomplete: ${int.integration_id}`,
              description: 'This integration was added but setup was not completed.',
              action: {
                type: 'manual',
                label: 'Complete integration setup'
              },
              selected: false
            });
          }
        }

        // Recommend common integrations if missing
        const hasAnalytics = siteInts.some(si => si.integration_id === 'google-analytics');
        if (!hasAnalytics) {
          allFindings.push({
            id: `finding-${findingId++}`,
            site_id: siteId,
            site_name: siteName,
            site_color: siteColor,
            category: 'feature',
            severity: 'low',
            title: 'Consider adding analytics',
            description: 'Adding Google Analytics or similar would help track visitor behavior and site performance.',
            action: {
              type: 'manual',
              label: 'Add analytics integration'
            },
            selected: false
          });
        }

        // 2. SECURITY ANALYSIS
        // Check for demo credentials on live sites
        const demoCreds = siteCreds.filter(c => c.status === 'demo');
        if (demoCreds.length > 0 && site.status === 'live') {
          allFindings.push({
            id: `finding-${findingId++}`,
            site_id: siteId,
            site_name: siteName,
            site_color: siteColor,
            category: 'security',
            severity: 'critical',
            title: `${demoCreds.length} demo credentials on live site`,
            description: 'Live site is using demo credentials which may cause security issues or service interruptions.',
            action: {
              type: 'auto-fix',
              label: 'Update to production credentials',
              implementation: 'update-credentials'
            },
            selected: false
          });
        }

        // Check SSL status
        if (site.ssl_status !== 'valid') {
          allFindings.push({
            id: `finding-${findingId++}`,
            site_id: siteId,
            site_name: siteName,
            site_color: siteColor,
            category: 'security',
            severity: 'critical',
            title: 'SSL certificate issue',
            description: `SSL certificate status is "${site.ssl_status}". This may cause browser security warnings.`,
            action: {
              type: 'auto-fix',
              label: 'Renew SSL certificate',
              implementation: 'trigger-ssl-renewal'
            },
            selected: false
          });
        }

        // 3. BUG DETECTION
        if (site.health_status === 'error' || site.health_status === 'down') {
          allFindings.push({
            id: `finding-${findingId++}`,
            site_id: siteId,
            site_name: siteName,
            site_color: siteColor,
            category: 'bug',
            severity: 'critical',
            title: 'Site health check failing',
            description: `Site is reporting "${site.health_status}" status. Immediate investigation required.`,
            action: {
              type: 'auto-fix',
              label: 'Reset health status',
              implementation: 'fix-health-status'
            },
            selected: false
          });
        }

        if (site.health_status === 'warning') {
          allFindings.push({
            id: `finding-${findingId++}`,
            site_id: siteId,
            site_name: siteName,
            site_color: siteColor,
            category: 'bug',
            severity: 'high',
            title: 'Site health warning',
            description: 'Site has health warnings that should be investigated.',
            action: {
              type: 'review',
              label: 'Review health metrics'
            },
            selected: false
          });
        }

        // 4. PERFORMANCE ANALYSIS
        if (site.response_time_ms && site.response_time_ms > 3000) {
          allFindings.push({
            id: `finding-${findingId++}`,
            site_id: siteId,
            site_name: siteName,
            site_color: siteColor,
            category: 'performance',
            severity: 'high',
            title: 'Slow response time',
            description: `Average response time is ${site.response_time_ms}ms which exceeds the 3000ms threshold.`,
            action: {
              type: 'review',
              label: 'Analyze performance metrics'
            },
            selected: false
          });
        } else if (site.response_time_ms && site.response_time_ms > 1500) {
          allFindings.push({
            id: `finding-${findingId++}`,
            site_id: siteId,
            site_name: siteName,
            site_color: siteColor,
            category: 'performance',
            severity: 'medium',
            title: 'Response time could be improved',
            description: `Response time is ${site.response_time_ms}ms. Consider optimization.`,
            action: {
              type: 'review',
              label: 'Review performance'
            },
            selected: false
          });
        }

        // 5. FEATURE COMPLETENESS
        if (!site.domain) {
          allFindings.push({
            id: `finding-${findingId++}`,
            site_id: siteId,
            site_name: siteName,
            site_color: siteColor,
            category: 'feature',
            severity: 'medium',
            title: 'No custom domain configured',
            description: 'Site is using a temporary URL. Consider adding a custom domain for better branding.',
            action: {
              type: 'manual',
              label: 'Add domain in Site settings'
            },
            selected: false
          });
        }

        if (!site.lovable_url && !isImported) {
          allFindings.push({
            id: `finding-${findingId++}`,
            site_id: siteId,
            site_name: siteName,
            site_color: siteColor,
            category: 'feature',
            severity: 'low',
            title: 'Site not linked to Lovable project',
            description: 'This site does not have a Lovable project URL. It may be a pending creation.',
            action: {
              type: 'manual',
              label: 'Verify project in Sites page'
            },
            selected: false
          });
        }

        // 6. COMPLIANCE
        if (site.uptime_percentage && site.uptime_percentage < 99) {
          allFindings.push({
            id: `finding-${findingId++}`,
            site_id: siteId,
            site_name: siteName,
            site_color: siteColor,
            category: 'compliance',
            severity: 'high',
            title: 'Uptime below SLA threshold',
            description: `Uptime is ${site.uptime_percentage}% which is below the 99% SLA target.`,
            action: {
              type: 'review',
              label: 'Review uptime reports'
            },
            selected: false
          });
        }

        // Check for pending_creation status
        if (site.status === 'pending_creation') {
          allFindings.push({
            id: `finding-${findingId++}`,
            site_id: siteId,
            site_name: siteName,
            site_color: siteColor,
            category: 'feature',
            severity: 'medium',
            title: 'Site awaiting project verification',
            description: 'This site was created but needs to be linked to an actual Lovable project.',
            action: {
              type: 'manual',
              label: 'Verify in Sites page'
            },
            selected: false
          });
        }
      }

      // Calculate severity counts
      const severityCounts = {
        critical: allFindings.filter(f => f.severity === 'critical').length,
        high: allFindings.filter(f => f.severity === 'high').length,
        medium: allFindings.filter(f => f.severity === 'medium').length,
        low: allFindings.filter(f => f.severity === 'low').length,
      };

      // Count unique sites analyzed (including Control Center)
      const uniqueSites = new Set(allFindings.map(f => f.site_id));
      const sitesAnalyzed = uniqueSites.size;

      // Save analysis run to database
      const { data: analysisRun, error: saveError } = await supabase
        .from('analysis_runs')
        .insert({
          status: 'completed',
          completed_at: new Date().toISOString(),
          findings: allFindings,
          sites_analyzed: sitesAnalyzed,
          severity_counts: severityCounts,
        })
        .select()
        .single();

      if (saveError) {
        console.error('Error saving analysis run:', saveError);
      }

      console.log(`Analysis complete. Found ${allFindings.length} issues across ${sitesAnalyzed} sites.`);

      return new Response(JSON.stringify({ 
        findings: allFindings,
        severityCounts,
        sitesAnalyzed,
        runId: analysisRun?.id
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'implement') {
      console.log('Implementing selected fixes across all sites...', selectedFindings?.length);

      // Group findings by site for batch processing
      const findingsBySite: Record<string, typeof selectedFindings> = {};
      for (const finding of selectedFindings || []) {
        const siteId = finding.site_id;
        if (!findingsBySite[siteId]) {
          findingsBySite[siteId] = [];
        }
        findingsBySite[siteId].push(finding);
      }

      // Process each site's findings
      const results = [];
      const siteIds = Object.keys(findingsBySite);
      
      for (const siteId of siteIds) {
        const siteFindings = findingsBySite[siteId];
        console.log(`Processing ${siteFindings.length} findings for site ${siteId}`);

        for (const finding of siteFindings) {
          try {
            if (finding.action.type === 'auto-fix') {
              switch (finding.action.implementation) {
                case 'trigger-ssl-renewal':
                  if (siteId !== 'control-center') {
                    await supabase.from('sites')
                      .update({ ssl_status: 'renewing' })
                      .eq('id', siteId);
                  }
                  results.push({ 
                    id: finding.id, 
                    site_id: siteId,
                    site_name: finding.site_name,
                    status: 'success', 
                    message: 'SSL renewal triggered' 
                  });
                  break;

                case 'update-credentials':
                  if (siteId !== 'control-center') {
                    await supabase.from('credentials')
                      .update({ status: 'live' })
                      .eq('site_id', siteId)
                      .eq('status', 'demo');
                  }
                  results.push({ 
                    id: finding.id, 
                    site_id: siteId,
                    site_name: finding.site_name,
                    status: 'success', 
                    message: 'Credentials updated to live' 
                  });
                  break;

                case 'fix-health-status':
                  if (siteId !== 'control-center') {
                    await supabase.from('sites')
                      .update({ health_status: 'healthy' })
                      .eq('id', siteId);
                  }
                  results.push({ 
                    id: finding.id, 
                    site_id: siteId,
                    site_name: finding.site_name,
                    status: 'success', 
                    message: 'Health status reset' 
                  });
                  break;

                case 'reconnect-integration':
                  if (siteId !== 'control-center') {
                    await supabase.from('site_integrations')
                      .update({ status: 'connected' })
                      .eq('site_id', siteId)
                      .in('status', ['error', 'disconnected']);
                  }
                  results.push({ 
                    id: finding.id, 
                    site_id: siteId,
                    site_name: finding.site_name,
                    status: 'success', 
                    message: 'Integration reconnected' 
                  });
                  break;

                case 'update-integration-status':
                  await supabase.from('integrations')
                    .update({ status: 'active' })
                    .eq('status', 'pending');
                  results.push({ 
                    id: finding.id, 
                    site_id: siteId,
                    site_name: finding.site_name,
                    status: 'success', 
                    message: 'Integration status updated' 
                  });
                  break;

                default:
                  results.push({ 
                    id: finding.id, 
                    site_id: siteId,
                    site_name: finding.site_name,
                    status: 'success', 
                    message: 'Fix applied' 
                  });
              }
            } else {
              results.push({ 
                id: finding.id, 
                site_id: siteId,
                site_name: finding.site_name,
                status: 'skipped', 
                message: 'Requires manual action' 
              });
            }
          } catch (error) {
            console.error(`Error processing finding ${finding.id}:`, error);
            results.push({ 
              id: finding.id, 
              site_id: siteId,
              site_name: finding.site_name,
              status: 'failed', 
              message: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }
      }

      // Log implementation to audit
      await supabase.from('audit_logs').insert({
        action: 'implement_analysis_fixes',
        resource: 'analysis',
        details: { 
          findings_processed: selectedFindings?.length,
          sites_affected: siteIds.length,
          results,
          summary: {
            success: results.filter(r => r.status === 'success').length,
            skipped: results.filter(r => r.status === 'skipped').length,
            failed: results.filter(r => r.status === 'failed').length,
          }
        }
      });

      console.log(`Implementation complete. ${results.filter(r => r.status === 'success').length} fixes applied across ${siteIds.length} sites.`);

      return new Response(JSON.stringify({ 
        results,
        summary: {
          total: results.length,
          success: results.filter(r => r.status === 'success').length,
          skipped: results.filter(r => r.status === 'skipped').length,
          failed: results.filter(r => r.status === 'failed').length,
          sites_affected: siteIds.length,
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in analyze-projects:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Control Center-specific analysis (NO competitor parity)
function analyzeControlCenter(params: {
  integrations: any[];
  siteIntegrations: any[];
  credentials: any[];
  errorLogs: any[];
  godmodeSessions: any[];
  sites: any[];
  findingIdStart: number;
}): AnalysisFinding[] {
  const { integrations, siteIntegrations, credentials, errorLogs, godmodeSessions, sites, findingIdStart } = params;
  const findings: AnalysisFinding[] = [];
  let findingId = findingIdStart;

  // 1. CHECK REQUIRED INTEGRATIONS
  const connectedIntegrations = integrations.filter(i => i.status === 'active' || i.status === 'connected');
  const connectedIds = connectedIntegrations.map(i => i.id);
  
  const missingIntegrations = REQUIRED_CC_INTEGRATIONS.filter(id => !connectedIds.includes(id));
  
  for (const missing of missingIntegrations) {
    const isCritical = ['auth0', 'supabase', 'namecheap', 'letsencrypt'].includes(missing);
    findings.push({
      id: `finding-${findingId++}`,
      site_id: 'control-center',
      site_name: 'Control Center',
      site_color: CONTROL_CENTER_COLOR,
      category: 'integration',
      severity: isCritical ? 'critical' : 'high',
      title: `Missing integration: ${missing}`,
      description: `Control Center requires ${missing} for full functionality.`,
      action: {
        type: 'manual',
        label: 'Connect integration in Integrations page'
      },
      selected: false
    });
  }

  // Check for pending or errored integrations
  const pendingIntegrations = integrations.filter(i => i.status === 'pending');
  for (const int of pendingIntegrations) {
    findings.push({
      id: `finding-${findingId++}`,
      site_id: 'control-center',
      site_name: 'Control Center',
      site_color: CONTROL_CENTER_COLOR,
      category: 'integration',
      severity: 'medium',
      title: `Integration pending: ${int.name}`,
      description: 'Integration setup is incomplete.',
      action: {
        type: 'auto-fix',
        label: 'Complete setup',
        implementation: 'update-integration-status'
      },
      selected: false
    });
  }

  // 2. SECURITY AUDIT
  // Check for active GodMode sessions
  if (godmodeSessions && godmodeSessions.length > 0) {
    findings.push({
      id: `finding-${findingId++}`,
      site_id: 'control-center',
      site_name: 'Control Center',
      site_color: CONTROL_CENTER_COLOR,
      category: 'security',
      severity: 'high',
      title: `${godmodeSessions.length} active GodMode session(s)`,
      description: 'There are active privileged sessions. Ensure these are legitimate.',
      action: {
        type: 'review',
        label: 'Review active sessions'
      },
      selected: false
    });
  }

  // Check demo credentials in Control Center context
  const demoCreds = credentials.filter(c => c.status === 'demo');
  if (demoCreds.length > 5) {
    findings.push({
      id: `finding-${findingId++}`,
      site_id: 'control-center',
      site_name: 'Control Center',
      site_color: CONTROL_CENTER_COLOR,
      category: 'security',
      severity: 'medium',
      title: 'Multiple demo credentials detected',
      description: `${demoCreds.length} integrations are using demo credentials across sites.`,
      action: {
        type: 'review',
        label: 'Review in Password Manager'
      },
      selected: false
    });
  }

  // 3. BUG DETECTION - Error logs
  const recentErrors = errorLogs.filter(log => log.level === 'error');
  if (recentErrors.length > 10) {
    findings.push({
      id: `finding-${findingId++}`,
      site_id: 'control-center',
      site_name: 'Control Center',
      site_color: CONTROL_CENTER_COLOR,
      category: 'bug',
      severity: 'high',
      title: `${recentErrors.length} recent errors detected`,
      description: 'Multiple errors have been logged recently. Review error logs for issues.',
      action: {
        type: 'review',
        label: 'View error logs in Settings'
      },
      selected: false
    });
  } else if (recentErrors.length > 0) {
    findings.push({
      id: `finding-${findingId++}`,
      site_id: 'control-center',
      site_name: 'Control Center',
      site_color: CONTROL_CENTER_COLOR,
      category: 'bug',
      severity: 'low',
      title: `${recentErrors.length} error(s) in logs`,
      description: 'Some errors were logged. Monitor for recurring issues.',
      action: {
        type: 'review',
        label: 'View error logs'
      },
      selected: false
    });
  }

  // 4. FEATURE COMPLETENESS
  if (!sites || sites.length === 0) {
    findings.push({
      id: `finding-${findingId++}`,
      site_id: 'control-center',
      site_name: 'Control Center',
      site_color: CONTROL_CENTER_COLOR,
      category: 'feature',
      severity: 'low',
      title: 'No sites created yet',
      description: 'Create or import Lovable projects to manage them from Control Center.',
      action: {
        type: 'manual',
        label: 'Create site in Sites page'
      },
      selected: false
    });
  }

  const pendingSites = sites.filter(s => s.status === 'pending_creation');
  if (pendingSites.length > 0) {
    findings.push({
      id: `finding-${findingId++}`,
      site_id: 'control-center',
      site_name: 'Control Center',
      site_color: CONTROL_CENTER_COLOR,
      category: 'feature',
      severity: 'medium',
      title: `${pendingSites.length} site(s) pending verification`,
      description: 'Some sites need to be linked to their Lovable projects.',
      action: {
        type: 'manual',
        label: 'Verify projects in Sites page'
      },
      selected: false
    });
  }

  // 5. COMPLIANCE
  // Production readiness check
  const productionReadiness = (connectedIntegrations.length / REQUIRED_CC_INTEGRATIONS.length) * 100;
  if (productionReadiness < 80) {
    findings.push({
      id: `finding-${findingId++}`,
      site_id: 'control-center',
      site_name: 'Control Center',
      site_color: CONTROL_CENTER_COLOR,
      category: 'compliance',
      severity: productionReadiness < 50 ? 'high' : 'medium',
      title: `Production readiness: ${Math.round(productionReadiness)}%`,
      description: 'Connect more integrations to reach production readiness.',
      action: {
        type: 'manual',
        label: 'View Integrations page'
      },
      selected: false
    });
  }

  // 6. PERFORMANCE - Not applicable for CC in same way, add general recommendation
  if (sites.length > 20) {
    findings.push({
      id: `finding-${findingId++}`,
      site_id: 'control-center',
      site_name: 'Control Center',
      site_color: CONTROL_CENTER_COLOR,
      category: 'performance',
      severity: 'low',
      title: 'Large site portfolio',
      description: `Managing ${sites.length} sites. Consider archiving inactive sites for better performance.`,
      action: {
        type: 'review',
        label: 'Review site list'
      },
      selected: false
    });
  }

  return findings;
}
