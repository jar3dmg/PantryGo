Manual Técnico: Sistema "Recetario Dinámico"

Versión: 1.0 (Prototipo Funcional)
Fecha: 17 de noviembre de 2025
Autor: Jesús Alejandro Sandoval Castro

1. Introducción

1.1 Propósito del Sistema

El "Recetario Dinámico" es una aplicación web diseñada para resolver el problema común de "¿qué puedo cocinar con lo que tengo?". El sistema permite a los usuarios ingresar una lista de ingredientes que poseen y, a cambio, genera una lista de recetas que pueden preparar (coincidencia total) y una lista de sugerencias (coincidencia parcial, faltando 1-2 ingredientes).

1.2 Propósito del Manual

Este manual técnico proporciona una visión detallada de la arquitectura del sistema, los requerimientos técnicos, el modelo de datos (actual y futuro), y la lógica de los algoritmos clave implementados. Está dirigido a desarrolladores, personal de mantenimiento y evaluadores que necesiten comprender la configuración y el funcionamiento interno del prototipo.

2. Requerimientos Técnicos

Este sistema es una aplicación web ligera basada en Python.

2.1 Requerimientos de Software (Servidor)

Entorno de Ejecución: Python 3.7+

Framework Web: Flask (versión 2.x o superior)

Dependencias de Python: Ninguna otra dependencia (solo la biblioteca estándar csv, ast, re). Se recomienda gestionar las dependencias a través de un archivo requirements.txt.

2.2 Requerimientos de Datos (Fuente)

Archivo de Base de Datos: recipes.csv (o el nombre especificado en app.py).

Formato Esperado: Archivo CSV con cabeceras, que debe incluir como mínimo: recipe_title, ingredients, description, y directions.

2.3 Requerimientos de Software (Cliente)

Tipo: Navegador web moderno.

Ejemplos: Google Chrome (recomendado), Mozilla Firefox, Microsoft Edge.

Funcionalidad Requerida: Habilitación de JavaScript (para la interactividad de la interfaz, como la paginación y los acordeones) y soporte de localStorage (para la persistencia de la "Despensa").

3. Arquitectura y Vistas del Sistema

3.1 Vista Lógica (Arquitectura)

El sistema sigue una arquitectura de Cliente-Servidor simple.

Servidor (Back-End): Una aplicación monolítica de Flask (app.py). Es responsable de toda la lógica de negocio, el procesamiento de datos y el renderizado de las plantillas.

Cliente (Front-End): Plantillas HTML (index.html, results.html) renderizadas por el servidor. Utiliza JavaScript del lado del cliente para mejorar la experiencia del usuario (interactividad, paginación) y Tailwind CSS para el estilo.

Fuente de Datos: Un archivo recipes.csv local que se carga en la memoria del servidor al arrancar.

3.2 Vista Funcional (Flujo de Datos)

El flujo de datos principal del sistema es el siguiente:

Carga Inicial: El servidor Flask se inicia, ejecuta la función load_recipes() una sola vez y carga toda la base de datos recipes.csv en una variable global en memoria (ALL_RECIPES_DB).

Solicitud de Inicio: El usuario navega a la ruta raíz (/). El servidor renderiza y devuelve index.html.

Envío de Datos: El usuario escribe ingredientes en el textarea (cuyo contenido se guarda en localStorage por JavaScript) y presiona "Planificar". El formulario envía una solicitud POST a la ruta /plan.

Procesamiento del Back-End:
a.  La ruta /plan en app.py recibe la solicitud.
b.  Extrae los ingredientes crudos de request.form['ingredients'].
c.  Limpia la entrada del usuario (minúsculas, strip(), etc.).
d.  Llama a la función find_meal_plan(), pasándole los ingredientes del usuario y la base de datos en memoria (ALL_RECIPES_DB).

Respuesta del Back-End:
a.  find_meal_plan() devuelve dos listas: can_make_list y suggestions_list.
b.  El servidor renderiza la plantilla results.html, inyectando estas dos listas en el HTML.

Interactividad del Cliente: results.html se carga en el navegador del usuario. Sus scripts de JavaScript se ejecutan para manejar los acordeones desplegables y la paginación de la lista de sugerencias.

4. Modelo de Datos

4.1 Modelo Lógico y Físico (Prototipo Actual)

Dado que es un prototipo, el modelo de datos es una representación física simple de un archivo plano.

Modelo Físico: Un único archivo recipes.csv.

Modelo Lógico (Asumido): Se asume que el recipes.csv contiene las siguientes columnas (cabeceras) que son leídas por csv.DictReader:

recipe_title (String): El nombre de la receta.

ingredients (String): Un string que representa una lista de Python (ej. ["ing1", "ing2"]).

description (String): Texto descriptivo de la receta.

