import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RepoVisibilityResult {
  siteId: string;
  siteName: string;
  repoName: string;
  repoOwner: string;
  currentVisibility: 'public' | 'private' | 'internal' | 'unknown';
  newVisibility: 'private';
  status: 'success' | 'failed' | 'skipped';
  message: string;
}

interface VisibilityReport {
  inventory: RepoVisibilityResult[];
  executionLog: { timestamp: string; action: string; result: string }[];
  summary: {
    total: number;
    success: number;
    failed: number;
    skipped: number;
  };
  finalAcceptance: {
    allPrivate: boolean;
    residualRisks: string[];
    conclusion: string;
  };
}

// Extract GitHub repo info from Lovable URL
function extractGitHubInfo(lovableUrl: string): { owner: string; repo: string } | null {
  // Lovable URLs typically follow pattern: https://lovable.dev/projects/{project-id}
  // GitHub repos are typically named after the project
  // This is a placeholder - actual implementation would need to query Lovable API or GitHub search
  try {
    const url = new URL(lovableUrl);
    const pathParts = url.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2 && pathParts[0] === 'projects') {
      // Project ID doesn't directly map to GitHub repo
      // Return null to indicate we need the GitHub URL stored separately
      return null;
    }
  } catch {
    return null;
  }
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const githubToken = Deno.env.get('GITHUB_TOKEN');
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action } = await req.json();

    if (action === 'scan') {
      console.log('Scanning all imported apps for GitHub repositories...');
      
      // Fetch all imported apps
      const { data: importedApps, error: appsError } = await supabase
        .from('imported_apps')
        .select('*, sites(name, status)');

      if (appsError) {
        throw appsError;
      }

      const inventory: RepoVisibilityResult[] = [];
      const executionLog: { timestamp: string; action: string; result: string }[] = [];

      for (const app of importedApps || []) {
        const timestamp = new Date().toISOString();
        const siteName = app.sites?.name || app.project_name || 'Unknown';
        
        executionLog.push({
          timestamp,
          action: `Scanning ${siteName}`,
          result: 'Processing...'
        });

        // Check if we have a GitHub URL stored
        // For now, we'll use the Lovable URL to derive repo info
        // In production, you'd store github_repo_url in imported_apps table
        const repoInfo = extractGitHubInfo(app.lovable_url);
        
        if (!repoInfo) {
          inventory.push({
            siteId: app.site_id,
            siteName,
            repoName: app.project_name || 'unknown',
            repoOwner: 'unknown',
            currentVisibility: 'unknown',
            newVisibility: 'private',
            status: 'skipped',
            message: 'GitHub repository URL not configured. Add github_repo_url to imported_apps table.'
          });
          
          executionLog.push({
            timestamp: new Date().toISOString(),
            action: `${siteName}: GitHub URL not found`,
            result: 'Skipped - needs manual configuration'
          });
          continue;
        }

        inventory.push({
          siteId: app.site_id,
          siteName,
          repoName: repoInfo.repo,
          repoOwner: repoInfo.owner,
          currentVisibility: 'unknown',
          newVisibility: 'private',
          status: 'skipped',
          message: 'Ready for visibility change'
        });
      }

      const report: VisibilityReport = {
        inventory,
        executionLog,
        summary: {
          total: inventory.length,
          success: inventory.filter(r => r.status === 'success').length,
          failed: inventory.filter(r => r.status === 'failed').length,
          skipped: inventory.filter(r => r.status === 'skipped').length,
        },
        finalAcceptance: {
          allPrivate: false,
          residualRisks: [
            'GITHUB_TOKEN secret not configured or missing repo scope',
            'GitHub repository URLs not stored in imported_apps table',
            'Token owner may not have admin access to all repositories'
          ],
          conclusion: 'Scan complete. Execute remediation to change visibility.'
        }
      };

      return new Response(JSON.stringify(report), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'remediate') {
      console.log('Starting GitHub repository visibility remediation...');

      if (!githubToken) {
        return new Response(JSON.stringify({
          error: 'GITHUB_TOKEN secret not configured',
          instructions: [
            '1. Go to GitHub Settings > Developer settings > Personal access tokens',
            '2. Generate a new token with "repo" scope (full control of private repositories)',
            '3. Add the token as GITHUB_TOKEN in your Supabase secrets',
            '4. Ensure the token owner has admin access to all target repositories'
          ]
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Fetch all imported apps
      const { data: importedApps, error: appsError } = await supabase
        .from('imported_apps')
        .select('*, sites(name, status)');

      if (appsError) {
        throw appsError;
      }

      const inventory: RepoVisibilityResult[] = [];
      const executionLog: { timestamp: string; action: string; result: string }[] = [];

      for (const app of importedApps || []) {
        const timestamp = new Date().toISOString();
        const siteName = app.sites?.name || app.project_name || 'Unknown';
        
        // For demonstration, we'll check if github_repo_url exists
        // In production, you'd have this field in the imported_apps table
        const githubRepoUrl = (app as any).github_repo_url;
        
        if (!githubRepoUrl) {
          inventory.push({
            siteId: app.site_id,
            siteName,
            repoName: app.project_name || 'unknown',
            repoOwner: 'unknown',
            currentVisibility: 'unknown',
            newVisibility: 'private',
            status: 'skipped',
            message: 'GitHub repository URL not configured in database'
          });
          
          executionLog.push({
            timestamp,
            action: `${siteName}: Check GitHub URL`,
            result: 'Skipped - github_repo_url column needed'
          });
          continue;
        }

        try {
          // Parse GitHub URL to get owner/repo
          const urlMatch = githubRepoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
          if (!urlMatch) {
            throw new Error('Invalid GitHub URL format');
          }
          
          const [, owner, repo] = urlMatch;
          const repoName = repo.replace('.git', '');

          // Fetch current visibility
          executionLog.push({
            timestamp: new Date().toISOString(),
            action: `${siteName}: Fetching current visibility`,
            result: 'In progress...'
          });

          const getResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
            headers: {
              'Authorization': `Bearer ${githubToken}`,
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'Control-Center-Visibility-Remediation'
            }
          });

          if (!getResponse.ok) {
            throw new Error(`GitHub API error: ${getResponse.status} ${getResponse.statusText}`);
          }

          const repoData = await getResponse.json();
          const currentVisibility = repoData.private ? 'private' : (repoData.visibility || 'public');

          if (currentVisibility === 'private') {
            inventory.push({
              siteId: app.site_id,
              siteName,
              repoName,
              repoOwner: owner,
              currentVisibility: 'private',
              newVisibility: 'private',
              status: 'success',
              message: 'Already private - no change needed'
            });
            
            executionLog.push({
              timestamp: new Date().toISOString(),
              action: `${siteName}: Already private`,
              result: 'No change needed'
            });
            continue;
          }

          // Change visibility to private
          executionLog.push({
            timestamp: new Date().toISOString(),
            action: `${siteName}: Changing visibility to private`,
            result: 'In progress...'
          });

          const patchResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${githubToken}`,
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'Control-Center-Visibility-Remediation',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              private: true,
              visibility: 'private'
            })
          });

          if (!patchResponse.ok) {
            const errorData = await patchResponse.json();
            throw new Error(`Failed to update: ${errorData.message || patchResponse.statusText}`);
          }

          inventory.push({
            siteId: app.site_id,
            siteName,
            repoName,
            repoOwner: owner,
            currentVisibility: currentVisibility as any,
            newVisibility: 'private',
            status: 'success',
            message: 'Successfully changed to private'
          });

          executionLog.push({
            timestamp: new Date().toISOString(),
            action: `${siteName}: Visibility changed`,
            result: `Changed from ${currentVisibility} to private`
          });

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          
          inventory.push({
            siteId: app.site_id,
            siteName,
            repoName: app.project_name || 'unknown',
            repoOwner: 'unknown',
            currentVisibility: 'unknown',
            newVisibility: 'private',
            status: 'failed',
            message: errorMessage
          });

          executionLog.push({
            timestamp: new Date().toISOString(),
            action: `${siteName}: Error`,
            result: errorMessage
          });
        }
      }

      const successCount = inventory.filter(r => r.status === 'success').length;
      const allPrivate = successCount === inventory.length && inventory.length > 0;

      const report: VisibilityReport = {
        inventory,
        executionLog,
        summary: {
          total: inventory.length,
          success: successCount,
          failed: inventory.filter(r => r.status === 'failed').length,
          skipped: inventory.filter(r => r.status === 'skipped').length,
        },
        finalAcceptance: {
          allPrivate,
          residualRisks: allPrivate ? [] : [
            ...(!allPrivate ? ['Some repositories could not be changed to private'] : []),
            ...(inventory.some(r => r.status === 'skipped') ? ['Some repositories need github_repo_url configured'] : []),
          ],
          conclusion: allPrivate 
            ? 'All imported site repositories are now PRIVATE' 
            : `${successCount}/${inventory.length} repositories are private. Review failed/skipped items.`
        }
      };

      // Log to audit
      await supabase.from('audit_logs').insert({
        action: 'github_visibility_remediation',
        resource: 'imported_apps',
        details: report
      });

      return new Response(JSON.stringify(report), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action. Use "scan" or "remediate"' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in github-repo-visibility:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});