import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Bug detection checks
const bugChecks = [
  {
    id: 'null_site_references',
    name: 'Null Site References',
    severity: 'high',
    check: async (supabase: any) => {
      const tables = ['credentials', 'email_accounts', 'nexuspay_transactions', 'payment_providers'];
      const issues: string[] = [];
      
      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('id')
          .is('site_id', null);
        
        if (data?.length) {
          issues.push(`${table}: ${data.length} records with null site_id`);
        }
      }
      
      return {
        passed: issues.length === 0,
        details: issues.length ? issues.join('; ') : null
      };
    }
  },
  {
    id: 'duplicate_emails',
    name: 'Duplicate Email Accounts',
    severity: 'medium',
    check: async (supabase: any) => {
      const { data } = await supabase
        .from('email_accounts')
        .select('email');
      
      if (!data) return { passed: true, details: null };
      
      const emailCounts: Record<string, number> = {};
      data.forEach((row: any) => {
        emailCounts[row.email] = (emailCounts[row.email] || 0) + 1;
      });
      
      const duplicates = Object.entries(emailCounts).filter(([_, count]) => count > 1);
      
      return {
        passed: duplicates.length === 0,
        details: duplicates.length ? `${duplicates.length} duplicate email addresses found` : null
      };
    }
  },
  {
    id: 'transaction_anomalies',
    name: 'Transaction Amount Anomalies',
    severity: 'medium',
    check: async (supabase: any) => {
      const { data } = await supabase
        .from('nexuspay_transactions')
        .select('id, amount_usd, native_amount')
        .or('amount_usd.lt.0,native_amount.lt.0');
      
      return {
        passed: !data || data.length === 0,
        details: data?.length ? `${data.length} transactions with negative amounts` : null
      };
    }
  },
  {
    id: 'orphaned_integrations',
    name: 'Orphaned Site Integrations',
    severity: 'low',
    check: async (supabase: any) => {
      const { data: integrations } = await supabase
        .from('site_integrations')
        .select('id, site_id');
      
      const { data: sites } = await supabase
        .from('sites')
        .select('id');
      
      if (!integrations || !sites) return { passed: true, details: null };
      
      const siteIds = new Set(sites.map((s: any) => s.id));
      const orphaned = integrations.filter((i: any) => !siteIds.has(i.site_id));
      
      return {
        passed: orphaned.length === 0,
        details: orphaned.length ? `${orphaned.length} integrations without valid site` : null
      };
    }
  },
  {
    id: 'missing_tenant_refs',
    name: 'Missing Tenant References',
    severity: 'medium',
    check: async (supabase: any) => {
      const { data: sites } = await supabase
        .from('sites')
        .select('id, tenant_id')
        .is('tenant_id', null);
      
      return {
        passed: !sites || sites.length === 0,
        details: sites?.length ? `${sites.length} sites without tenant` : null
      };
    }
  },
  {
    id: 'stale_error_logs',
    name: 'High Error Rate Detection',
    severity: 'high',
    check: async (supabase: any) => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data, count } = await supabase
        .from('error_logs')
        .select('id', { count: 'exact' })
        .eq('level', 'error')
        .gte('created_at', oneHourAgo);
      
      return {
        passed: !count || count < 50,
        details: count && count >= 50 ? `${count} errors in the last hour` : null
      };
    }
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting daily bug scan...');

    // Create scan record
    const { data: scan, error: scanError } = await supabase
      .from('security_scans')
      .insert({
        scan_type: 'daily_bug',
        status: 'running',
        findings: []
      })
      .select()
      .single();

    if (scanError) {
      console.error('Failed to create scan record:', scanError);
      throw scanError;
    }

    const findings: any[] = [];
    const severityCounts = { critical: 0, high: 0, medium: 0, low: 0 };

    // Run all bug checks
    for (const check of bugChecks) {
      try {
        console.log(`Running check: ${check.name}`);
        const result = await check.check(supabase);
        
        if (!result.passed) {
          findings.push({
            check_id: check.id,
            name: check.name,
            severity: check.severity,
            details: result.details,
            timestamp: new Date().toISOString()
          });
          severityCounts[check.severity as keyof typeof severityCounts]++;
        }
      } catch (checkError: unknown) {
        const errMsg = checkError instanceof Error ? checkError.message : 'Unknown error';
        console.error(`Check ${check.id} failed:`, checkError);
        findings.push({
          check_id: check.id,
          name: check.name,
          severity: 'medium',
          details: `Check failed: ${errMsg}`,
          timestamp: new Date().toISOString()
        });
        severityCounts.medium++;
      }
    }

    // Update scan record with results
    const { error: updateError } = await supabase
      .from('security_scans')
      .update({
        status: 'completed',
        findings,
        severity_counts: severityCounts,
        completed_at: new Date().toISOString()
      })
      .eq('id', scan.id);

    if (updateError) {
      console.error('Failed to update scan record:', updateError);
    }

    // Log to audit
    await supabase.from('audit_logs').insert({
      action: 'bug_scan_completed',
      resource: 'security_scans',
      resource_id: scan.id,
      details: {
        findings_count: findings.length,
        severity_counts: severityCounts
      }
    });

    console.log(`Bug scan completed. Findings: ${findings.length}`);

    return new Response(JSON.stringify({
      success: true,
      scan_id: scan.id,
      findings_count: findings.length,
      severity_counts: severityCounts,
      findings
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Bug scan error:', error);
    return new Response(JSON.stringify({ error: 'Scan failed', details: errMsg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
