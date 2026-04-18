

CREATE TABLE catalog_roles (
    role_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE catalog_auth_providers (
    auth_provider_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE catalog_measurement_units (
    measurement_unit_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(20) NULL,
    unit_type ENUM('mass', 'volume', 'count', 'length', 'temperature', 'other') NOT NULL DEFAULT 'other',
    allows_decimals TINYINT(1) NOT NULL DEFAULT 1,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE catalog_recipe_difficulties (
    recipe_difficulty_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE catalog_recipe_statuses (
    recipe_status_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE ingredient_categories (
    ingredient_category_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    parent_category_id INT UNSIGNED NULL,
    name VARCHAR(120) NOT NULL,
    slug VARCHAR(140) NOT NULL UNIQUE,
    description VARCHAR(255) NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ingredient_categories_parent
        FOREIGN KEY (parent_category_id) REFERENCES ingredient_categories (ingredient_category_id)
);

CREATE TABLE ingredients (
    ingredient_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ingredient_category_id INT UNSIGNED NOT NULL,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    description TEXT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ingredients_category
        FOREIGN KEY (ingredient_category_id) REFERENCES ingredient_categories (ingredient_category_id)
);

CREATE TABLE ingredient_aliases (
    ingredient_alias_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ingredient_id BIGINT UNSIGNED NOT NULL,
    alias_name VARCHAR(150) NOT NULL,
    alias_slug VARCHAR(180) NOT NULL UNIQUE,
    alias_type ENUM('common_name', 'regional_name', 'plural_name', 'search_keyword') NOT NULL DEFAULT 'common_name',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ingredient_aliases_ingredient
        FOREIGN KEY (ingredient_id) REFERENCES ingredients (ingredient_id)
            ON DELETE CASCADE
);

CREATE TABLE users (
    user_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_id INT UNSIGNED NOT NULL,
    auth_provider_id INT UNSIGNED NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NULL,
    avatar_url VARCHAR(255) NULL,
    timezone VARCHAR(80) NOT NULL DEFAULT 'America/Mexico_City',
    is_verified TINYINT(1) NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    last_login_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id) REFERENCES catalog_roles (role_id),
    CONSTRAINT fk_users_auth_provider
        FOREIGN KEY (auth_provider_id) REFERENCES catalog_auth_providers (auth_provider_id)
);

CREATE TABLE recipe_categories (
    recipe_category_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    parent_category_id INT UNSIGNED NULL,
    name VARCHAR(120) NOT NULL,
    slug VARCHAR(140) NOT NULL UNIQUE,
    description VARCHAR(255) NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_recipe_categories_parent
        FOREIGN KEY (parent_category_id) REFERENCES recipe_categories (recipe_category_id)
);

CREATE TABLE recipes (
    recipe_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    recipe_status_id INT UNSIGNED NOT NULL,
    recipe_difficulty_id INT UNSIGNED NULL,
    recipe_category_id INT UNSIGNED NULL,
    title VARCHAR(180) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    short_description VARCHAR(255) NULL,
    description TEXT NULL,
    servings SMALLINT UNSIGNED NULL,
    prep_time_minutes SMALLINT UNSIGNED NULL,
    cook_time_minutes SMALLINT UNSIGNED NULL,
    total_time_minutes SMALLINT UNSIGNED NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_recipes_status
        FOREIGN KEY (recipe_status_id) REFERENCES catalog_recipe_statuses (recipe_status_id),
    CONSTRAINT fk_recipes_difficulty
        FOREIGN KEY (recipe_difficulty_id) REFERENCES catalog_recipe_difficulties (recipe_difficulty_id),
    CONSTRAINT fk_recipes_category
        FOREIGN KEY (recipe_category_id) REFERENCES recipe_categories (recipe_category_id)
);

CREATE TABLE recipe_steps (
    recipe_step_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    recipe_id BIGINT UNSIGNED NOT NULL,
    step_number SMALLINT UNSIGNED NOT NULL,
    instruction TEXT NOT NULL,
    estimated_minutes SMALLINT UNSIGNED NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_recipe_steps UNIQUE (recipe_id, step_number),
    CONSTRAINT fk_recipe_steps_recipe
        FOREIGN KEY (recipe_id) REFERENCES recipes (recipe_id)
            ON DELETE CASCADE
);

CREATE TABLE recipe_ingredients (
    recipe_ingredient_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    recipe_id BIGINT UNSIGNED NOT NULL,
    ingredient_id BIGINT UNSIGNED NOT NULL,
    quantity DECIMAL(10,2) NULL,
    preparation_note VARCHAR(255) NULL,
    is_optional TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_recipe_ingredient UNIQUE (recipe_id, ingredient_id, preparation_note),
    CONSTRAINT fk_recipe_ingredients_recipe
        FOREIGN KEY (recipe_id) REFERENCES recipes (recipe_id)
            ON DELETE CASCADE,
    CONSTRAINT fk_recipe_ingredients_ingredient
        FOREIGN KEY (ingredient_id) REFERENCES ingredients (ingredient_id)
);

CREATE TABLE recipe_tags (
    recipe_tag_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE recipe_tag_assignments (
    recipe_tag_assignment_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    recipe_id BIGINT UNSIGNED NOT NULL,
    recipe_tag_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_recipe_tag_assignment UNIQUE (recipe_id, recipe_tag_id),
    CONSTRAINT fk_recipe_tag_assignments_recipe
        FOREIGN KEY (recipe_id) REFERENCES recipes (recipe_id)
            ON DELETE CASCADE,
    CONSTRAINT fk_recipe_tag_assignments_tag
        FOREIGN KEY (recipe_tag_id) REFERENCES recipe_tags (recipe_tag_id)
            ON DELETE CASCADE
);

CREATE TABLE pantry_items (
    pantry_item_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    ingredient_id BIGINT UNSIGNED NOT NULL,
    measurement_unit_id INT UNSIGNED NULL,
    quantity DECIMAL(10,2) NULL,
    notes VARCHAR(255) NULL,
    expires_at DATE NULL,
    is_available TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_pantry_user_ingredient UNIQUE (user_id, ingredient_id),
    CONSTRAINT fk_pantry_items_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
            ON DELETE CASCADE,
    CONSTRAINT fk_pantry_items_ingredient
        FOREIGN KEY (ingredient_id) REFERENCES ingredients (ingredient_id),
    CONSTRAINT fk_pantry_items_measurement_unit
        FOREIGN KEY (measurement_unit_id) REFERENCES catalog_measurement_units (measurement_unit_id)
);

CREATE TABLE user_favorite_recipes (
    user_favorite_recipe_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    recipe_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_favorite_recipe UNIQUE (user_id, recipe_id),
    CONSTRAINT fk_user_favorites_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
            ON DELETE CASCADE,
    CONSTRAINT fk_user_favorites_recipe
        FOREIGN KEY (recipe_id) REFERENCES recipes (recipe_id)
            ON DELETE CASCADE
);

CREATE TABLE user_recipe_history (
    user_recipe_history_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    recipe_id BIGINT UNSIGNED NOT NULL,
    action_type ENUM('viewed', 'cooked', 'saved') NOT NULL DEFAULT 'viewed',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_recipe_history_user
        FOREIGN KEY (user_id) REFERENCES users (user_id)
            ON DELETE CASCADE,
    CONSTRAINT fk_user_recipe_history_recipe
        FOREIGN KEY (recipe_id) REFERENCES recipes (recipe_id)
            ON DELETE CASCADE
);

CREATE INDEX idx_ingredients_name ON ingredients (name);
CREATE INDEX idx_ingredient_aliases_name ON ingredient_aliases (alias_name);
CREATE INDEX idx_recipes_title ON recipes (title);
CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients (recipe_id);
CREATE INDEX idx_recipe_ingredients_ingredient ON recipe_ingredients (ingredient_id);
CREATE INDEX idx_pantry_items_user ON pantry_items (user_id);
CREATE INDEX idx_pantry_items_ingredient ON pantry_items (ingredient_id);