directions (String): Un string que representa una lista de los pasos.

4.2 Modelo Lógico (Diseño Futuro/Ideal)

El modelo actual no es escalable. La investigación teórica del sistema (documentada previamente) ha producido un Modelo Entidad-Relación para la migración a una base de datos SQL.

Entidades: Receta, Ingrediente, Usuario.

Relaciones:

Receta_Ingrediente (Tabla de Unión N:M): Resuelve la relación de "Receta usa Ingredientes" y almacena la cantidad.

Despensa_Usuario (Tabla de Unión N:M): Reemplaza la funcionalidad de localStorage para permitir que una Despensa (lista de ingredientes) sea persistente y accesible desde cualquier dispositivo para un Usuario.

¡Absolutamente! Qué raro lo que comentas. Aquí va el texto plano de esa sección, con las correcciones de formato que detecté.

Simplemente copia y pega esto después de la Parte 2.

5. Algoritmos Clave y Lógica de Desarrollo

La lógica central del sistema reside en tres algoritmos principales.

5.1 Algoritmo 1: Limpieza de Ingredientes (Back-End)

Propósito: Convertir un ingrediente crudo de la base de datos (ej. "1 1/2 cups packed brown sugar") en un término de búsqueda limpio (ej. "brown sugar").

Archivo: app.py Función: clean_ingredient(raw_string)

Lógica:

    Convierte todo a minúsculas.

    Utiliza Expresiones Regulares (Regex) para eliminar números, fracciones y contenido entre paréntesis al inicio.

    Divide el string en palabras.

    Itera sobre cada palabra y la descarta si se encuentra en una lista predefinida de units (ej. "cup", "tbsp") o descriptors (ej. "packed", "chopped").

    Vuelve a unir las palabras restantes y limpia espacios.

    Fragmento de Código para Evidencia:
    
def clean_ingredient(raw_string):
    """
    Toma un string de ingrediente crudo (ej: '3/4 cup ketchup')
    y devuelve el nombre limpio (ej: 'ketchup').
    """
    s = raw_string.lower()
    
    # Lista de palabras comunes a ignorar
    units = ['cup', 'c.', 'cups', 'tablespoon', 'tbsp', 'teaspoon', 'tsp', 
             'ounce', 'oz', 'pound', 'lb', 'lbs', 'gram', 'g', 'kg', 'ml', 'l',
             'clove', 'cloves', 'pinch', 'dash', 'package', 'pkg', 'can']
             
    descriptors = ['packed', 'chopped', 'diced', 'minced', 'melted', 
                   'fresh', 'dry', 'ground', 'sliced', 'firmly', 
                   'softened', 'beaten', 'shredded', 'optional', 'to taste',
                   'large', 'medium', 'small', 'thin', 'thick']
Quitar paréntesis y su contenido (ej: "(opcional)")
words = s.split()
clean_words = []
for word in words:
    word_cleaned = word.strip(',.') # Quitar comas/puntos pegados
    if word_cleaned not in units and word_cleaned not in descriptors:
        clean_words.append(word_cleaned)
        
4. Re-unir y limpiar espacios extra

final_name = ' '.join(clean_words)


5. Quitar " and " (ej: "salt and pepper" -> "salt pepper")

    Esto ayuda a que "sal" y "pimienta" coincidan por separado.

    final_name = final_name.replace(' and ', ' ')

    return final_name.strip()
¡Absolutamente! Qué raro lo que comentas. Aquí va el texto plano de esa sección, con las correcciones de formato que detecté.

Simplemente copia y pega esto después de la Parte 2.

5. Algoritmos Clave y Lógica de Desarrollo

La lógica central del sistema reside en tres algoritmos principales.

5.1 Algoritmo 1: Limpieza de Ingredientes (Back-End)

Propósito: Convertir un ingrediente crudo de la base de datos (ej. "1 1/2 cups packed brown sugar") en un término de búsqueda limpio (ej. "brown sugar").

Archivo: app.py Función: clean_ingredient(raw_string)

