SET @schema_name = DATABASE();

SET @drop_ingredients_unit_fk = (
    SELECT IF(
        EXISTS(
            SELECT 1
            FROM information_schema.table_constraints
            WHERE constraint_schema = @schema_name
              AND table_name = 'ingredients'
              AND constraint_name = 'fk_ingredients_measurement_unit'
        ),
        'ALTER TABLE ingredients DROP FOREIGN KEY fk_ingredients_measurement_unit',
        'SELECT 1'
    )
);
PREPARE stmt FROM @drop_ingredients_unit_fk;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE ingredients
    DROP COLUMN IF EXISTS preferred_measurement_unit_id;

SET @drop_recipe_author_fk = (
    SELECT IF(
        EXISTS(
            SELECT 1
            FROM information_schema.table_constraints
            WHERE constraint_schema = @schema_name
              AND table_name = 'recipes'
              AND constraint_name = 'fk_recipes_created_by'
        ),
        'ALTER TABLE recipes DROP FOREIGN KEY fk_recipes_created_by',
        'SELECT 1'
    )
);
PREPARE stmt FROM @drop_recipe_author_fk;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE recipes
    DROP COLUMN IF EXISTS created_by_user_id,
    DROP COLUMN IF EXISTS image_url,
    DROP COLUMN IF EXISTS source_name,
    DROP COLUMN IF EXISTS source_url,
    DROP COLUMN IF EXISTS is_public;

SET @drop_recipe_ingredients_unit_fk = (
    SELECT IF(
        EXISTS(
            SELECT 1
            FROM information_schema.table_constraints
            WHERE constraint_schema = @schema_name
              AND table_name = 'recipe_ingredients'
              AND constraint_name = 'fk_recipe_ingredients_measurement_unit'
        ),
        'ALTER TABLE recipe_ingredients DROP FOREIGN KEY fk_recipe_ingredients_measurement_unit',
        'SELECT 1'
    )
);
PREPARE stmt FROM @drop_recipe_ingredients_unit_fk;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE recipe_ingredients
    DROP COLUMN IF EXISTS measurement_unit_id;
