USE recetario_app;

INSERT IGNORE INTO ingredients (
    ingredient_category_id,
    preferred_measurement_unit_id,
    name,
    slug,
    description,
    is_allergen
)
SELECT
    ic.ingredient_category_id,
    mu.measurement_unit_id,
    src.name,
    src.slug,
    src.description,
    src.is_allergen
FROM (
    SELECT 'verduras' AS category_slug, 'cup' AS unit_code, 'Espinaca' AS name, 'espinaca' AS slug, 'Hoja verde de sabor suave.' AS description, 0 AS is_allergen
    UNION ALL SELECT 'verduras', 'piece', 'Cebolla', 'cebolla', 'Base aromatica para guisos.', 0
    UNION ALL SELECT 'verduras', 'piece', 'Ajo', 'ajo', 'Condimento fresco e intenso.', 0
    UNION ALL SELECT 'verduras', 'gram', 'Champinon', 'champinon', 'Hongo de sabor delicado.', 0
    UNION ALL SELECT 'verduras', 'piece', 'Tomate', 'tomate', 'Tomate rojo para salsas y ensaladas.', 0
    UNION ALL SELECT 'verduras', 'gram', 'Calabaza', 'calabaza', 'Calabaza tierna para cremas y guarniciones.', 0
    UNION ALL SELECT 'verduras', 'piece', 'Pimiento rojo', 'pimiento-rojo', 'Pimiento dulce para saltear.', 0
    UNION ALL SELECT 'verduras', 'piece', 'Pepino', 'pepino', 'Verdura fresca para ensaladas y snacks.', 0
    UNION ALL SELECT 'verduras', 'cup', 'Lechuga', 'lechuga', 'Hoja fresca para ensaladas.', 0
    UNION ALL SELECT 'verduras', 'gram', 'Flor de calabaza', 'flor-calabaza', 'Flor suave para quesadillas.', 0
    UNION ALL SELECT 'verduras', 'piece', 'Papa', 'papa', 'Tuberculo para guisos y guarniciones.', 0
    UNION ALL SELECT 'verduras', 'piece', 'Zanahoria', 'zanahoria', 'Verdura dulce y crujiente.', 0
    UNION ALL SELECT 'verduras', 'piece', 'Camote', 'camote', 'Tuberculo dulce para hornear.', 0
    UNION ALL SELECT 'frutas', 'piece', 'Platano', 'platano', 'Fruta dulce ideal para desayunos.', 0
    UNION ALL SELECT 'frutas', 'piece', 'Fresa', 'fresa', 'Fruta fresca de sabor dulce.', 0
    UNION ALL SELECT 'frutas', 'piece', 'Mango', 'mango', 'Fruta tropical de pulpa suave.', 0
    UNION ALL SELECT 'frutas', 'cup', 'Pina', 'pina', 'Fruta tropical jugosa.', 0
    UNION ALL SELECT 'frutas', 'piece', 'Limon', 'limon', 'Citricos para bebidas y aderezos.', 0
    UNION ALL SELECT 'frutas', 'piece', 'Manzana', 'manzana', 'Fruta crujiente para postres.', 0
    UNION ALL SELECT 'frutas', 'piece', 'Naranja', 'naranja', 'Citricos dulces para jugos.', 0
    UNION ALL SELECT 'frutas', 'piece', 'Durazno', 'durazno', 'Fruta suave para bebidas y postres.', 0
    UNION ALL SELECT 'frutas', 'piece', 'Aguacate', 'aguacate', 'Fruta cremosa para tostadas y ensaladas.', 0
    UNION ALL SELECT 'frutas', 'cup', 'Frutos secos', 'frutos-secos', 'Mezcla de nueces y semillas.', 1
    UNION ALL SELECT 'carnes', 'gram', 'Pollo', 'pollo', 'Proteina magra de uso comun.', 0
    UNION ALL SELECT 'carnes', 'gram', 'Jamon', 'jamon', 'Fiambre para desayunos y snacks.', 0
    UNION ALL SELECT 'carnes', 'gram', 'Carne de res', 'carne-res', 'Carne para guisos y fajitas.', 0
    UNION ALL SELECT 'carnes', 'gram', 'Pescado blanco', 'pescado-blanco', 'Filete suave para sarten.', 0
    UNION ALL SELECT 'carnes', 'gram', 'Atun', 'atun', 'Proteina lista para mezclar.', 0
    UNION ALL SELECT 'lacteos', 'gram', 'Queso manchego', 'queso-manchego', 'Queso que funde bien.', 1
    UNION ALL SELECT 'lacteos', 'cup', 'Yogurt natural', 'yogurt-natural', 'Yogurt sin saborizantes.', 1
    UNION ALL SELECT 'lacteos', 'cup', 'Crema', 'crema', 'Crema para salsas y postres.', 1
    UNION ALL SELECT 'lacteos', 'milliliter', 'Leche', 'leche', 'Leche entera para preparaciones.', 1
    UNION ALL SELECT 'lacteos', 'gram', 'Parmesano', 'parmesano', 'Queso duro para pastas.', 1
    UNION ALL SELECT 'lacteos', 'gram', 'Mantequilla', 'mantequilla', 'Grasa lactea para saltear y hornear.', 1
    UNION ALL SELECT 'lacteos', 'gram', 'Queso crema', 'queso-crema', 'Queso untuoso para rellenos.', 1
    UNION ALL SELECT 'cereales-y-granos', 'cup', 'Avena', 'avena', 'Cereal integral versatil.', 0
    UNION ALL SELECT 'cereales-y-granos', 'piece', 'Pan integral', 'pan-integral', 'Pan rebanado de grano integral.', 0
    UNION ALL SELECT 'cereales-y-granos', 'cup', 'Arroz', 'arroz', 'Cereal base para recetas saladas y dulces.', 0
    UNION ALL SELECT 'cereales-y-granos', 'gram', 'Pasta', 'pasta', 'Pasta seca para platos rapidos.', 0
    UNION ALL SELECT 'cereales-y-granos', 'cup', 'Quinoa', 'quinoa', 'Semilla cocida rica en proteina.', 0
    UNION ALL SELECT 'cereales-y-granos', 'cup', 'Granola', 'granola', 'Mezcla tostada para desayunos.', 0
    UNION ALL SELECT 'cereales-y-granos', 'piece', 'Tortilla de maiz', 'tortilla-maiz', 'Tortilla tradicional para tacos y quesadillas.', 0
    UNION ALL SELECT 'cereales-y-granos', 'piece', 'Tortilla de harina', 'tortilla-harina', 'Tortilla suave para wraps y fajitas.', 0
    UNION ALL SELECT 'cereales-y-granos', 'cup', 'Harina de trigo', 'harina-trigo', 'Base para panes y postres.', 0
    UNION ALL SELECT 'cereales-y-granos', 'piece', 'Galleta Maria', 'galleta-maria', 'Galleta dulce para bases de postre.', 0
    UNION ALL SELECT 'cereales-y-granos', 'cup', 'Maiz palomero', 'maiz-palomero', 'Grano seco para hacer palomitas.', 0
    UNION ALL SELECT 'especias-y-condimentos', 'teaspoon', 'Canela', 'canela', 'Especia aromatica para postres y bebidas.', 0
    UNION ALL SELECT 'especias-y-condimentos', 'cup', 'Salsa verde', 'salsa-verde', 'Salsa de chile verde y tomate.', 0
    UNION ALL SELECT 'especias-y-condimentos', 'tablespoon', 'Chipotle', 'chipotle', 'Chile adobado de sabor intenso.', 0
    UNION ALL SELECT 'especias-y-condimentos', 'tablespoon', 'Azucar', 'azucar', 'Endulzante comun.', 0
    UNION ALL SELECT 'especias-y-condimentos', 'teaspoon', 'Vainilla', 'vainilla', 'Extracto aromatico para postres.', 0
    UNION ALL SELECT 'especias-y-condimentos', 'gram', 'Chocolate', 'chocolate', 'Chocolate para bebidas y postres.', 0
    UNION ALL SELECT 'especias-y-condimentos', 'tablespoon', 'Miel', 'miel', 'Endulzante natural.', 0
    UNION ALL SELECT 'especias-y-condimentos', 'tablespoon', 'Aceite de oliva', 'aceite-oliva', 'Grasa vegetal para cocinar.', 0
    UNION ALL SELECT 'especias-y-condimentos', 'teaspoon', 'Chile en polvo', 'chile-polvo', 'Condimento para snacks y frutas.', 0
    UNION ALL SELECT 'especias-y-condimentos', 'cup', 'Flor de jamaica', 'jamaica', 'Base para agua fresca.', 0
    UNION ALL SELECT 'especias-y-condimentos', 'teaspoon', 'Sal', 'sal', 'Sazonador basico.', 0
    UNION ALL SELECT 'especias-y-condimentos', 'teaspoon', 'Pimienta', 'pimienta', 'Especia para sazonar.', 0
    UNION ALL SELECT 'especias-y-condimentos', 'teaspoon', 'Polvo para hornear', 'polvo-hornear', 'Leudante para hotcakes y postres.', 0
    UNION ALL SELECT 'especias-y-condimentos', 'teaspoon', 'Cafe soluble', 'cafe-soluble', 'Cafe instantaneo para bebidas.', 0
    UNION ALL SELECT 'especias-y-condimentos', 'tablespoon', 'Grenetina', 'grenetina', 'Gelificante para postres.', 0
    UNION ALL SELECT 'leguminosas', 'cup', 'Lenteja', 'lenteja', 'Leguminosa para sopas y guisos.', 0
    UNION ALL SELECT 'leguminosas', 'cup', 'Garbanzo', 'garbanzo', 'Leguminosa para ensaladas y hummus.', 0
    UNION ALL SELECT 'leguminosas', 'cup', 'Frijol', 'frijol', 'Leguminosa para rellenos y molletes.', 0
    UNION ALL SELECT 'lacteos', 'piece', 'Huevo', 'huevo', 'Ingrediente base para desayunos y postres.', 1
) AS src
JOIN ingredient_categories AS ic
    ON ic.slug = src.category_slug