Lógica:

    Convierte todo a minúsculas.

    Utiliza Expresiones Regulares (Regex) para eliminar números, fracciones y contenido entre paréntesis al inicio.

    Divide el string en palabras.

    Itera sobre cada palabra y la descarta si se encuentra en una lista predefinida de units (ej. "cup", "tbsp") o descriptors (ej. "packed", "chopped").

    Vuelve a unir las palabras restantes y limpia espacios.

    Fragmento de Código para Evidencia: Se recomienda capturar la función clean_ingredient completa. Es el mejor ejemplo de la lógica de limpieza de datos personalizada del sistema.
    Python

    def clean_ingredient(raw_string):
        """
        Toma un string de ingrediente crudo (ej: '3/4 cup ketchup')
        y devuelve el nombre limpio (ej: 'ketchup').
        """
        s = raw_string.lower()
        
        # Lista de palabras comunes a ignorar
        units = ['cup', 'c.', 'cups', 'tablespoon', 'tbsp', 'teaspoon', 'tsp', 
                 'ounce', 'oz', 'pound', 'lb', 'lbs', 'gram', 'g', 'kg', 'ml', 'l',
                 'clove', 'cloves', 'pinch', 'dash', 'package', 'pkg', 'can']
                 
        descriptors = ['packed', 'chopped', 'diced', 'minced', 'melted', 
                       'fresh', 'dry', 'ground', 'sliced', 'firmly', 
                       'softened', 'beaten', 'shredded', 'optional', 'to taste',
                       'large', 'medium', 'small', 'thin', 'thick']

    # 1. Quitar números y fracciones al inicio (ej: "1 1/2 ")
    s = re.sub(r'^\s*[\d\s/.-]+', '', s).strip()

    2. Quitar paréntesis y su contenido (ej: "(opcional)")

    s = re.sub(r'\s*.∗\s*', ' ', s).strip()

    # 3. Quitar unidades y descriptores
    words = s.split()
    clean_words = []
    for word in words:
        word_cleaned = word.strip(',.') # Quitar comas/puntos pegados
        if word_cleaned not in units and word_cleaned not in descriptors:
            clean_words.append(word_cleaned)

    4. Re-unir y limpiar espacios extra

    final_name = ' '.join(clean_words)

    5. Quitar " and " (ej: "salt and pepper" -> "salt pepper")

    Esto ayuda a que "sal" y "pimienta" coincidan por separado.

    final_name = final_name.replace(' and ', ' ')

    return final_name.strip()


5.2 Algoritmo 2: Búsqueda y Coincidencia Parcial (Back-End)

Propósito: Comparar la lista de ingredientes limpios del usuario contra la lista de ingredientes limpios de cada receta para determinar coincidencias.

Archivo: app.py Función: find_meal_plan(user_ingredients_set, all_recipes)

Lógica:

    Itera sobre cada recipe en all_recipes (la DB en memoria).

    Por cada recipe, itera sobre cada recipe_ing (ingrediente de receta).

    Realiza una búsqueda de doble vía de sub-strings (coincidencia parcial):

        Comprueba si el ingrediente del usuario está dentro del ingrediente de la receta (ej. "pollo" está en "pechuga de pollo").

        Comprueba si el ingrediente de la receta está dentro del ingrediente del usuario (ej. "salsa" está en "salsa de tomate").

    Si se encuentra una coincidencia, se marca como found_match.

    Si un recipe_ing termina el bucle sin found_match, se añade a missing_ingredients.

    Al final de la receta, la lógica clasifica la receta:

        Si len(missing_ingredients) == 0: Se añade a can_make.

        Si 0 < len(missing_ingredients) <= SUGGESTION_THRESHOLD (ej. 2): Se añade a suggestions.

    Fragmento de Código para Evidencia:
    def find_meal_plan(user_ingredients_set, all_recipes):
    """
    Compara los ingredientes del usuario con la base de datos de recetas
    USANDO COINCIDENCIA PARCIAL para ser más flexible.
    """
    can_make = []
    suggestions = []
    SUGGESTION_THRESHOLD = 2
    user_ings_list = list(user_ingredients_set) # Lista para búsqueda parcial
    for recipe in all_recipes:
    # OJO: Esta lógica es del 'app.py' más reciente que sí guarda
    # todos los detalles de la receta.
    recipe_ings_set = recipe['ingredients_cleaned_set']
    
    missing_ingredients = []
    
    for recipe_ing in recipe_ings_set:
        # recipe_ing es (ej) 'worcestershire sauce'
        found_match = False
        
        # 1. Búsqueda exacta (rápida)
        if recipe_ing in user_ingredients_set:
            found_match = True
        else:
            # 2. Búsqueda parcial (flexible)
            # user_ing es (ej) 'worcestershire'
            for user_ing in user_ings_list:
                # Comprobamos si 'pollo' está en 'pechuga de pollo'
                # O si 'pechuga de pollo' está en 'pollo'
                if user_ing in recipe_ing or recipe_ing in user_ing:
                    found_match = True
                    break 
        
        if not found_match:
            missing_ingredients.append(recipe_ing)
    # Clasificación
    if not missing_ingredients:
        can_make.append(recipe) # Guardamos el dict de receta completo
    elif len(missing_ingredients) <= SUGGESTION_THRESHOLD:
        # Copiamos el dict de receta y añadimos la llave 'needed'
        suggestion_data = recipe.copy()
        suggestion_data['needed'] = ', '.join(missing_ingredients)
        suggestions.append(suggestion_data)
        
        return can_make, suggestions
        
