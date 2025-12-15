import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GitHubPushRequest {
  siteId: string;
  siteName: string;
  repoOwner: string;
  repoName: string;
  branch: string;
  commitMessage: string;
  changes: {
    path: string;
    content: string;
    encoding?: 'utf-8' | 'base64';
  }[];
}

interface GitHubPushResult {
  siteId: string;
  siteName: string;
  status: 'success' | 'failed' | 'skipped';
  commitSha?: string;
  commitUrl?: string;
  message: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const githubToken = Deno.env.get('GITHUB_TOKEN');
    if (!githubToken) {
      return new Response(JSON.stringify({ 
        error: 'GITHUB_TOKEN not configured',
        message: 'Please add your GitHub Personal Access Token in secrets'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { sites }: { sites: GitHubPushRequest[] } = await req.json();

    if (!sites || sites.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'No sites provided',
        results: []
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Pushing changes to ${sites.length} repositories...`);

    const results: GitHubPushResult[] = [];

    for (const site of sites) {
      try {
        console.log(`Processing ${site.repoOwner}/${site.repoName}...`);

        // Skip if no changes
        if (!site.changes || site.changes.length === 0) {
          results.push({
            siteId: site.siteId,
            siteName: site.siteName,
            status: 'skipped',
            message: 'No changes to push'
          });
          continue;
        }

        // Skip if repo info incomplete
        if (!site.repoOwner || !site.repoName) {
          results.push({
            siteId: site.siteId,
            siteName: site.siteName,
            status: 'skipped',
            message: 'Repository information incomplete'
          });
          continue;
        }

        const branch = site.branch || 'main';
        const baseUrl = `https://api.github.com/repos/${site.repoOwner}/${site.repoName}`;

        // Step 1: Get the latest commit SHA from the branch
        const refResponse = await fetch(`${baseUrl}/git/refs/heads/${branch}`, {
          headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Control-Center'
          }
        });

        if (!refResponse.ok) {
          const errorText = await refResponse.text();
          console.error(`Failed to get branch ref for ${site.repoName}:`, errorText);
          results.push({
            siteId: site.siteId,
            siteName: site.siteName,
            status: 'failed',
            message: `Failed to get branch: ${refResponse.status}`
          });
          continue;
        }

        const refData = await refResponse.json();
        const latestCommitSha = refData.object.sha;

        // Step 2: Get the tree SHA from the latest commit
        const commitResponse = await fetch(`${baseUrl}/git/commits/${latestCommitSha}`, {
          headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Control-Center'
          }
        });

        if (!commitResponse.ok) {
          results.push({
            siteId: site.siteId,
            siteName: site.siteName,
            status: 'failed',
            message: `Failed to get commit: ${commitResponse.status}`
          });
          continue;
        }

        const commitData = await commitResponse.json();
        const baseTreeSha = commitData.tree.sha;

        // Step 3: Create blobs for each changed file
        const treeItems: { path: string; mode: string; type: string; sha: string }[] = [];

        for (const change of site.changes) {
          const blobResponse = await fetch(`${baseUrl}/git/blobs`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${githubToken}`,
              'Accept': 'application/vnd.github.v3+json',
              'Content-Type': 'application/json',
              'User-Agent': 'Control-Center'
            },
            body: JSON.stringify({
              content: change.content,
              encoding: change.encoding || 'utf-8'
            })
          });

          if (!blobResponse.ok) {
            console.error(`Failed to create blob for ${change.path}`);
            continue;
          }

          const blobData = await blobResponse.json();
          treeItems.push({
            path: change.path,
            mode: '100644',
            type: 'blob',
            sha: blobData.sha
          });
        }

        if (treeItems.length === 0) {
          results.push({
            siteId: site.siteId,
            siteName: site.siteName,
            status: 'skipped',
            message: 'No files could be processed'
          });
          continue;
        }

        // Step 4: Create a new tree with the updated files
        const treeResponse = await fetch(`${baseUrl}/git/trees`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'User-Agent': 'Control-Center'
          },
          body: JSON.stringify({
            base_tree: baseTreeSha,
            tree: treeItems
          })
        });

        if (!treeResponse.ok) {
          results.push({
            siteId: site.siteId,
            siteName: site.siteName,
            status: 'failed',
            message: `Failed to create tree: ${treeResponse.status}`
          });
          continue;
        }

        const treeData = await treeResponse.json();

        // Step 5: Create a new commit
        const newCommitResponse = await fetch(`${baseUrl}/git/commits`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'User-Agent': 'Control-Center'
          },
          body: JSON.stringify({
            message: site.commitMessage,
            tree: treeData.sha,
            parents: [latestCommitSha]
          })
        });

        if (!newCommitResponse.ok) {
          results.push({
            siteId: site.siteId,
            siteName: site.siteName,
            status: 'failed',
            message: `Failed to create commit: ${newCommitResponse.status}`
          });
          continue;
        }

        const newCommitData = await newCommitResponse.json();

        // Step 6: Update the branch reference to point to the new commit
        const updateRefResponse = await fetch(`${baseUrl}/git/refs/heads/${branch}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'User-Agent': 'Control-Center'
          },
          body: JSON.stringify({
            sha: newCommitData.sha,
            force: false
          })
        });

        if (!updateRefResponse.ok) {
          results.push({
            siteId: site.siteId,
            siteName: site.siteName,
            status: 'failed',
            message: `Failed to update branch: ${updateRefResponse.status}`
          });
          continue;
        }

        // Success! Update the imported_apps table
        const commitUrl = `https://github.com/${site.repoOwner}/${site.repoName}/commit/${newCommitData.sha}`;
        
        await supabase.from('imported_apps')
          .update({
            github_last_push_at: new Date().toISOString(),
            github_last_commit_sha: newCommitData.sha
          })
          .eq('site_id', site.siteId);

        results.push({
          siteId: site.siteId,
          siteName: site.siteName,
          status: 'success',
          commitSha: newCommitData.sha,
          commitUrl,
          message: `Pushed ${site.changes.length} file(s)`
        });

        console.log(`Successfully pushed to ${site.repoOwner}/${site.repoName}: ${newCommitData.sha}`);

      } catch (error) {
        console.error(`Error pushing to ${site.siteName}:`, error);
        results.push({
          siteId: site.siteId,
          siteName: site.siteName,
          status: 'failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Log to audit
    await supabase.from('audit_logs').insert({
      action: 'github_push_changes',
      resource: 'github',
      details: {
        sites_processed: sites.length,
        results,
        summary: {
          success: results.filter(r => r.status === 'success').length,
          failed: results.filter(r => r.status === 'failed').length,
          skipped: results.filter(r => r.status === 'skipped').length,
        }
      }
    });

    return new Response(JSON.stringify({
      results,
      summary: {
        total: results.length,
        success: results.filter(r => r.status === 'success').length,
        failed: results.filter(r => r.status === 'failed').length,
        skipped: results.filter(r => r.status === 'skipped').length,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in github-push-changes:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