LEFT JOIN catalog_measurement_units AS mu
    ON mu.code = src.unit_code;

INSERT IGNORE INTO ingredient_aliases (
    ingredient_id,
    alias_name,
    alias_slug,
    alias_type
)
SELECT i.ingredient_id, src.alias_name, src.alias_slug, src.alias_type
FROM (
    SELECT 'tomate' AS ingredient_slug, 'Jitomate' AS alias_name, 'jitomate' AS alias_slug, 'regional_name' AS alias_type
    UNION ALL SELECT 'platano', 'Banana', 'banana', 'common_name'
    UNION ALL SELECT 'frijol', 'Frijoles', 'frijoles', 'plural_name'
    UNION ALL SELECT 'yogurt-natural', 'Yoghurt natural', 'yoghurt-natural', 'search_keyword'
    UNION ALL SELECT 'pina', 'Pina natural', 'pina-natural', 'search_keyword'
) AS src
JOIN ingredients AS i
    ON i.slug = src.ingredient_slug;

INSERT IGNORE INTO recipes (
    recipe_status_id,
    recipe_difficulty_id,
    created_by_user_id,
    recipe_category_id,
    title,
    slug,
    short_description,
    description,
    servings,
    prep_time_minutes,
    cook_time_minutes,
    total_time_minutes,
    is_public
)
SELECT
    rs.recipe_status_id,
    rd.recipe_difficulty_id,
    NULL,
    rc.recipe_category_id,
    src.title,
    src.slug,
    src.short_description,
    src.description,
    src.servings,
    src.prep_time_minutes,
    src.cook_time_minutes,
    src.total_time_minutes,
    1
