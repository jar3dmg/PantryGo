USE recetario_app;

INSERT INTO catalog_roles (code, name) VALUES
('admin', 'Administrador'),
('user', 'Usuario')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO catalog_auth_providers (code, name) VALUES
('local', 'Correo y contrasena'),
('google', 'Google')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO catalog_measurement_units (code, name, symbol, unit_type, allows_decimals) VALUES
('piece', 'Pieza', 'pz', 'count', 0),
('gram', 'Gramo', 'g', 'mass', 1),
('kilogram', 'Kilogramo', 'kg', 'mass', 1),
('milliliter', 'Mililitro', 'ml', 'volume', 1),
('liter', 'Litro', 'l', 'volume', 1),
('cup', 'Taza', 'tza', 'volume', 1),
('tablespoon', 'Cucharada', 'cda', 'volume', 1),
('teaspoon', 'Cucharadita', 'cdta', 'volume', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO catalog_recipe_difficulties (code, name, sort_order) VALUES
('easy', 'Facil', 1),
('medium', 'Media', 2),
('hard', 'Avanzada', 3)
ON DUPLICATE KEY UPDATE name = VALUES(name), sort_order = VALUES(sort_order);

INSERT INTO catalog_recipe_statuses (code, name) VALUES
('draft', 'Borrador'),
('published', 'Publicada'),
('archived', 'Archivada')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO ingredient_categories (name, slug, description) VALUES
('Verduras', 'verduras', 'Vegetales frescos y sus variantes'),
('Frutas', 'frutas', 'Frutas frescas de uso comun'),
('Carnes', 'carnes', 'Proteinas de origen animal'),
('Lacteos', 'lacteos', 'Leche, quesos y derivados'),
('Cereales y granos', 'cereales-y-granos', 'Arroz, avena, trigo y mas'),
('Especias y condimentos', 'especias-y-condimentos', 'Hierbas, especias y sazonadores'),
('Leguminosas', 'leguminosas', 'Frijoles, lentejas y garbanzos')
ON DUPLICATE KEY UPDATE description = VALUES(description);

INSERT INTO recipe_categories (name, slug, description) VALUES
('Desayunos', 'desayunos', 'Recetas para comenzar el dia'),
('Comidas', 'comidas', 'Platos fuertes y completos'),
('Cenas', 'cenas', 'Opciones ligeras o rapidas'),
('Postres', 'postres', 'Preparaciones dulces'),
('Bebidas', 'bebidas', 'Preparaciones liquidas'),
('Snacks', 'snacks', 'Botanas y bocadillos')
ON DUPLICATE KEY UPDATE description = VALUES(description);

INSERT INTO recipe_tags (name, slug) VALUES
('Rapida', 'rapida'),
('Saludable', 'saludable'),
('Economica', 'economica'),
('Vegetariana', 'vegetariana'),
('Sin gluten', 'sin-gluten')
ON DUPLICATE KEY UPDATE name = VALUES(name);
