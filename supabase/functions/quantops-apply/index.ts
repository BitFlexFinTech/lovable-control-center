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

    const { cardId, environment, actorUserId } = await req.json();

    console.log(`[QuantOps Apply] Starting apply for card ${cardId} to ${environment}`);

    // Get the recommendation card
    const { data: card, error: cardError } = await supabase
      .from('quantops_recommendation_cards')
      .select('*')
      .eq('id', cardId)
      .single();

    if (cardError || !card) {
      throw new Error(`Card not found: ${cardError?.message}`);
    }

    // Update card status to applying
    await supabase
      .from('quantops_recommendation_cards')
      .update({ status: 'applying' })
      .eq('id', cardId);

    // Simulate apply process
    const startTime = Date.now();
    
    // In production, this would:
    // 1. Create a feature branch
    // 2. Apply code patches
    // 3. Run tests
    // 4. Create PR
    // 5. Deploy to environment

    const simulatedCommitSha = `${Date.now().toString(16)}abc`;
    const simulatedPrNumber = Math.floor(Math.random() * 1000) + 100;
    const testsPassed = Math.random() > 0.1; // 90% success rate

    const metricsSnapshot = {
      rejectRate: Math.random() * 5,
      fillLatencyMs: Math.floor(Math.random() * 100) + 50,
      balanceDrift: Math.random() * 2,
      netProfitMin: Math.random() * 1000,
      timestamp: new Date().toISOString(),
    };

    const result = testsPassed ? 'success' : 'failed';
    const durationMs = Date.now() - startTime;

    // Create apply event
    const { data: applyEvent, error: eventError } = await supabase
      .from('quantops_apply_events')
      .insert({
        card_id: cardId,
        persona_id: card.persona_id,
        site_id: card.site_id,
        actor_user_id: actorUserId,
        actor_role: 'admin',
        commit_sha: simulatedCommitSha,
        pr_url: `https://github.com/greenback/trading-bot/pull/${simulatedPrNumber}`,
        pr_number: simulatedPrNumber,
        environment,
        result,
        tests_passed: testsPassed,
        metrics_snapshot: metricsSnapshot,
        duration_ms: durationMs,
        rollback_ref: simulatedCommitSha,
      })
      .select()
      .single();

    if (eventError) {
      throw new Error(`Failed to create apply event: ${eventError.message}`);
    }

    // Update card status based on result
    await supabase
      .from('quantops_recommendation_cards')
      .update({ status: result === 'success' ? 'applied' : 'failed' })
      .eq('id', cardId);

    console.log(`[QuantOps Apply] Completed with result: ${result}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        result,
        applyEvent,
        metricsSnapshot 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[QuantOps Apply] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