FROM (
    SELECT 'published' AS status_code, 'easy' AS difficulty_code, 'desayunos' AS category_slug, 'Huevos revueltos con espinaca' AS title, 'huevos-revueltos-con-espinaca' AS slug, 'Desayuno rapido con huevo y hojas verdes.' AS short_description, 'Huevos suaves con espinaca salteada y queso fundido para una manana ligera.' AS description, 2 AS servings, 10 AS prep_time_minutes, 8 AS cook_time_minutes, 18 AS total_time_minutes
    UNION ALL SELECT 'published', 'easy', 'desayunos', 'Avena con platano y canela', 'avena-con-platano-y-canela', 'Tazon caliente de avena cremosa.', 'Avena cocida con leche, platano y canela para un desayuno reconfortante.', 2, 5, 10, 15
    UNION ALL SELECT 'published', 'easy', 'desayunos', 'Quesadillas de champinon', 'quesadillas-de-champinon', 'Quesadillas doradas con relleno jugoso.', 'Champinones salteados con cebolla y queso derretido dentro de tortillas calientes.', 2, 10, 10, 20
    UNION ALL SELECT 'published', 'easy', 'desayunos', 'Chilaquiles verdes ligeros', 'chilaquiles-verdes-ligeros', 'Version sencilla para iniciar el dia.', 'Totopos caseros con salsa verde, crema, cebolla y queso suave.', 2, 12, 12, 24
    UNION ALL SELECT 'published', 'easy', 'desayunos', 'Omelette de jamon y queso', 'omelette-de-jamon-y-queso', 'Clasico desayuno proteico.', 'Omelette relleno con jamon y queso para un desayuno completo.', 1, 8, 7, 15
    UNION ALL SELECT 'published', 'easy', 'desayunos', 'Hotcakes de avena', 'hotcakes-de-avena', 'Hotcakes suaves sin mezcla comercial.', 'Hotcakes caseros endulzados con platano y aroma de canela.', 2, 10, 10, 20
    UNION ALL SELECT 'published', 'easy', 'desayunos', 'Yogurt con fruta y granola', 'yogurt-con-fruta-y-granola', 'Desayuno fresco y crujiente.', 'Copa de yogurt natural con frutas frescas y granola tostada.', 1, 8, 0, 8
    UNION ALL SELECT 'published', 'easy', 'desayunos', 'Molletes integrales', 'molletes-integrales', 'Pan tostado con frijol y queso.', 'Molletes hechos con pan integral, frijol untado y queso gratinado.', 2, 10, 8, 18
    UNION ALL SELECT 'published', 'easy', 'desayunos', 'Sandwich de huevo y aguacate', 'sandwich-de-huevo-y-aguacate', 'Sandwich cremoso y practico.', 'Pan integral relleno de huevo cocido, tomate y aguacate.', 1, 10, 7, 17
    UNION ALL SELECT 'published', 'easy', 'desayunos', 'Smoothie bowl tropical', 'smoothie-bowl-tropical', 'Bowl frio con frutas tropicales.', 'Batido espeso de mango y pina servido con yogurt y granola.', 1, 10, 0, 10
    UNION ALL SELECT 'published', 'easy', 'comidas', 'Pollo al limon con arroz', 'pollo-al-limon-con-arroz', 'Plato casero fresco y completo.', 'Pollo dorado con ajo y limon acompanado de arroz suelto.', 3, 15, 20, 35
    UNION ALL SELECT 'published', 'medium', 'comidas', 'Carne con papas', 'carne-con-papas', 'Guiso casero de todos los dias.', 'Carne de res salteada con papa, tomate y cebolla en una salsa ligera.', 4, 15, 25, 40
    UNION ALL SELECT 'published', 'medium', 'comidas', 'Enchiladas de pollo', 'enchiladas-de-pollo', 'Tortillas rellenas y banadas en salsa.', 'Enchiladas verdes rellenas de pollo deshebrado con crema y queso.', 4, 20, 20, 40
    UNION ALL SELECT 'published', 'easy', 'comidas', 'Sopa de lentejas', 'sopa-de-lentejas', 'Sopa nutritiva y rendidora.', 'Lentejas cocidas con verduras basicas en un caldo espeso y casero.', 4, 10, 30, 40
    UNION ALL SELECT 'published', 'easy', 'comidas', 'Arroz frito con verduras', 'arroz-frito-con-verduras', 'Arroz salteado de aprovechamiento.', 'Arroz salteado con huevo y verduras picadas para una comida rapida.', 3, 10, 12, 22
    UNION ALL SELECT 'published', 'medium', 'comidas', 'Pasta cremosa con champinon', 'pasta-cremosa-con-champinon', 'Pasta suave con salsa blanca sencilla.', 'Pasta al dente con champinones salteados, crema y parmesano.', 3, 10, 18, 28
    UNION ALL SELECT 'published', 'medium', 'comidas', 'Albondigas en salsa chipotle', 'albondigas-en-salsa-chipotle', 'Albondigas jugosas con salsa picante.', 'Bolitas de carne cocidas en salsa de tomate con toque de chipotle.', 4, 20, 25, 45
    UNION ALL SELECT 'published', 'easy', 'comidas', 'Filete de pescado al ajillo', 'filete-de-pescado-al-ajillo', 'Pescado rapido al sarten.', 'Filete de pescado blanco dorado con ajo y limon, servido con arroz.', 2, 10, 15, 25
    UNION ALL SELECT 'published', 'medium', 'comidas', 'Fajitas de res con pimientos', 'fajitas-de-res-con-pimientos', 'Tiras de res salteadas y jugosas.', 'Res y pimientos salteados para servir en tortillas de harina.', 3, 15, 15, 30
    UNION ALL SELECT 'published', 'easy', 'comidas', 'Ensalada de garbanzos', 'ensalada-de-garbanzos', 'Opcion fresca con proteina vegetal.', 'Ensalada de garbanzos con pepino, tomate y aderezo de limon.', 2, 12, 0, 12
    UNION ALL SELECT 'published', 'easy', 'cenas', 'Crema de calabaza', 'crema-de-calabaza', 'Crema tibia de textura suave.', 'Calabaza cocida y licuada con leche, cebolla y ajo.', 3, 10, 20, 30
    UNION ALL SELECT 'published', 'easy', 'cenas', 'Tostadas de pollo', 'tostadas-de-pollo', 'Cena practica con pollo deshebrado.', 'Tostadas con pollo, crema, tomate y lechuga fresca.', 3, 12, 10, 22
    UNION ALL SELECT 'published', 'easy', 'cenas', 'Ensalada Cesar con pollo', 'ensalada-cesar-con-pollo', 'Ensalada fresca y rendidora.', 'Lechuga con pollo dorado, crutones y parmesano.', 2, 15, 10, 25
    UNION ALL SELECT 'published', 'easy', 'cenas', 'Tacos de frijol y queso', 'tacos-de-frijol-y-queso', 'Cena economica y reconfortante.', 'Tortillas rellenas de frijol y queso con salsa verde.', 3, 10, 10, 20
    UNION ALL SELECT 'published', 'easy', 'cenas', 'Sandwich caprese', 'sandwich-caprese', 'Sandwich fresco de inspiracion italiana.', 'Pan integral con tomate, queso crema y aceite de oliva.', 1, 8, 4, 12
    UNION ALL SELECT 'published', 'easy', 'cenas', 'Wraps de atun', 'wraps-de-atun', 'Wrap rapido para una noche ligera.', 'Tortillas de harina rellenas con atun, lechuga, tomate y queso crema.', 2, 10, 0, 10
    UNION ALL SELECT 'published', 'easy', 'cenas', 'Arroz con verduras y huevo', 'arroz-con-verduras-y-huevo', 'Salteado sencillo de sartencita.', 'Arroz salteado con huevo, zanahoria y pimiento rojo.', 2, 10, 10, 20
    UNION ALL SELECT 'published', 'easy', 'cenas', 'Sopa de tomate', 'sopa-de-tomate', 'Sopa ligera y aromatica.', 'Tomates cocidos con ajo y cebolla, licuados con un toque de crema.', 3, 10, 18, 28
    UNION ALL SELECT 'published', 'easy', 'cenas', 'Quesadillas de flor de calabaza', 'quesadillas-de-flor-de-calabaza', 'Quesadillas suaves y florales.', 'Flor de calabaza salteada con cebolla y queso en tortilla de maiz.', 2, 10, 10, 20
    UNION ALL SELECT 'published', 'easy', 'cenas', 'Ensalada de quinoa', 'ensalada-de-quinoa', 'Ensalada completa y colorida.', 'Quinoa mezclada con pepino, tomate, aguacate y limon.', 2, 15, 0, 15
    UNION ALL SELECT 'published', 'easy', 'postres', 'Arroz con leche', 'arroz-con-leche', 'Postre casero clasico.', 'Arroz cocido lentamente en leche con canela y azucar.', 4, 10, 30, 40
    UNION ALL SELECT 'published', 'easy', 'postres', 'Gelatina de fresa', 'gelatina-de-fresa', 'Postre fresco y brillante.', 'Gelatina ligera preparada con fresas licuadas, limon y grenetina.', 4, 15, 0, 15
    UNION ALL SELECT 'published', 'easy', 'postres', 'Manzanas con canela al horno', 'manzanas-con-canela-al-horno', 'Fruta horneada muy reconfortante.', 'Manzanas horneadas con miel, mantequilla y canela.', 2, 10, 25, 35
    UNION ALL SELECT 'published', 'medium', 'postres', 'Mousse de chocolate', 'mousse-de-chocolate', 'Postre aireado y elegante.', 'Mousse cremoso de chocolate con vainilla y crema batida.', 4, 20, 0, 20
    UNION ALL SELECT 'published', 'easy', 'postres', 'Pay de limon en vaso', 'pay-de-limon-en-vaso', 'Postre rapido sin horno.', 'Capas de galleta y crema acida de limon servidas en vaso.', 4, 15, 0, 15
    UNION ALL SELECT 'published', 'easy', 'postres', 'Platanos con miel y nuez', 'platanos-con-miel-y-nuez', 'Postre express con fruta.', 'Platanos salteados ligeramente con miel, canela y frutos secos.', 2, 5, 6, 11
    UNION ALL SELECT 'published', 'easy', 'postres', 'Avena horneada con manzana', 'avena-horneada-con-manzana', 'Desayuno dulce que funciona como postre.', 'Avena mezclada con leche, manzana y canela horneada hasta dorar.', 4, 10, 25, 35
    UNION ALL SELECT 'published', 'easy', 'postres', 'Yogurt con mango', 'yogurt-con-mango', 'Copa dulce y muy fresca.', 'Yogurt natural servido con mango, miel y granola.', 2, 8, 0, 8
    UNION ALL SELECT 'published', 'easy', 'postres', 'Fresas con crema', 'fresas-con-crema', 'Clasico postre frio.', 'Fresas frescas mezcladas con crema dulce perfumada con vainilla.', 3, 10, 0, 10
    UNION ALL SELECT 'published', 'medium', 'postres', 'Brownies caseros', 'brownies-caseros', 'Brownies humedos de chocolate.', 'Cuadros horneados de chocolate, mantequilla y huevo.', 6, 15, 25, 40
    UNION ALL SELECT 'published', 'easy', 'bebidas', 'Agua de limon', 'agua-de-limon', 'Agua fresca citrica y clasica.', 'Bebida refrescante con limon y azucar.', 4, 10, 0, 10
    UNION ALL SELECT 'published', 'easy', 'bebidas', 'Licuado de platano', 'licuado-de-platano', 'Bebida cremosa para desayuno.', 'Licuado suave de platano con leche y canela.', 2, 5, 0, 5
    UNION ALL SELECT 'published', 'easy', 'bebidas', 'Smoothie verde', 'smoothie-verde', 'Batido tropical con hojas verdes.', 'Mezcla de espinaca, mango, pina y limon.', 2, 8, 0, 8
    UNION ALL SELECT 'published', 'easy', 'bebidas', 'Cafe frappe casero', 'cafe-frappe-casero', 'Cafe frio y espumoso.', 'Bebida de cafe soluble con leche, azucar y vainilla.', 2, 5, 0, 5
    UNION ALL SELECT 'published', 'easy', 'bebidas', 'Chocolate caliente', 'chocolate-caliente', 'Taza cremosa para dias frescos.', 'Chocolate derretido en leche con canela.', 2, 5, 8, 13
    UNION ALL SELECT 'published', 'easy', 'bebidas', 'Agua de jamaica', 'agua-de-jamaica', 'Bebida fresca de flor.', 'Infusion fria de jamaica endulzada con azucar y un toque de limon.', 4, 10, 10, 20
    UNION ALL SELECT 'published', 'easy', 'bebidas', 'Naranjada natural', 'naranjada-natural', 'Bebida citrica natural.', 'Jugo de naranja con limon y un poco de azucar.', 3, 8, 0, 8
    UNION ALL SELECT 'published', 'easy', 'bebidas', 'Te helado de durazno', 'te-helado-de-durazno', 'Bebida afrutada para servir fria.', 'Durazno licuado con limon y azucar en una bebida ligera.', 3, 10, 0, 10
    UNION ALL SELECT 'published', 'easy', 'bebidas', 'Licuado de fresa y avena', 'licuado-de-fresa-y-avena', 'Bebida completa y rendidora.', 'Fresas licuadas con leche, avena y miel.', 2, 5, 0, 5
    UNION ALL SELECT 'published', 'easy', 'bebidas', 'Malteada de vainilla', 'malteada-de-vainilla', 'Bebida cremosa de sabor dulce.', 'Leche con crema, vainilla y azucar batida hasta espumar.', 2, 5, 0, 5
    UNION ALL SELECT 'published', 'easy', 'snacks', 'Palomitas con mantequilla', 'palomitas-con-mantequilla', 'Botana basica para compartir.', 'Palomitas recien hechas con mantequilla y sal.', 4, 5, 8, 13
    UNION ALL SELECT 'published', 'easy', 'snacks', 'Hummus con bastones', 'hummus-con-bastones', 'Dip cremoso con vegetales frescos.', 'Pasta de garbanzo con ajo y limon servida con pepino.', 3, 10, 0, 10
    UNION ALL SELECT 'published', 'easy', 'snacks', 'Nachos con queso', 'nachos-con-queso', 'Nachos rapidos para botana.', 'Triangulos de tortilla con queso fundido, frijol y chile en polvo.', 3, 10, 8, 18
    UNION ALL SELECT 'published', 'easy', 'snacks', 'Pepinos con limon y chile', 'pepinos-con-limon-y-chile', 'Snack fresco y enchilado.', 'Pepino en rodajas con jugo de limon y chile en polvo.', 2, 5, 0, 5
    UNION ALL SELECT 'published', 'easy', 'snacks', 'Tostadas de aguacate', 'tostadas-de-aguacate', 'Botana suave y cremosa.', 'Pan tostado con aguacate machacado, limon y chile en polvo.', 2, 6, 4, 10
    UNION ALL SELECT 'published', 'easy', 'snacks', 'Mix de frutos secos', 'mix-de-frutos-secos', 'Botana dulce y crocante.', 'Frutos secos mezclados con miel y un toque de canela.', 4, 5, 0, 5
    UNION ALL SELECT 'published', 'easy', 'snacks', 'Crostinis de jitomate', 'crostinis-de-jitomate', 'Pan tostado con topping fresco.', 'Rebanadas crujientes de pan con tomate, ajo y aceite de oliva.', 3, 8, 6, 14
    UNION ALL SELECT 'published', 'easy', 'snacks', 'Rollitos de jamon y queso', 'rollitos-de-jamon-y-queso', 'Botana fria y facil de armar.', 'Rebanadas de jamon rellenas con queso crema y queso rallado.', 3, 8, 0, 8
    UNION ALL SELECT 'published', 'easy', 'snacks', 'Chips de camote', 'chips-de-camote', 'Botana horneada con toque salado.', 'Laminas finas de camote doradas con aceite de oliva.', 3, 10, 20, 30
    UNION ALL SELECT 'published', 'easy', 'snacks', 'Brochetas de fruta', 'brochetas-de-fruta', 'Fruta fresca en version divertida.', 'Brochetas de fresa, mango y pina con un toque de miel.', 3, 10, 0, 10
) AS src
JOIN catalog_recipe_statuses AS rs
    ON rs.code = src.status_code
