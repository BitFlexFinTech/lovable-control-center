-- Add GitHub-related columns to imported_apps table for repository management
ALTER TABLE public.imported_apps 
ADD COLUMN IF NOT EXISTS github_repo_url text,
ADD COLUMN IF NOT EXISTS github_repo_owner text,
ADD COLUMN IF NOT EXISTS github_repo_name text,
ADD COLUMN IF NOT EXISTS github_default_branch text DEFAULT 'main',
ADD COLUMN IF NOT EXISTS github_visibility text DEFAULT 'unknown',
ADD COLUMN IF NOT EXISTS github_visibility_updated_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS github_last_push_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS github_last_commit_sha text;