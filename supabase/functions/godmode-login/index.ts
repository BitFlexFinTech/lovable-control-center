import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify user token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user has super_admin role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roleData || roleData.role !== 'super_admin') {
      console.log(`GodMode access denied for user ${user.id} - insufficient permissions`);
      return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { reason, durationMinutes = 30 } = await req.json();

    if (!reason || reason.trim().length < 10) {
      return new Response(JSON.stringify({ error: 'Reason must be at least 10 characters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check for existing active session
    const { data: existingSession } = await supabase
      .from('godmode_sessions')
      .select('*')
      .eq('admin_user_id', user.id)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (existingSession) {
      return new Response(JSON.stringify({ 
        error: 'Active GodMode session already exists',
        session: existingSession 
      }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create new GodMode session
    const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    const { data: session, error: insertError } = await supabase
      .from('godmode_sessions')
      .insert({
        admin_user_id: user.id,
        reason: reason.trim(),
        expires_at: expiresAt,
        ip_address: ipAddress,
        user_agent: userAgent,
        is_active: true,
        actions_log: []
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to create GodMode session:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to create session' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log to audit
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'godmode_activated',
      resource: 'godmode_sessions',
      resource_id: session.id,
      details: {
        reason,
        duration_minutes: durationMinutes,
        ip_address: ipAddress,
        expires_at: expiresAt
      }
    });

    console.log(`GodMode activated for user ${user.id}, session ${session.id}, expires ${expiresAt}`);

    return new Response(JSON.stringify({ 
      success: true, 
      session,
      message: `GodMode activated for ${durationMinutes} minutes`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('GodMode login error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