JOIN catalog_recipe_difficulties AS rd
    ON rd.code = src.difficulty_code
JOIN recipe_categories AS rc
    ON rc.slug = src.category_slug;

INSERT IGNORE INTO recipe_steps (recipe_id, step_number, instruction, estimated_minutes)
SELECT
    r.recipe_id,
    1,
    CASE rc.slug
        WHEN 'desayunos' THEN CONCAT('Prepara y organiza los ingredientes de ', r.title, ' para trabajar con rapidez.')
        WHEN 'comidas' THEN CONCAT('Lava, pica y sazona los ingredientes principales de ', r.title, '.')
        WHEN 'cenas' THEN CONCAT('Deja listos y porcionados los ingredientes de ', r.title, ' antes de cocinar.')
        WHEN 'postres' THEN CONCAT('Mide y prepara los ingredientes de ', r.title, ' para obtener una mezcla uniforme.')
        WHEN 'bebidas' THEN CONCAT('Prepara la fruta o la base principal de ', r.title, ' antes de mezclar.')
        WHEN 'snacks' THEN CONCAT('Prepara y acomoda los ingredientes de ', r.title, ' para un armado rapido.')
    END,
    5
FROM recipes AS r
JOIN recipe_categories AS rc ON rc.recipe_category_id = r.recipe_category_id;

INSERT IGNORE INTO recipe_steps (recipe_id, step_number, instruction, estimated_minutes)
SELECT
    r.recipe_id,
    2,
    CASE rc.slug
        WHEN 'desayunos' THEN 'Cocina o mezcla la preparacion principal hasta lograr la textura deseada.'
        WHEN 'comidas' THEN 'Cocina la preparacion a fuego medio y ajusta sal, pimienta o acidez segun sea necesario.'
        WHEN 'cenas' THEN 'Integra los ingredientes y cocina solo el tiempo suficiente para conservar sabor y textura.'
        WHEN 'postres' THEN 'Mezcla, hornea o enfria la preparacion segun el tipo de postre hasta que tome cuerpo.'
        WHEN 'bebidas' THEN 'Licua, bate o mezcla la bebida hasta que quede homogena y bien integrada.'
        WHEN 'snacks' THEN 'Arma, tuesta u hornea la botana hasta que tenga buen sabor y presentacion.'
    END,
    8
FROM recipes AS r
JOIN recipe_categories AS rc ON rc.recipe_category_id = r.recipe_category_id;

INSERT IGNORE INTO recipe_steps (recipe_id, step_number, instruction, estimated_minutes)
SELECT
    r.recipe_id,
    3,
    CASE rc.slug
        WHEN 'desayunos' THEN 'Sirve caliente o fresco segun corresponda y disfruta al momento.'
        WHEN 'comidas' THEN 'Sirve de inmediato y acompana con la guarnicion sugerida si aplica.'
        WHEN 'cenas' THEN 'Emplata y sirve en cuanto este listo para conservar su frescura.'
        WHEN 'postres' THEN 'Deja reposar o enfria si hace falta y sirve en porciones.'
        WHEN 'bebidas' THEN 'Sirve fria o caliente, segun el estilo de la bebida.'
        WHEN 'snacks' THEN 'Presenta la botana lista para compartir o consumir de inmediato.'
    END,
    3
FROM recipes AS r
JOIN recipe_categories AS rc ON rc.recipe_category_id = r.recipe_category_id;

