import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check database connection
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    const dbConnected = !error;

    // Get basic stats
    const { count: sitesCount } = await supabase.from('sites').select('*', { count: 'exact', head: true });
    const { count: tenantsCount } = await supabase.from('tenants').select('*', { count: 'exact', head: true });

    const healthResponse = {
      status: dbConnected ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      checks: {
        database: dbConnected ? 'connected' : 'disconnected',
        auth: 'active',
        storage: 'available',
      },
      metrics: {
        sites: sitesCount || 0,
        tenants: tenantsCount || 0,
      },
      uptime: process.uptime ? process.uptime() : 'N/A',
    };

    console.log('Health check performed:', healthResponse.status);

    return new Response(JSON.stringify(healthResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: dbConnected ? 200 : 503,
    });
  } catch (error) {
    console.error('Health check error:', error);
    return new Response(JSON.stringify({
      status: 'error',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      error: error.message,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
