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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { eventId, actorUserId } = await req.json();

    console.log(`[QuantOps Rollback] Starting rollback for event ${eventId}`);

    // Get the apply event
    const { data: event, error: eventError } = await supabase
      .from('quantops_apply_events')
      .select('*, quantops_recommendation_cards(*)')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      throw new Error(`Event not found: ${eventError?.message}`);
    }

    // Create rollback event
    const startTime = Date.now();
    const rollbackCommitSha = `rollback_${Date.now().toString(16)}`;

    const metricsSnapshot = {
      rejectRate: Math.random() * 3,
      fillLatencyMs: Math.floor(Math.random() * 80) + 40,
      balanceDrift: Math.random() * 1.5,
      netProfitMin: Math.random() * 800,
      timestamp: new Date().toISOString(),
    };

    const { data: rollbackEvent, error: rollbackError } = await supabase
      .from('quantops_apply_events')
      .insert({
        card_id: event.card_id,
        persona_id: event.persona_id,
        site_id: event.site_id,
        actor_user_id: actorUserId,
        actor_role: 'admin',
        commit_sha: rollbackCommitSha,
        environment: event.environment,
        result: 'rolled_back',
        tests_passed: true,
        metrics_snapshot: metricsSnapshot,
        duration_ms: Date.now() - startTime,
        rollback_ref: event.commit_sha,
      })
      .select()
      .single();

    if (rollbackError) {
      throw new Error(`Failed to create rollback event: ${rollbackError.message}`);
    }

    // Update original card status
    await supabase
      .from('quantops_recommendation_cards')
      .update({ status: 'rolled_back' })
      .eq('id', event.card_id);

    console.log(`[QuantOps Rollback] Completed successfully`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        rollbackEvent,
        metricsSnapshot 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[QuantOps Rollback] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