INSERT IGNORE INTO recipe_ingredients (
    recipe_id,
    ingredient_id,
    measurement_unit_id,
    quantity,
    preparation_note,
    is_optional
)
SELECT
    r.recipe_id,
    i.ingredient_id,
    mu.measurement_unit_id,
    src.quantity,
    src.preparation_note,
    src.is_optional
FROM (
    SELECT 'huevos-revueltos-con-espinaca' AS recipe_slug, 'huevo' AS ingredient_slug, 'piece' AS unit_code, 3.00 AS quantity, '' AS preparation_note, 0 AS is_optional
    UNION ALL SELECT 'huevos-revueltos-con-espinaca', 'espinaca', 'cup', 1.00, '', 0
    UNION ALL SELECT 'huevos-revueltos-con-espinaca', 'cebolla', 'piece', 0.25, '', 0
    UNION ALL SELECT 'huevos-revueltos-con-espinaca', 'queso-manchego', 'gram', 40.00, '', 1
    UNION ALL SELECT 'avena-con-platano-y-canela', 'avena', 'cup', 1.00, '', 0
    UNION ALL SELECT 'avena-con-platano-y-canela', 'leche', 'milliliter', 250.00, '', 0
    UNION ALL SELECT 'avena-con-platano-y-canela', 'platano', 'piece', 1.00, '', 0
    UNION ALL SELECT 'avena-con-platano-y-canela', 'canela', 'teaspoon', 1.00, '', 0
    UNION ALL SELECT 'avena-con-platano-y-canela', 'miel', 'tablespoon', 1.00, '', 1
    UNION ALL SELECT 'quesadillas-de-champinon', 'tortilla-maiz', 'piece', 4.00, '', 0
    UNION ALL SELECT 'quesadillas-de-champinon', 'champinon', 'gram', 150.00, '', 0
    UNION ALL SELECT 'quesadillas-de-champinon', 'queso-manchego', 'gram', 100.00, '', 0
    UNION ALL SELECT 'quesadillas-de-champinon', 'cebolla', 'piece', 0.25, '', 0
    UNION ALL SELECT 'chilaquiles-verdes-ligeros', 'tortilla-maiz', 'piece', 6.00, '', 0
    UNION ALL SELECT 'chilaquiles-verdes-ligeros', 'salsa-verde', 'cup', 0.75, '', 0
    UNION ALL SELECT 'chilaquiles-verdes-ligeros', 'crema', 'tablespoon', 2.00, '', 1
    UNION ALL SELECT 'chilaquiles-verdes-ligeros', 'queso-manchego', 'gram', 60.00, '', 1
    UNION ALL SELECT 'chilaquiles-verdes-ligeros', 'cebolla', 'piece', 0.25, '', 1
    UNION ALL SELECT 'omelette-de-jamon-y-queso', 'huevo', 'piece', 3.00, '', 0
    UNION ALL SELECT 'omelette-de-jamon-y-queso', 'jamon', 'gram', 80.00, '', 0
    UNION ALL SELECT 'omelette-de-jamon-y-queso', 'queso-manchego', 'gram', 50.00, '', 0
    UNION ALL SELECT 'omelette-de-jamon-y-queso', 'cebolla', 'piece', 0.25, '', 1
    UNION ALL SELECT 'hotcakes-de-avena', 'avena', 'cup', 1.00, '', 0
    UNION ALL SELECT 'hotcakes-de-avena', 'huevo', 'piece', 2.00, '', 0
    UNION ALL SELECT 'hotcakes-de-avena', 'platano', 'piece', 1.00, '', 0
    UNION ALL SELECT 'hotcakes-de-avena', 'polvo-hornear', 'teaspoon', 1.00, '', 0
    UNION ALL SELECT 'hotcakes-de-avena', 'canela', 'teaspoon', 0.50, '', 1
    UNION ALL SELECT 'yogurt-con-fruta-y-granola', 'yogurt-natural', 'cup', 1.00, '', 0
    UNION ALL SELECT 'yogurt-con-fruta-y-granola', 'fresa', 'piece', 6.00, '', 0
    UNION ALL SELECT 'yogurt-con-fruta-y-granola', 'mango', 'piece', 1.00, '', 0
    UNION ALL SELECT 'yogurt-con-fruta-y-granola', 'granola', 'cup', 0.50, '', 0
    UNION ALL SELECT 'molletes-integrales', 'pan-integral', 'piece', 2.00, '', 0
    UNION ALL SELECT 'molletes-integrales', 'frijol', 'cup', 0.75, '', 0
    UNION ALL SELECT 'molletes-integrales', 'queso-manchego', 'gram', 80.00, '', 0
    UNION ALL SELECT 'molletes-integrales', 'tomate', 'piece', 0.50, '', 1
    UNION ALL SELECT 'sandwich-de-huevo-y-aguacate', 'pan-integral', 'piece', 2.00, '', 0
    UNION ALL SELECT 'sandwich-de-huevo-y-aguacate', 'huevo', 'piece', 2.00, '', 0
    UNION ALL SELECT 'sandwich-de-huevo-y-aguacate', 'aguacate', 'piece', 0.50, '', 0
    UNION ALL SELECT 'sandwich-de-huevo-y-aguacate', 'tomate', 'piece', 0.50, '', 1
    UNION ALL SELECT 'smoothie-bowl-tropical', 'mango', 'piece', 1.00, '', 0
    UNION ALL SELECT 'smoothie-bowl-tropical', 'pina', 'cup', 1.00, '', 0
    UNION ALL SELECT 'smoothie-bowl-tropical', 'yogurt-natural', 'cup', 1.00, '', 0
    UNION ALL SELECT 'smoothie-bowl-tropical', 'granola', 'cup', 0.25, '', 1
    UNION ALL SELECT 'pollo-al-limon-con-arroz', 'pollo', 'gram', 300.00, '', 0
    UNION ALL SELECT 'pollo-al-limon-con-arroz', 'limon', 'piece', 1.00, '', 0
    UNION ALL SELECT 'pollo-al-limon-con-arroz', 'arroz', 'cup', 1.00, '', 0
    UNION ALL SELECT 'pollo-al-limon-con-arroz', 'ajo', 'piece', 2.00, '', 0
    UNION ALL SELECT 'pollo-al-limon-con-arroz', 'aceite-oliva', 'tablespoon', 1.00, '', 0
    UNION ALL SELECT 'carne-con-papas', 'carne-res', 'gram', 300.00, '', 0
    UNION ALL SELECT 'carne-con-papas', 'papa', 'piece', 2.00, '', 0
    UNION ALL SELECT 'carne-con-papas', 'cebolla', 'piece', 0.50, '', 0
    UNION ALL SELECT 'carne-con-papas', 'tomate', 'piece', 1.00, '', 0
    UNION ALL SELECT 'carne-con-papas', 'ajo', 'piece', 2.00, '', 1
    UNION ALL SELECT 'enchiladas-de-pollo', 'tortilla-maiz', 'piece', 8.00, '', 0
    UNION ALL SELECT 'enchiladas-de-pollo', 'pollo', 'gram', 250.00, '', 0
    UNION ALL SELECT 'enchiladas-de-pollo', 'salsa-verde', 'cup', 1.00, '', 0
    UNION ALL SELECT 'enchiladas-de-pollo', 'crema', 'tablespoon', 2.00, '', 1
    UNION ALL SELECT 'enchiladas-de-pollo', 'queso-manchego', 'gram', 80.00, '', 1
    UNION ALL SELECT 'sopa-de-lentejas', 'lenteja', 'cup', 1.00, '', 0
    UNION ALL SELECT 'sopa-de-lentejas', 'zanahoria', 'piece', 1.00, '', 0
    UNION ALL SELECT 'sopa-de-lentejas', 'tomate', 'piece', 1.00, '', 0
    UNION ALL SELECT 'sopa-de-lentejas', 'cebolla', 'piece', 0.50, '', 0
    UNION ALL SELECT 'sopa-de-lentejas', 'ajo', 'piece', 2.00, '', 1
    UNION ALL SELECT 'arroz-frito-con-verduras', 'arroz', 'cup', 1.00, '', 0
    UNION ALL SELECT 'arroz-frito-con-verduras', 'huevo', 'piece', 2.00, '', 0
    UNION ALL SELECT 'arroz-frito-con-verduras', 'zanahoria', 'piece', 1.00, '', 0
    UNION ALL SELECT 'arroz-frito-con-verduras', 'pimiento-rojo', 'piece', 1.00, '', 0
    UNION ALL SELECT 'arroz-frito-con-verduras', 'cebolla', 'piece', 0.50, '', 1
    UNION ALL SELECT 'pasta-cremosa-con-champinon', 'pasta', 'gram', 250.00, '', 0
    UNION ALL SELECT 'pasta-cremosa-con-champinon', 'champinon', 'gram', 150.00, '', 0
    UNION ALL SELECT 'pasta-cremosa-con-champinon', 'crema', 'cup', 1.00, '', 0
    UNION ALL SELECT 'pasta-cremosa-con-champinon', 'parmesano', 'gram', 50.00, '', 0
    UNION ALL SELECT 'pasta-cremosa-con-champinon', 'ajo', 'piece', 2.00, '', 1
    UNION ALL SELECT 'albondigas-en-salsa-chipotle', 'carne-res', 'gram', 300.00, '', 0
    UNION ALL SELECT 'albondigas-en-salsa-chipotle', 'huevo', 'piece', 1.00, '', 0
    UNION ALL SELECT 'albondigas-en-salsa-chipotle', 'chipotle', 'tablespoon', 1.00, '', 0
    UNION ALL SELECT 'albondigas-en-salsa-chipotle', 'tomate', 'piece', 2.00, '', 0
    UNION ALL SELECT 'albondigas-en-salsa-chipotle', 'avena', 'cup', 0.25, '', 0
    UNION ALL SELECT 'filete-de-pescado-al-ajillo', 'pescado-blanco', 'gram', 300.00, '', 0
    UNION ALL SELECT 'filete-de-pescado-al-ajillo', 'ajo', 'piece', 3.00, '', 0
    UNION ALL SELECT 'filete-de-pescado-al-ajillo', 'limon', 'piece', 1.00, '', 0
    UNION ALL SELECT 'filete-de-pescado-al-ajillo', 'aceite-oliva', 'tablespoon', 1.00, '', 0
    UNION ALL SELECT 'filete-de-pescado-al-ajillo', 'arroz', 'cup', 1.00, '', 1
    UNION ALL SELECT 'fajitas-de-res-con-pimientos', 'carne-res', 'gram', 300.00, '', 0
    UNION ALL SELECT 'fajitas-de-res-con-pimientos', 'pimiento-rojo', 'piece', 1.00, '', 0
    UNION ALL SELECT 'fajitas-de-res-con-pimientos', 'cebolla', 'piece', 1.00, '', 0
    UNION ALL SELECT 'fajitas-de-res-con-pimientos', 'tortilla-harina', 'piece', 4.00, '', 0
    UNION ALL SELECT 'fajitas-de-res-con-pimientos', 'limon', 'piece', 1.00, '', 1
    UNION ALL SELECT 'ensalada-de-garbanzos', 'garbanzo', 'cup', 1.00, '', 0
    UNION ALL SELECT 'ensalada-de-garbanzos', 'pepino', 'piece', 1.00, '', 0
    UNION ALL SELECT 'ensalada-de-garbanzos', 'tomate', 'piece', 1.00, '', 0
    UNION ALL SELECT 'ensalada-de-garbanzos', 'limon', 'piece', 1.00, '', 0
    UNION ALL SELECT 'ensalada-de-garbanzos', 'aceite-oliva', 'tablespoon', 1.00, '', 1
) AS src
JOIN recipes AS r
    ON r.slug = src.recipe_slug
