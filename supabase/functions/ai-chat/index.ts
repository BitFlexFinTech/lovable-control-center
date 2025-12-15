import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, siteId, mode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client to fetch site context
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let siteContext = "";
    let githubContext = "";

    if (siteId) {
      // Fetch site details
      const { data: site } = await supabase
        .from("sites")
        .select("*")
        .eq("id", siteId)
        .single();

      // Fetch imported app details
      const { data: importedApp } = await supabase
        .from("imported_apps")
        .select("*")
        .eq("site_id", siteId)
        .single();

      if (site) {
        siteContext = `
Site Context:
- Name: ${site.name}
- Domain: ${site.domain || "Not configured"}
- Status: ${site.status || "unknown"}
- Lovable URL: ${site.lovable_url || "Not set"}
- Health: ${site.health_status || "unknown"}
- Uptime: ${site.uptime_percentage || 0}%
`;
      }

      if (importedApp?.github_repo_url) {
        githubContext = `
GitHub Repository: ${importedApp.github_repo_url}
- Owner: ${importedApp.github_repo_owner || "unknown"}
- Repo: ${importedApp.github_repo_name || "unknown"}
- Branch: ${importedApp.github_default_branch || "main"}
- Visibility: ${importedApp.github_visibility || "unknown"}
`;

        // Try to fetch repo structure if GitHub token is available
        const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");
        if (GITHUB_TOKEN && importedApp.github_repo_owner && importedApp.github_repo_name) {
          try {
            const treeResponse = await fetch(
              `https://api.github.com/repos/${importedApp.github_repo_owner}/${importedApp.github_repo_name}/git/trees/${importedApp.github_default_branch || "main"}?recursive=1`,
              {
                headers: {
                  Authorization: `Bearer ${GITHUB_TOKEN}`,
                  Accept: "application/vnd.github+json",
                },
              }
            );

            if (treeResponse.ok) {
              const treeData = await treeResponse.json();
              const files = treeData.tree
                ?.filter((f: any) => f.type === "blob")
                ?.slice(0, 50)
                ?.map((f: any) => f.path)
                ?.join("\n");

              if (files) {
                githubContext += `\nRepository Files (top 50):\n${files}`;
              }
            }
          } catch (e) {
            console.log("Could not fetch GitHub tree:", e);
          }
        }
      }
    }

    // Build system prompt
    const systemPrompt = `You are an AI assistant for Control Center, a multi-tenant admin dashboard for managing Lovable-built websites.

You help users:
1. Understand their sites and their configuration
2. Provide insights about site health, integrations, and status
3. Answer questions about Control Center features
4. ${mode === "chat" ? "Discuss and explain (no modifications in chat mode)" : "Help make changes and modifications to sites"}

${siteContext}
${githubContext}

Be helpful, concise, and accurate. If you don't have enough context, ask clarifying questions.
${mode === "chat" ? "In Chat mode, you can only provide information and suggestions - no actual changes will be made." : "In Modify mode, you can help implement changes that the user requests."}`;

    console.log("Calling Lovable AI Gateway with context:", { siteId, mode, hasGitHub: !!githubContext });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || "I could not generate a response.";

    console.log("AI response generated successfully");

    return new Response(
      JSON.stringify({ response: assistantMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
