# Database Migration: Player Profiles

## Overview
This migration adds player profile support to the tournament system, allowing players to link their user accounts and display profile images.

## Changes Required

### 1. Add columns to `tournament_players` table

```sql
-- Add user_id column (optional link to auth.users)
ALTER TABLE tournament_players
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add email column (optional)
ALTER TABLE tournament_players
ADD COLUMN email TEXT;

-- Add avatar_url column (optional)
ALTER TABLE tournament_players
ADD COLUMN avatar_url TEXT;

-- Add index for faster lookups
CREATE INDEX idx_tournament_players_user_id ON tournament_players(user_id);
```

### 2. Update `create_tournament_with_players` RPC function

The existing RPC function needs to be updated to accept additional player data:

```sql
CREATE OR REPLACE FUNCTION create_tournament_with_players(
  p_name TEXT,
  p_tournament_type tournament_type,
  p_target_points INTEGER,
  p_created_by UUID,
  p_player_names TEXT[],
  p_player_emails TEXT[] DEFAULT NULL,
  p_player_user_ids UUID[] DEFAULT NULL,
  p_player_avatar_urls TEXT[] DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_tournament_id UUID;
  v_match_id UUID;
  v_player_ids UUID[];
  v_player_id UUID;
  i INTEGER;
BEGIN
  -- Create tournament
  INSERT INTO tournaments (
    name,
    tournament_type,
    target_points,
    created_by,
    status,
    current_round
  ) VALUES (
    p_name,
    p_tournament_type,
    p_target_points,
    p_created_by,
    'active'::tournament_status,
    1
  ) RETURNING id INTO v_tournament_id;

  -- Add players with profile information
  v_player_ids := ARRAY[]::UUID[];
  FOR i IN 1..array_length(p_player_names, 1) LOOP
    INSERT INTO tournament_players (
      tournament_id,
      player_name,
      player_order,
      email,
      user_id,
      avatar_url
    ) VALUES (
      v_tournament_id,
      p_player_names[i],
      i,
      CASE WHEN p_player_emails IS NOT NULL THEN p_player_emails[i] ELSE NULL END,
      CASE WHEN p_player_user_ids IS NOT NULL THEN p_player_user_ids[i] ELSE NULL END,
      CASE WHEN p_player_avatar_urls IS NOT NULL THEN p_player_avatar_urls[i] ELSE NULL END
    ) RETURNING id INTO v_player_id;

    v_player_ids := array_append(v_player_ids, v_player_id);
  END LOOP;

  -- Generate first match based on tournament type
  IF p_tournament_type = 'americano' THEN
    -- Americano: Sequential pairing for round 1
    INSERT INTO matches (
      tournament_id,
      round_number,
      team_a_player1_id,
      team_a_player2_id,
      team_b_player1_id,
      team_b_player2_id,
      status
    ) VALUES (
      v_tournament_id,
      1,
      v_player_ids[1],
      v_player_ids[2],
      v_player_ids[3],
      v_player_ids[4],
      'pending'::match_status
    ) RETURNING id INTO v_match_id;
  ELSE
    -- Mexicano: Sequential pairing for round 1
    INSERT INTO matches (
      tournament_id,
      round_number,
      team_a_player1_id,
      team_a_player2_id,
      team_b_player1_id,
      team_b_player2_id,
      status
    ) VALUES (
      v_tournament_id,
      1,
      v_player_ids[1],
      v_player_ids[2],
      v_player_ids[3],
      v_player_ids[4],
      'pending'::match_status
    ) RETURNING id INTO v_match_id;
  END IF;

  RETURN json_build_object(
    'tournament_id', v_tournament_id,
    'match_id', v_match_id
  );
END;
$$;
```

## How to Apply

### Using Supabase Dashboard

1. Go to your Supabase project
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the migration SQL above
5. Click **Run** to execute

### Using Supabase CLI

```bash
# Create a new migration
supabase migration new add_player_profiles

# Add the SQL commands to the generated migration file
# Then apply the migration
supabase db push
```

## Rollback (if needed)

If you need to rollback this migration:

```sql
-- Remove the RPC function (revert to original version)
-- You'll need to recreate the original function here

-- Remove columns from tournament_players
ALTER TABLE tournament_players DROP COLUMN IF EXISTS avatar_url;
ALTER TABLE tournament_players DROP COLUMN IF EXISTS email;
ALTER TABLE tournament_players DROP COLUMN IF EXISTS user_id;
```

## Testing

After applying the migration:

1. Create a new tournament with your user account as a player
2. Verify your profile image appears in the player list
3. Check that the match display shows your profile image
4. Confirm the leaderboard displays profile images correctly

## Notes

- The `user_id`, `email`, and `avatar_url` columns are all optional (nullable)
- Players without user accounts will continue to work as before (just names)
- Players with user accounts will have their profile images displayed
- The migration is backward compatible with existing tournaments
