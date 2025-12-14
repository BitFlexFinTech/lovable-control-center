-- Add unique constraint for user_social_accounts upsert to work correctly
ALTER TABLE user_social_accounts 
ADD CONSTRAINT user_social_accounts_user_id_platform_key 
UNIQUE (user_id, platform);