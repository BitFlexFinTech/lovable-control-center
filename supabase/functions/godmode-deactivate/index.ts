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

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { sessionId, killAll = false } = await req.json();

    // Check if user has super_admin role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roleData || roleData.role !== 'super_admin') {
      console.log(`GodMode deactivation denied for user ${user.id}`);
      return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const now = new Date().toISOString();

    if (killAll) {
      // Global kill switch - deactivate ALL active GodMode sessions
      const { data: deactivatedSessions, error: updateError } = await supabase
        .from('godmode_sessions')
        .update({ 
          is_active: false, 
          ended_at: now
        })
        .eq('is_active', true)
        .select();

      if (updateError) {
        console.error('Failed to execute kill switch:', updateError);
        return new Response(JSON.stringify({ error: 'Failed to deactivate sessions' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Audit log
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'godmode_kill_switch',
        resource: 'godmode_sessions',
        details: {
          sessions_deactivated: deactivatedSessions?.length || 0,
          executed_at: now
        }
      });

      console.log(`Global kill switch executed by ${user.id}, ${deactivatedSessions?.length || 0} sessions deactivated`);

      return new Response(JSON.stringify({ 
        success: true, 
        message: `Deactivated ${deactivatedSessions?.length || 0} GodMode sessions`,
        deactivated: deactivatedSessions
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Deactivate specific session
    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Session ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: session, error: updateError } = await supabase
      .from('godmode_sessions')
      .update({ 
        is_active: false, 
        ended_at: now 
      })
      .eq('id', sessionId)
      .eq('admin_user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to deactivate session:', updateError);
      return new Response(JSON.stringify({ error: 'Session not found or already deactivated' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'godmode_deactivated',
      resource: 'godmode_sessions',
      resource_id: sessionId,
      details: {
        ended_at: now,
        session_duration_minutes: Math.round((new Date(now).getTime() - new Date(session.started_at).getTime()) / 60000)
      }
    });

    console.log(`GodMode session ${sessionId} deactivated by ${user.id}`);

    return new Response(JSON.stringify({ 
      success: true, 
      session,
      message: 'GodMode session deactivated'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('GodMode deactivate error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
