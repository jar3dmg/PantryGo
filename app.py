import csv
import ast
import re
from flask import Flask, render_template, request

app = Flask(__name__)

# ---Función para limpiar la lista de ingredientes de la busqueda para que no busque cantidades, solo el ingrediente
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
    
    # 2. Quitar paréntesis y su contenido (ej: "(opcional)")
    s = re.sub(r'\s*\(.*\)\s*', ' ', s).strip()

    # 3. Quitar unidades y descriptores
    words = s.split()
    clean_words = []
    for word in words:
        word_cleaned = word.strip(',.') # Quitar comas/puntos pegados
        if word_cleaned not in units and word_cleaned not in descriptors:
            clean_words.append(word_cleaned)
    
    # 4. Re-unir y limpiar espacios extra
    final_name = ' '.join(clean_words)
    
    # 5. Quitar " and " (ej: "salt and pepper" -> "salt pepper")
    #    Esto ayuda a que "sal" y "pimienta" coincidan por separado.
    final_name = final_name.replace(' and ', ' ') 
    
    return final_name.strip()
# --- FIN NUEVA FUNCIÓN DE LIMPIEZA ---


def load_recipes():
    """
    Carga las recetas desde el NUEVO archivo CSV.
    Limpia los ingredientes para la BÚSQUEDA,
    pero GUARDA LOS DATOS COMPLETOS para MOSTRARLOS.
    """
    recipes = []
    try:
        # ! Asegúrate de que tu archivo CSV se llame 'recipes.csv'
        with open('recipes.csv', mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            row_count = 1
            
            for row in reader:
                row_count += 1
                try:
                    # 1. Leer todas las columnas que necesitamos
                    recipe_name = row['recipe_title']
                    ingredients_string_raw = row['ingredients'] # String: '["..."]'
                    description = row['description']
                    # Asumiendo que 'directions' también es un string de lista '["paso1", "paso2"]'
                    directions_string_raw = row['directions'] 

                    # 2. Convertir strings de listas en listas reales de Python
                    ingredients_list_raw = ast.literal_eval(ingredients_string_raw)
                    # Si 'directions' no es una lista, ajusta esto.
                    # Por ahora, asumimos que sí es, como 'ingredients'
                    directions_list = ast.literal_eval(directions_string_raw)

                    # 3. Crear el set de ingredientes LIMPIOS (para la BÚSQUEDA)
                    recipe_ingredients_cleaned_set = set()
                    for raw_ing in ingredients_list_raw:
                        clean_name = clean_ingredient(raw_ing)
                        if clean_name: 
                            recipe_ingredients_cleaned_set.add(clean_name)
                    
                    # 4. Guardar la receta COMPLETA en la DB en memoria
                    if recipe_ingredients_cleaned_set: 
                        recipes.append({
                            'name': recipe_name,
                            'ingredients_cleaned_set': recipe_ingredients_cleaned_set, # Para buscar
                            'ingredients_raw_list': ingredients_list_raw, # Para mostrar
                            'description': description, # Para mostrar
                            'directions_list': directions_list # Para mostrar
                        })

                except Exception as e:
                    # Esto nos dice si una fila está mal formateada
                    print(f"ADVERTENCIA: Saltando fila {row_count} por error: {e}")

    except FileNotFoundError:
        print("ERROR: No se encontró el archivo 'recipes.csv'.")
    
    return recipes

def find_meal_plan(user_ingredients_set, all_recipes):
    """
    Compara los ingredientes del usuario (limpios) con el set de 
    ingredientes limpios de la receta.
    """
    can_make = []
    suggestions = []
    SUGGESTION_THRESHOLD = 2 

    user_ings_list = list(user_ingredients_set) 

    for recipe in all_recipes:
        
        # --- CAMBIO IMPORTANTE ---
        # El set de ingredientes limpios ahora se llama 'ingredients_cleaned_set'
        recipe_ings_set = recipe['ingredients_cleaned_set'] 
        # --- FIN DEL CAMBIO ---
        
        missing_ingredients = []
        
        for recipe_ing in recipe_ings_set:
            found_match = False
            
            # 1. Búsqueda exacta
            if recipe_ing in user_ingredients_set:
                found_match = True
            else:
                # 2. Búsqueda parcial
                for user_ing in user_ings_list:
                    if user_ing in recipe_ing or recipe_ing in user_ing:
                        found_match = True
                        break 
            
            if not found_match:
                missing_ingredients.append(recipe_ing)

        # Evaluar resultados
        if not missing_ingredients:
            can_make.append(recipe) # Pasa el dict de receta completo
        elif len(missing_ingredients) <= SUGGESTION_THRESHOLD:
            
            # --- CAMBIO IMPORTANTE ---
            # Copiamos el dict de receta y añadimos la llave 'needed'
            # para que los detalles (descripción, etc.) también pasen
            suggestion_data = recipe.copy()
            suggestion_data['needed'] = ', '.join(missing_ingredients)
            suggestions.append(suggestion_data)
            # --- FIN DEL CAMBIO ---
            
    return can_make, suggestions

# --- RUTAS DE FLASK ---

# Cargamos las recetas UNA SOLA VEZ al iniciar el servidor
print("Cargando base de datos de recetas...")
ALL_RECIPES_DB = load_recipes()
print(f"¡Carga completa! {len(ALL_RECIPES_DB)} recetas cargadas.")

@app.route('/')
def index():
    """ Muestra la página principal """
    return render_template('index.html')

@app.route('/plan', methods=['POST'])
def get_plan():
    """ Procesa el formulario y muestra los resultados """
    
    # Tomamos la lista del formulario
    raw_ingredients = request.form['ingredients']
    
    # Limpiamos la entrada del usuario:
    # 1. Convertimos a minúsculas
    # 2. Separamos por coma (y quitamos espacios extra)
    # 3. Usamos un 'set' para eliminar duplicados
    user_ingredients_set = {ing.strip().lower() for ing in raw_ingredients.split(',') if ing.strip()}
    
    # Buscamos las recetas
    can_make_list, suggestions_list = find_meal_plan(user_ingredients_set, ALL_RECIPES_DB)
    
    # Renderizamos la página de resultados
    return render_template(
        'results.html',
        can_make_list=can_make_list,
        suggestions_list=suggestions_list,
        user_ingredients_str=raw_ingredients # Para mostrar lo que escribió
    )

if __name__ == '__main__':
    app.run(debug=True)