ALTER TABLE ingredients
    DROP COLUMN IF EXISTS seasonal_month_start,
    DROP COLUMN IF EXISTS seasonal_month_end,
    DROP COLUMN IF EXISTS is_allergen;
