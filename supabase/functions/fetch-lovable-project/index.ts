import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lovableUrl } = await req.json();
    
    if (!lovableUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing lovableUrl parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching project info for:', lovableUrl);

    // Extract project ID from various URL formats
    let projectId: string | null = null;
    const patterns = [
      /lovable\.dev\/projects\/([^\/\?\#]+)/,
      /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
    ];
    
    for (const pattern of patterns) {
      const match = lovableUrl.match(pattern);
      if (match && match[1]) {
        projectId = match[1];
        break;
      }
    }

    if (!projectId) {
      console.log('Could not extract project ID from URL');
      return new Response(
        JSON.stringify({ error: 'Could not extract project ID from URL', projectName: null }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Extracted project ID:', projectId);

    // Try to fetch the project page to get the title
    const projectPageUrl = `https://lovable.dev/projects/${projectId}`;
    
    try {
      const response = await fetch(projectPageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LovableBot/1.0)',
          'Accept': 'text/html,application/xhtml+xml',
        },
      });

      if (!response.ok) {
        console.log('Failed to fetch project page:', response.status);
        return new Response(
          JSON.stringify({ 
            error: 'Could not fetch project page', 
            projectName: null,
            projectId 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const html = await response.text();
      
      // Try to extract project name from various sources in the HTML
      let projectName: string | null = null;

      // Try <title> tag - usually "Project Name | Lovable"
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        const titleText = titleMatch[1].trim();
        // Remove " | Lovable" or " - Lovable" suffix
        projectName = titleText.replace(/\s*[\|\-]\s*Lovable\s*$/i, '').trim();
        // If we ended up with empty string or just "Lovable", skip
        if (!projectName || projectName.toLowerCase() === 'lovable') {
          projectName = null;
        }
      }

      // Try Open Graph title
      if (!projectName) {
        const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
        if (ogTitleMatch && ogTitleMatch[1]) {
          projectName = ogTitleMatch[1].replace(/\s*[\|\-]\s*Lovable\s*$/i, '').trim();
          if (!projectName || projectName.toLowerCase() === 'lovable') {
            projectName = null;
          }
        }
      }

      // Try to find project name in meta description
      if (!projectName) {
        const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
        if (descMatch && descMatch[1]) {
          // Extract potential project name from description
          const desc = descMatch[1];
          const nameInDesc = desc.match(/^([^\.]+)/);
          if (nameInDesc && nameInDesc[1].length < 50) {
            projectName = nameInDesc[1].trim();
          }
        }
      }

      console.log('Extracted project name:', projectName);

      return new Response(
        JSON.stringify({ 
          projectName,
          projectId,
          success: !!projectName
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (fetchError) {
      console.error('Error fetching project page:', fetchError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch project page', 
          projectName: null,
          projectId 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error in fetch-lovable-project:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
