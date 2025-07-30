-- Fix any existing decimal values in the database and ensure proper constraints

-- Update any existing decimal values to integers
UPDATE pokemon_team 
SET 
  happiness = ROUND(happiness),
  health = ROUND(health),
  energy = ROUND(energy),
  hunger = ROUND(hunger),
  activity_points = ROUND(activity_points),
  total_actions = ROUND(total_actions)
WHERE 
  happiness != ROUND(happiness) OR
  health != ROUND(health) OR
  energy != ROUND(energy) OR
  hunger != ROUND(hunger) OR
  activity_points != ROUND(activity_points) OR
  total_actions != ROUND(total_actions);

-- Verify the constraints are in place
ALTER TABLE pokemon_team 
  ALTER COLUMN happiness TYPE INTEGER,
  ALTER COLUMN health TYPE INTEGER,
  ALTER COLUMN energy TYPE INTEGER,
  ALTER COLUMN hunger TYPE INTEGER,
  ALTER COLUMN activity_points TYPE INTEGER,
  ALTER COLUMN total_actions TYPE INTEGER;

-- Re-add the check constraints to ensure values stay within valid ranges
ALTER TABLE pokemon_team 
  DROP CONSTRAINT IF EXISTS pokemon_team_happiness_check,
  DROP CONSTRAINT IF EXISTS pokemon_team_health_check,
  DROP CONSTRAINT IF EXISTS pokemon_team_energy_check,
  DROP CONSTRAINT IF EXISTS pokemon_team_hunger_check;

ALTER TABLE pokemon_team 
  ADD CONSTRAINT pokemon_team_happiness_check CHECK (happiness >= 0 AND happiness <= 100),
  ADD CONSTRAINT pokemon_team_health_check CHECK (health >= 0 AND health <= 100),
  ADD CONSTRAINT pokemon_team_energy_check CHECK (energy >= 0 AND energy <= 100),
  ADD CONSTRAINT pokemon_team_hunger_check CHECK (hunger >= 0 AND hunger <= 100);

-- Verify the fix worked
SELECT 'Database constraints fixed successfully!' as status;
SELECT COUNT(*) as total_pokemon FROM pokemon_team;