JOIN ingredients AS i
    ON i.slug = src.ingredient_slug
LEFT JOIN catalog_measurement_units AS mu
    ON mu.code = src.unit_code;

INSERT IGNORE INTO recipe_ingredients (
    recipe_id,
    ingredient_id,
    measurement_unit_id,
    quantity,
    preparation_note,
    is_optional
)
SELECT
    r.recipe_id,
    i.ingredient_id,
    mu.measurement_unit_id,
    src.quantity,
    src.preparation_note,
    src.is_optional
FROM (
    SELECT 'crema-de-calabaza' AS recipe_slug, 'calabaza' AS ingredient_slug, 'gram' AS unit_code, 400.00 AS quantity, '' AS preparation_note, 0 AS is_optional
    UNION ALL SELECT 'crema-de-calabaza', 'leche', 'milliliter', 250.00, '', 0
    UNION ALL SELECT 'crema-de-calabaza', 'cebolla', 'piece', 0.50, '', 0
    UNION ALL SELECT 'crema-de-calabaza', 'ajo', 'piece', 1.00, '', 0
    UNION ALL SELECT 'tostadas-de-pollo', 'tortilla-maiz', 'piece', 4.00, 'tostadas', 0
    UNION ALL SELECT 'tostadas-de-pollo', 'pollo', 'gram', 200.00, '', 0
    UNION ALL SELECT 'tostadas-de-pollo', 'lechuga', 'cup', 1.00, '', 0
    UNION ALL SELECT 'tostadas-de-pollo', 'crema', 'tablespoon', 2.00, '', 1
    UNION ALL SELECT 'tostadas-de-pollo', 'tomate', 'piece', 1.00, '', 1
    UNION ALL SELECT 'ensalada-cesar-con-pollo', 'pollo', 'gram', 200.00, '', 0
    UNION ALL SELECT 'ensalada-cesar-con-pollo', 'lechuga', 'cup', 2.00, '', 0
    UNION ALL SELECT 'ensalada-cesar-con-pollo', 'parmesano', 'gram', 40.00, '', 0
    UNION ALL SELECT 'ensalada-cesar-con-pollo', 'pan-integral', 'piece', 2.00, 'para crutones', 0
    UNION ALL SELECT 'ensalada-cesar-con-pollo', 'aceite-oliva', 'tablespoon', 1.00, '', 1
    UNION ALL SELECT 'tacos-de-frijol-y-queso', 'tortilla-maiz', 'piece', 6.00, '', 0
    UNION ALL SELECT 'tacos-de-frijol-y-queso', 'frijol', 'cup', 1.00, '', 0
    UNION ALL SELECT 'tacos-de-frijol-y-queso', 'queso-manchego', 'gram', 80.00, '', 0
    UNION ALL SELECT 'tacos-de-frijol-y-queso', 'salsa-verde', 'cup', 0.50, '', 1
    UNION ALL SELECT 'sandwich-caprese', 'pan-integral', 'piece', 2.00, '', 0
    UNION ALL SELECT 'sandwich-caprese', 'tomate', 'piece', 1.00, '', 0
    UNION ALL SELECT 'sandwich-caprese', 'queso-crema', 'gram', 50.00, '', 0
    UNION ALL SELECT 'sandwich-caprese', 'aceite-oliva', 'tablespoon', 1.00, '', 1
    UNION ALL SELECT 'wraps-de-atun', 'tortilla-harina', 'piece', 2.00, '', 0
    UNION ALL SELECT 'wraps-de-atun', 'atun', 'gram', 150.00, '', 0
    UNION ALL SELECT 'wraps-de-atun', 'lechuga', 'cup', 1.00, '', 0
    UNION ALL SELECT 'wraps-de-atun', 'tomate', 'piece', 1.00, '', 0
    UNION ALL SELECT 'wraps-de-atun', 'queso-crema', 'tablespoon', 2.00, '', 1
    UNION ALL SELECT 'arroz-con-verduras-y-huevo', 'arroz', 'cup', 1.00, '', 0
    UNION ALL SELECT 'arroz-con-verduras-y-huevo', 'huevo', 'piece', 2.00, '', 0
    UNION ALL SELECT 'arroz-con-verduras-y-huevo', 'zanahoria', 'piece', 1.00, '', 0
    UNION ALL SELECT 'arroz-con-verduras-y-huevo', 'pimiento-rojo', 'piece', 1.00, '', 0
    UNION ALL SELECT 'sopa-de-tomate', 'tomate', 'piece', 4.00, '', 0
    UNION ALL SELECT 'sopa-de-tomate', 'ajo', 'piece', 2.00, '', 0
    UNION ALL SELECT 'sopa-de-tomate', 'cebolla', 'piece', 0.50, '', 0
    UNION ALL SELECT 'sopa-de-tomate', 'crema', 'cup', 0.25, '', 1
    UNION ALL SELECT 'quesadillas-de-flor-de-calabaza', 'tortilla-maiz', 'piece', 4.00, '', 0
    UNION ALL SELECT 'quesadillas-de-flor-de-calabaza', 'flor-calabaza', 'gram', 120.00, '', 0
    UNION ALL SELECT 'quesadillas-de-flor-de-calabaza', 'queso-manchego', 'gram', 80.00, '', 0
    UNION ALL SELECT 'quesadillas-de-flor-de-calabaza', 'cebolla', 'piece', 0.25, '', 1
    UNION ALL SELECT 'ensalada-de-quinoa', 'quinoa', 'cup', 1.00, '', 0
    UNION ALL SELECT 'ensalada-de-quinoa', 'pepino', 'piece', 1.00, '', 0
    UNION ALL SELECT 'ensalada-de-quinoa', 'tomate', 'piece', 1.00, '', 0
    UNION ALL SELECT 'ensalada-de-quinoa', 'aguacate', 'piece', 0.50, '', 0
    UNION ALL SELECT 'ensalada-de-quinoa', 'limon', 'piece', 1.00, '', 1
    UNION ALL SELECT 'arroz-con-leche', 'arroz', 'cup', 0.75, '', 0
    UNION ALL SELECT 'arroz-con-leche', 'leche', 'milliliter', 500.00, '', 0
    UNION ALL SELECT 'arroz-con-leche', 'canela', 'teaspoon', 1.00, '', 0
    UNION ALL SELECT 'arroz-con-leche', 'azucar', 'tablespoon', 4.00, '', 0
    UNION ALL SELECT 'gelatina-de-fresa', 'fresa', 'piece', 12.00, '', 0
    UNION ALL SELECT 'gelatina-de-fresa', 'azucar', 'tablespoon', 3.00, '', 0
    UNION ALL SELECT 'gelatina-de-fresa', 'grenetina', 'tablespoon', 1.00, '', 0
    UNION ALL SELECT 'gelatina-de-fresa', 'limon', 'piece', 1.00, '', 1
    UNION ALL SELECT 'manzanas-con-canela-al-horno', 'manzana', 'piece', 2.00, '', 0
    UNION ALL SELECT 'manzanas-con-canela-al-horno', 'canela', 'teaspoon', 1.00, '', 0
    UNION ALL SELECT 'manzanas-con-canela-al-horno', 'miel', 'tablespoon', 2.00, '', 0
    UNION ALL SELECT 'manzanas-con-canela-al-horno', 'mantequilla', 'tablespoon', 1.00, '', 1
    UNION ALL SELECT 'mousse-de-chocolate', 'chocolate', 'gram', 150.00, '', 0
    UNION ALL SELECT 'mousse-de-chocolate', 'crema', 'cup', 1.00, '', 0
    UNION ALL SELECT 'mousse-de-chocolate', 'azucar', 'tablespoon', 2.00, '', 0
    UNION ALL SELECT 'mousse-de-chocolate', 'vainilla', 'teaspoon', 1.00, '', 1
    UNION ALL SELECT 'pay-de-limon-en-vaso', 'galleta-maria', 'piece', 10.00, '', 0
    UNION ALL SELECT 'pay-de-limon-en-vaso', 'yogurt-natural', 'cup', 1.00, '', 0
    UNION ALL SELECT 'pay-de-limon-en-vaso', 'limon', 'piece', 2.00, '', 0
    UNION ALL SELECT 'pay-de-limon-en-vaso', 'azucar', 'tablespoon', 2.00, '', 1
    UNION ALL SELECT 'platanos-con-miel-y-nuez', 'platano', 'piece', 2.00, '', 0
    UNION ALL SELECT 'platanos-con-miel-y-nuez', 'miel', 'tablespoon', 2.00, '', 0
    UNION ALL SELECT 'platanos-con-miel-y-nuez', 'frutos-secos', 'cup', 0.25, '', 1
    UNION ALL SELECT 'platanos-con-miel-y-nuez', 'canela', 'teaspoon', 0.50, '', 1
    UNION ALL SELECT 'avena-horneada-con-manzana', 'avena', 'cup', 1.00, '', 0
    UNION ALL SELECT 'avena-horneada-con-manzana', 'manzana', 'piece', 1.00, '', 0
    UNION ALL SELECT 'avena-horneada-con-manzana', 'canela', 'teaspoon', 1.00, '', 0
    UNION ALL SELECT 'avena-horneada-con-manzana', 'leche', 'milliliter', 250.00, '', 0
    UNION ALL SELECT 'avena-horneada-con-manzana', 'miel', 'tablespoon', 1.00, '', 1
    UNION ALL SELECT 'yogurt-con-mango', 'yogurt-natural', 'cup', 1.00, '', 0
    UNION ALL SELECT 'yogurt-con-mango', 'mango', 'piece', 1.00, '', 0
    UNION ALL SELECT 'yogurt-con-mango', 'miel', 'tablespoon', 1.00, '', 1
    UNION ALL SELECT 'yogurt-con-mango', 'granola', 'cup', 0.25, '', 1
    UNION ALL SELECT 'fresas-con-crema', 'fresa', 'piece', 15.00, '', 0
    UNION ALL SELECT 'fresas-con-crema', 'crema', 'cup', 0.75, '', 0
    UNION ALL SELECT 'fresas-con-crema', 'azucar', 'tablespoon', 2.00, '', 1
    UNION ALL SELECT 'fresas-con-crema', 'vainilla', 'teaspoon', 0.50, '', 1
    UNION ALL SELECT 'brownies-caseros', 'harina-trigo', 'cup', 1.00, '', 0
    UNION ALL SELECT 'brownies-caseros', 'chocolate', 'gram', 150.00, '', 0
    UNION ALL SELECT 'brownies-caseros', 'mantequilla', 'gram', 100.00, '', 0
    UNION ALL SELECT 'brownies-caseros', 'azucar', 'cup', 0.50, '', 0
    UNION ALL SELECT 'brownies-caseros', 'huevo', 'piece', 2.00, '', 0
) AS src
JOIN recipes AS r
    ON r.slug = src.recipe_slug