5.3 Algoritmo 3: Paginación de Sugerencias (Front-End)

Propósito: Manejar listas de sugerencias muy largas sin sobrecargar al usuario, mostrando solo 10 resultados a la vez.

Archivo: templates/results.html Disparador: DOMContentLoaded

Lógica:

    Al cargar la página, el script encuentra el contenedor suggestions-list.

    Utiliza listContainer.children para obtener una lista limpia solo de los <li> de las recetas (hijos directos), ignorando los <li> anidados (ingredientes, pasos).

    Si totalItems > ITEMS_PER_PAGE (10), crea dinámicamente los botones de "Anterior" y "Siguiente".

    Llama a showPage(1) para la carga inicial.

    La función showPage(page) calcula los índices startIndex y endIndex.

    Itera sobre allItems y usa item.classList.add('hidden') o item.classList.remove('hidden') (clases de Tailwind) para mostrar/ocultar los <li> que corresponden a la página.

    Fragmento de Código para Evidencia:
    <script>
    document.addEventListener('DOMContentLoaded', () => {
        // --- Configuración ---
        const ITEMS_PER_PAGE = 10;
        
        // --- Elementos del DOM ---
        const listContainer = document.getElementById('suggestions-list');
        const paginationContainer = document.getElementById('pagination-controls');
        // Si no existe la lista (ej. 0 sugerencias), no hacemos nada.
    if (!listContainer) return;
        // Obtenemos todos los <li> de la lista de sugerencias
    // El bug se arregló usando .children en lugar de .querySelectorAll
    const allItems = Array.from(listContainer.children);
    const totalItems = allItems.length;
    // Si hay 10 items o menos, no necesitamos paginación.
    if (totalItems <= ITEMS_PER_PAGE) return;
    // --- Cálculos ---
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    let currentPage = 1;
    // --- Crear Botones y Texto ---
    paginationContainer.innerHTML = `
        <button id="prev-page" class="bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            &larr; Anterior
        </button>
        <span id="page-indicator" class="text-gray-700 font-semibold">
            Página 1 de ${totalPages}
        </span>
        <button id="next-page" class="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Siguiente &rarr;
        </button>
    `;
    // Obtenemos referencias a los botones que acabamos de crear
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const pageIndicator = document.getElementById('page-indicator');
    // --- Función para Mostrar/Ocultar ---
    function showPage(page) {
        currentPage = page;
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const endIndex = page * ITEMS_PER_PAGE;
    // Ocultamos todos los items y mostramos solo los de la página actual
        allItems.forEach((item, index) => {
            if (index >= startIndex && index < endIndex) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });
    // Actualizamos el texto "Página X de Y"
        pageIndicator.textContent = `Página ${currentPage} de ${totalPages}`;
    // Deshabilitamos/Habilitamos los botones
        prevButton.disabled = (currentPage === 1);
        nextButton.disabled = (currentPage === totalPages);
        }
    // --- Asignar Eventos ---
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            showPage(currentPage - 1);
        }
    });
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            showPage(currentPage + 1);
        }
    });
    // --- Carga Inicial ---
    // Al cargar la página, mostramos solo la primera página.
    showPage(1);
    });    

6. Guía de Instalación y Despliegue (Prototipo)

Para ejecutar el sistema en un entorno de desarrollo local:

Clonar/Descargar el repositorio del proyecto.

Verificar Datos: Asegurarse de que el archivo recipes.csv esté presente en el directorio raíz.

Crear Entorno Virtual:

python -m venv venv
source venv/bin/activate  # (o venv\Scripts\activate en Windows)


Instalar Dependencias:

pip install Flask
# (Se recomienda crear un 'requirements.txt' con 'pip freeze > requirements.txt')


Ejecutar Servidor:

flask run
# (O 'python app.py' si se tiene 'app.run(debug=True)' al final)


Acceder: Abrir un navegador web y visitar http://127.0.0.1:5000/.

7. Acceso al Manual desde la Aplicación

Para cumplir con el requisito de que este manual sea accesible desde la aplicación, se puede implementar un enlace simple.

Acción Sugerida:

Guardar este manual (una vez armado en manual_tecnico.md y convertido a PDF) como manual_tecnico.pdf. Colocarlo en una nueva carpeta llamada static en el directorio raíz de tu proyecto.

Añadir un enlace discreto en el pie de página de templates/index.html:

<!-- En templates/index.html, dentro del <body> -->
<footer class="text-center text-gray-500 text-sm mt-8">
  <a href="{{ url_for('static', filename='manual_tecnico.pdf') }}" 
     target="_blank" 
     class="hover:underline">
     Manual Técnico del Sistema
  </a>
</footer>


(Nota: Para que url_for funcione, debes tener from flask import ..., url_for en app.py, lo cual es estándar).
