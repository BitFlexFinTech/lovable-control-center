import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Security scan checks
const securityChecks = [
  {
    id: 'expired_godmode',
    name: 'Expired GodMode Sessions',
    severity: 'medium',
    check: async (supabase: any) => {
      const { data, error } = await supabase
        .from('godmode_sessions')
        .select('id')
        .eq('is_active', true)
        .lt('expires_at', new Date().toISOString());
      
      return {
        passed: !data || data.length === 0,
        details: data?.length ? `${data.length} expired sessions still marked active` : null
      };
    }
  },
  {
    id: 'orphaned_credentials',
    name: 'Orphaned Credentials',
    severity: 'high',
    check: async (supabase: any) => {
      const { data, error } = await supabase
        .from('credentials')
        .select('id, site_id')
        .is('site_id', null);
      
      return {
        passed: !data || data.length === 0,
        details: data?.length ? `${data.length} credentials without associated site` : null
      };
    }
  },
  {
    id: 'weak_passwords',
    name: 'Weak Password Detection',
    severity: 'critical',
    check: async (supabase: any) => {
      const { data } = await supabase
        .from('credentials')
        .select('id, password');
      
      const weakPasswords = data?.filter((cred: any) => 
        cred.password && cred.password.length < 12
      ) || [];
      
      return {
        passed: weakPasswords.length === 0,
        details: weakPasswords.length ? `${weakPasswords.length} credentials with weak passwords` : null
      };
    }
  },
  {
    id: 'inactive_providers',
    name: 'Inactive Payment Providers',
    severity: 'low',
    check: async (supabase: any) => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from('payment_providers')
        .select('id, provider')
        .eq('is_connected', true)
        .lt('last_synced_at', thirtyDaysAgo);
      
      return {
        passed: !data || data.length === 0,
        details: data?.length ? `${data.length} providers not synced in 30+ days` : null
      };
    }
  },
  {
    id: 'pending_transactions',
    name: 'Stale Pending Transactions',
    severity: 'medium',
    check: async (supabase: any) => {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from('nexuspay_transactions')
        .select('id')
        .eq('status', 'pending')
        .lt('created_at', oneDayAgo);
      
      return {
        passed: !data || data.length === 0,
        details: data?.length ? `${data.length} transactions pending for 24+ hours` : null
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

    console.log('Starting daily security scan...');

    // Create scan record
    const { data: scan, error: scanError } = await supabase
      .from('security_scans')
      .insert({
        scan_type: 'daily_security',
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

    // Run all security checks
    for (const check of securityChecks) {
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
          severity: 'high',
          details: `Check failed: ${errMsg}`,
          timestamp: new Date().toISOString()
        });
        severityCounts.high++;
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
      action: 'security_scan_completed',
      resource: 'security_scans',
      resource_id: scan.id,
      details: {
        findings_count: findings.length,
        severity_counts: severityCounts
      }
    });

    console.log(`Security scan completed. Findings: ${findings.length}`);

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
    console.error('Security scan error:', error);
    return new Response(JSON.stringify({ error: 'Scan failed', details: errMsg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