JOIN ingredients AS i
    ON i.slug = src.ingredient_slug
LEFT JOIN catalog_measurement_units AS mu
    ON mu.code = src.unit_code;

INSERT IGNORE INTO recipe_ingredients (
    recipe_id,
    ingredient_id,
    measurement_unit_id,
    quantity,
    preparation_note,
    is_optional
)
SELECT
    r.recipe_id,
    i.ingredient_id,
    mu.measurement_unit_id,
    src.quantity,
    src.preparation_note,
    src.is_optional
FROM (
    SELECT 'agua-de-limon' AS recipe_slug, 'limon' AS ingredient_slug, 'piece' AS unit_code, 4.00 AS quantity, '' AS preparation_note, 0 AS is_optional
    UNION ALL SELECT 'agua-de-limon', 'azucar', 'tablespoon', 4.00, '', 1
    UNION ALL SELECT 'licuado-de-platano', 'platano', 'piece', 2.00, '', 0
    UNION ALL SELECT 'licuado-de-platano', 'leche', 'milliliter', 300.00, '', 0
    UNION ALL SELECT 'licuado-de-platano', 'canela', 'teaspoon', 0.50, '', 1
    UNION ALL SELECT 'smoothie-verde', 'espinaca', 'cup', 1.00, '', 0
    UNION ALL SELECT 'smoothie-verde', 'mango', 'piece', 1.00, '', 0
    UNION ALL SELECT 'smoothie-verde', 'pina', 'cup', 1.00, '', 0
    UNION ALL SELECT 'smoothie-verde', 'limon', 'piece', 1.00, '', 1
    UNION ALL SELECT 'cafe-frappe-casero', 'cafe-soluble', 'teaspoon', 2.00, '', 0
    UNION ALL SELECT 'cafe-frappe-casero', 'leche', 'milliliter', 250.00, '', 0
    UNION ALL SELECT 'cafe-frappe-casero', 'azucar', 'tablespoon', 2.00, '', 1
    UNION ALL SELECT 'cafe-frappe-casero', 'vainilla', 'teaspoon', 0.50, '', 1
    UNION ALL SELECT 'chocolate-caliente', 'chocolate', 'gram', 100.00, '', 0
    UNION ALL SELECT 'chocolate-caliente', 'leche', 'milliliter', 300.00, '', 0
    UNION ALL SELECT 'chocolate-caliente', 'canela', 'teaspoon', 0.50, '', 1
    UNION ALL SELECT 'chocolate-caliente', 'azucar', 'tablespoon', 1.00, '', 1
    UNION ALL SELECT 'agua-de-jamaica', 'jamaica', 'cup', 0.50, '', 0
    UNION ALL SELECT 'agua-de-jamaica', 'azucar', 'tablespoon', 4.00, '', 1
    UNION ALL SELECT 'agua-de-jamaica', 'limon', 'piece', 1.00, '', 1
    UNION ALL SELECT 'naranjada-natural', 'naranja', 'piece', 3.00, '', 0
    UNION ALL SELECT 'naranjada-natural', 'limon', 'piece', 1.00, '', 1
    UNION ALL SELECT 'naranjada-natural', 'azucar', 'tablespoon', 2.00, '', 1
    UNION ALL SELECT 'te-helado-de-durazno', 'durazno', 'piece', 2.00, '', 0
    UNION ALL SELECT 'te-helado-de-durazno', 'azucar', 'tablespoon', 2.00, '', 1
    UNION ALL SELECT 'te-helado-de-durazno', 'limon', 'piece', 1.00, '', 1
    UNION ALL SELECT 'licuado-de-fresa-y-avena', 'fresa', 'piece', 8.00, '', 0
    UNION ALL SELECT 'licuado-de-fresa-y-avena', 'avena', 'cup', 0.25, '', 0
    UNION ALL SELECT 'licuado-de-fresa-y-avena', 'leche', 'milliliter', 300.00, '', 0
    UNION ALL SELECT 'licuado-de-fresa-y-avena', 'miel', 'tablespoon', 1.00, '', 1
    UNION ALL SELECT 'malteada-de-vainilla', 'leche', 'milliliter', 300.00, '', 0
    UNION ALL SELECT 'malteada-de-vainilla', 'vainilla', 'teaspoon', 1.00, '', 0
    UNION ALL SELECT 'malteada-de-vainilla', 'azucar', 'tablespoon', 2.00, '', 1
    UNION ALL SELECT 'malteada-de-vainilla', 'crema', 'tablespoon', 2.00, '', 1
    UNION ALL SELECT 'palomitas-con-mantequilla', 'maiz-palomero', 'cup', 0.50, '', 0
    UNION ALL SELECT 'palomitas-con-mantequilla', 'mantequilla', 'tablespoon', 2.00, '', 0
    UNION ALL SELECT 'palomitas-con-mantequilla', 'sal', 'teaspoon', 0.50, '', 1
    UNION ALL SELECT 'hummus-con-bastones', 'garbanzo', 'cup', 1.00, '', 0
    UNION ALL SELECT 'hummus-con-bastones', 'ajo', 'piece', 1.00, '', 0
    UNION ALL SELECT 'hummus-con-bastones', 'limon', 'piece', 1.00, '', 0
    UNION ALL SELECT 'hummus-con-bastones', 'aceite-oliva', 'tablespoon', 1.00, '', 0
    UNION ALL SELECT 'hummus-con-bastones', 'pepino', 'piece', 1.00, 'en bastones', 1
    UNION ALL SELECT 'nachos-con-queso', 'tortilla-maiz', 'piece', 6.00, '', 0
    UNION ALL SELECT 'nachos-con-queso', 'queso-manchego', 'gram', 80.00, '', 0
    UNION ALL SELECT 'nachos-con-queso', 'frijol', 'cup', 0.50, '', 1
    UNION ALL SELECT 'nachos-con-queso', 'chile-polvo', 'teaspoon', 0.50, '', 1
    UNION ALL SELECT 'pepinos-con-limon-y-chile', 'pepino', 'piece', 2.00, '', 0
    UNION ALL SELECT 'pepinos-con-limon-y-chile', 'limon', 'piece', 1.00, '', 0
    UNION ALL SELECT 'pepinos-con-limon-y-chile', 'chile-polvo', 'teaspoon', 1.00, '', 1
    UNION ALL SELECT 'tostadas-de-aguacate', 'pan-integral', 'piece', 2.00, '', 0
    UNION ALL SELECT 'tostadas-de-aguacate', 'aguacate', 'piece', 1.00, '', 0
    UNION ALL SELECT 'tostadas-de-aguacate', 'limon', 'piece', 0.50, '', 1
    UNION ALL SELECT 'tostadas-de-aguacate', 'chile-polvo', 'teaspoon', 0.50, '', 1
    UNION ALL SELECT 'mix-de-frutos-secos', 'frutos-secos', 'cup', 1.00, '', 0
    UNION ALL SELECT 'mix-de-frutos-secos', 'miel', 'tablespoon', 1.00, '', 1
    UNION ALL SELECT 'mix-de-frutos-secos', 'canela', 'teaspoon', 0.25, '', 1
    UNION ALL SELECT 'crostinis-de-jitomate', 'pan-integral', 'piece', 4.00, '', 0
    UNION ALL SELECT 'crostinis-de-jitomate', 'tomate', 'piece', 2.00, '', 0
    UNION ALL SELECT 'crostinis-de-jitomate', 'aceite-oliva', 'tablespoon', 1.00, '', 0
    UNION ALL SELECT 'crostinis-de-jitomate', 'ajo', 'piece', 1.00, '', 1
    UNION ALL SELECT 'rollitos-de-jamon-y-queso', 'jamon', 'gram', 120.00, '', 0
    UNION ALL SELECT 'rollitos-de-jamon-y-queso', 'queso-manchego', 'gram', 80.00, '', 0
    UNION ALL SELECT 'rollitos-de-jamon-y-queso', 'queso-crema', 'tablespoon', 2.00, '', 1
    UNION ALL SELECT 'chips-de-camote', 'camote', 'piece', 2.00, '', 0
    UNION ALL SELECT 'chips-de-camote', 'aceite-oliva', 'tablespoon', 1.00, '', 0
    UNION ALL SELECT 'chips-de-camote', 'sal', 'teaspoon', 0.50, '', 1
    UNION ALL SELECT 'brochetas-de-fruta', 'fresa', 'piece', 8.00, '', 0
    UNION ALL SELECT 'brochetas-de-fruta', 'mango', 'piece', 1.00, '', 0
    UNION ALL SELECT 'brochetas-de-fruta', 'pina', 'cup', 1.00, '', 0
    UNION ALL SELECT 'brochetas-de-fruta', 'miel', 'tablespoon', 1.00, '', 1
) AS src
JOIN recipes AS r
    ON r.slug = src.recipe_slug
JOIN ingredients AS i
    ON i.slug = src.ingredient_slug
LEFT JOIN catalog_measurement_units AS mu
    ON mu.code = src.unit_code;
