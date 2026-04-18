// Administra el CRUD visual de ingredientes y recetas consumiendo la API JSON.

const apiBaseUrl = "/api/catalogs";

const adminState = {
    metadata: null,
    ingredients: [],
    recipes: [],
    activeTab: "ingredients",
};

const adminStatusMessage = document.getElementById("admin-status-message");
const adminTabButtons = Array.from(document.querySelectorAll(".admin-tab-button"));
const adminPanels = Array.from(document.querySelectorAll(".admin-panel"));

const ingredientForm = document.getElementById("ingredient-form");
const ingredientIdInput = document.getElementById("ingredient-id");
const ingredientNameInput = document.getElementById("ingredient-name");
const ingredientCategorySelect = document.getElementById("ingredient-category");
const ingredientDescriptionInput = document.getElementById("ingredient-description");
const ingredientIsActiveInput = document.getElementById("ingredient-is-active");
const ingredientDeleteButton = document.getElementById("ingredient-delete-button");
const ingredientResetButton = document.getElementById("ingredient-reset-button");
const ingredientList = document.getElementById("ingredient-list");
const ingredientSearchInput = document.getElementById("ingredient-search");

const recipeForm = document.getElementById("recipe-form");
const recipeIdInput = document.getElementById("recipe-id");
const recipeTitleInput = document.getElementById("recipe-title");
const recipeStatusSelect = document.getElementById("recipe-status");
const recipeCategorySelect = document.getElementById("recipe-category");
const recipeDifficultySelect = document.getElementById("recipe-difficulty");
const recipeShortDescriptionInput = document.getElementById("recipe-short-description");
const recipeDescriptionInput = document.getElementById("recipe-description");
const recipeServingsInput = document.getElementById("recipe-servings");
const recipePrepTimeInput = document.getElementById("recipe-prep-time");
const recipeCookTimeInput = document.getElementById("recipe-cook-time");
const recipeTotalTimeInput = document.getElementById("recipe-total-time");
const recipeIngredientsBuilder = document.getElementById("recipe-ingredients-builder");
const recipeStepsBuilder = document.getElementById("recipe-steps-builder");
const recipeIngredientsSummary = document.getElementById("recipe-ingredients-summary");
const recipeStepsSummary = document.getElementById("recipe-steps-summary");
const recipeIngredientOptions = document.getElementById("recipe-ingredient-options");
const recipeAddIngredientButton = document.getElementById("recipe-add-ingredient-button");
const recipeAddStepButton = document.getElementById("recipe-add-step-button");
const recipeDeleteButton = document.getElementById("recipe-delete-button");
const recipeResetButton = document.getElementById("recipe-reset-button");
const recipeList = document.getElementById("recipe-list");
const recipeSearchInput = document.getElementById("recipe-search");

function setStatusMessage(message, isError = false) {
    if (!adminStatusMessage) {
        return;
    }

    adminStatusMessage.textContent = message;
    adminStatusMessage.classList.toggle("text-rose-700", isError);
    adminStatusMessage.classList.toggle("text-ink/70", !isError);
}

async function requestApi(path, options = {}) {
    const response = await fetch(`${apiBaseUrl}${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
        ...options,
    });

    const payload = await response.json();
    if (!response.ok || !payload.ok) {
        throw new Error(payload.message || "No fue posible completar la operacion.");
    }

    return payload;
}

function setActiveAdminTab(tabName) {
    adminState.activeTab = tabName;

    adminTabButtons.forEach((button) => {
        const isActive = button.dataset.adminTab === tabName;
        button.classList.toggle("is-active", isActive);
        button.classList.toggle("bg-sand", isActive);
        button.classList.toggle("bg-white", !isActive);
    });

    adminPanels.forEach((panel) => {
        panel.classList.toggle("hidden", panel.id !== `admin-panel-${tabName}`);
    });
}

function fillSelect(selectElement, items, labelKey, valueKey = "id", includeEmpty = true) {
    if (!selectElement) {
        return;
    }

    selectElement.innerHTML = "";

    if (includeEmpty) {
        const emptyOption = document.createElement("option");
        emptyOption.value = "";
        emptyOption.textContent = "Selecciona una opcion";
        selectElement.appendChild(emptyOption);
    }

    items.forEach((item) => {
        const option = document.createElement("option");
        option.value = item[valueKey];
        option.textContent = item[labelKey];
        selectElement.appendChild(option);
    });
}

function fillMetadata() {
    if (!adminState.metadata) {
        return;
    }

    fillSelect(
        ingredientCategorySelect,
        adminState.metadata.ingredient_categories || [],
        "name",
        "id",
        false
    );
    fillSelect(
        recipeStatusSelect,
        adminState.metadata.recipe_statuses || [],
        "name",
        "id",
        false
    );
    fillSelect(
        recipeCategorySelect,
        adminState.metadata.recipe_categories || [],
        "name"
    );
    fillSelect(
        recipeDifficultySelect,
        adminState.metadata.recipe_difficulties || [],
        "name"
    );
}

function getActiveIngredients() {
    return adminState.ingredients.filter((item) => item.is_active);
}

function getIngredientById(ingredientId) {
    return adminState.ingredients.find((item) => String(item.id) === String(ingredientId)) || null;
}

function getIngredientByName(ingredientName) {
    const normalizedName = String(ingredientName || "").trim().toLowerCase();
    if (!normalizedName) {
        return null;
    }

    return getActiveIngredients().find((item) => item.name.toLowerCase() === normalizedName) || null;
}

function populateRecipeIngredientOptions() {
    if (!recipeIngredientOptions) {
        return;
    }

    recipeIngredientOptions.innerHTML = "";
    getActiveIngredients().forEach((ingredient) => {
        const option = document.createElement("option");
        option.value = ingredient.name;
        option.label = ingredient.category_name
            ? `${ingredient.name} · ${ingredient.category_name}`
            : ingredient.name;
        recipeIngredientOptions.appendChild(option);
    });
}

function matchesSearchTerm(value, term) {
    return String(value || "").toLowerCase().includes(term);
}

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function syncRecipeIngredientSelection(row) {
    const searchInput = row.querySelector(".recipe-ingredient-search");
    const idInput = row.querySelector(".recipe-ingredient-id");
    const meta = row.querySelector(".recipe-ingredient-meta");
    const selectedIngredient = getIngredientByName(searchInput.value);

    if (selectedIngredient) {
        idInput.value = selectedIngredient.id;
        meta.textContent = selectedIngredient.category_name
            ? `Catalogado en ${selectedIngredient.category_name}.`
            : "Ingrediente disponible en el catalogo.";
        meta.classList.remove("text-rose-700");
        meta.classList.add("text-ink/60");
        return;
    }

    idInput.value = "";
    if (searchInput.value.trim()) {
        meta.textContent = "Selecciona un ingrediente sugerido del catalogo para vincularlo correctamente.";
        meta.classList.add("text-rose-700");
        meta.classList.remove("text-ink/60");
    } else {
        meta.textContent = "Empieza a escribir para ver coincidencias del catalogo.";
        meta.classList.remove("text-rose-700");
        meta.classList.add("text-ink/60");
    }
}

function createRecipeIngredientRow(data = {}) {
    const row = document.createElement("div");
    row.className = "recipe-builder-row recipe-ingredient-card rounded-[1.15rem] border border-herb/20 bg-white p-4";
    const selectedIngredient = getIngredientById(data.ingredient_id);
    const selectedIngredientName = selectedIngredient?.name || "";
    const selectedIngredientMeta = selectedIngredient?.category_name
        ? `Catalogado en ${selectedIngredient.category_name}.`
        : "Empieza a escribir para ver coincidencias del catalogo.";

    row.innerHTML = `
        <div class="builder-section-title">
            <span class="builder-section-badge recipe-ingredient-index">1</span>
            <div class="min-w-0">
                <p class="m-0 text-base font-extrabold text-ink">Ingrediente de receta</p>
                <p class="builder-hint m-0 mt-1">Busca un ingrediente existente, confirma la sugerencia y luego completa cantidad o nota si la receta lo necesita.</p>
            </div>
        </div>
        <div class="recipe-builder-stack mt-4">
            <div class="recipe-builder-main-field">
                <label class="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-ink/55">Ingrediente</label>
                <input
                    class="admin-input recipe-ingredient-search w-full rounded-[1rem] border border-olive/20 bg-sand px-4 py-3 text-sm text-ink"
                    type="text"
                    list="recipe-ingredient-options"
                    placeholder="Escribe para buscar ingredientes existentes"
                    value="${escapeHtml(selectedIngredientName)}"
                    autocomplete="off"
                >
                <input type="hidden" class="recipe-ingredient-id" value="${escapeHtml(data.ingredient_id - "")}">
                <p class="recipe-ingredient-meta mt-2 text-sm text-ink/60">${selectedIngredientName ? escapeHtml(selectedIngredientMeta) : "Empieza a escribir para ver coincidencias del catalogo."}</p>
            </div>
            <div class="recipe-builder-side-grid">
                <div>
                    <label class="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-ink/55">Cantidad</label>
                    <input class="admin-input recipe-ingredient-quantity w-full rounded-[1rem] border border-olive/20 bg-sand px-4 py-3 text-sm text-ink" type="number" min="0" step="0.01" placeholder="Opcional" value="${escapeHtml(data.quantity - "")}">
                </div>
                <label class="recipe-toggle-chip rounded-[1rem] border border-herb/20 bg-cream px-4 py-3 text-sm font-semibold text-ink/80">
                    <input type="checkbox" class="recipe-ingredient-optional mr-2" ${data.is_optional ? "checked" : ""}> Opcional
                </label>
            </div>
        </div>
        <div class="mt-3">
            <div>
                <label class="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-ink/55">Nota de preparacion</label>
                <input class="admin-input recipe-ingredient-note w-full rounded-[1rem] border border-olive/20 bg-sand px-4 py-3 text-sm text-ink" placeholder="Ej. picado fino, cocido, en cubos" value="${escapeHtml(data.preparation_note || "")}">
            </div>
        </div>
        <div class="recipe-builder-actions mt-4">
            <p class="builder-hint m-0">Si no necesitas cantidad o nota, puedes dejar esos campos vacios.</p>
            <button type="button" class="recipe-builder-remove rounded-full border border-rose-300 bg-white px-5 py-3 text-sm font-extrabold text-rose-700">Quitar ingrediente</button>
        </div>
    `;

    row.querySelector(".recipe-builder-remove").addEventListener("click", () => {
        row.remove();
        refreshRecipeBuilders();
    });

    row.querySelectorAll("input").forEach((element) => {
        element.addEventListener("input", refreshRecipeBuilders);
        element.addEventListener("change", refreshRecipeBuilders);
    });

    const searchInput = row.querySelector(".recipe-ingredient-search");
    searchInput.addEventListener("input", () => {
        syncRecipeIngredientSelection(row);
        refreshRecipeBuilders();
    });
    searchInput.addEventListener("change", () => {
        syncRecipeIngredientSelection(row);
        refreshRecipeBuilders();
    });

    syncRecipeIngredientSelection(row);

    return row;
}

function createRecipeStepRow(data = {}) {
    const row = document.createElement("div");
    row.className = "recipe-builder-row recipe-step-card rounded-[1.15rem] border border-herb/20 bg-white p-4";
    row.innerHTML = `
        <div class="builder-section-title">
            <span class="builder-section-badge recipe-step-index">1</span>
            <div class="min-w-0">
                <p class="m-0 text-base font-extrabold text-ink">Paso de preparacion</p>
                <p class="builder-hint m-0 mt-1">El orden visual define el numero final del paso.</p>
            </div>
        </div>
        <div class="recipe-builder-stack mt-4">
            <div>
                <label class="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-ink/55">Instruccion</label>
                <textarea class="admin-input recipe-step-instruction w-full rounded-[1rem] border border-olive/20 bg-sand px-4 py-3 text-sm text-ink" rows="4" placeholder="Describe la accion principal de este paso">${escapeHtml(data.instruction || "")}</textarea>
            </div>
            <div class="recipe-builder-side-grid">
                <div>
                    <label class="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-ink/55">Minutos</label>
                    <input class="admin-input recipe-step-minutes w-full rounded-[1rem] border border-olive/20 bg-sand px-4 py-3 text-sm text-ink" type="number" min="0" placeholder="Opcional" value="${escapeHtml(data.estimated_minutes - "")}">
                </div>
                <button type="button" class="recipe-builder-remove rounded-full border border-rose-300 bg-white px-5 py-3 text-sm font-extrabold text-rose-700 self-end">Quitar paso</button>
            </div>
        </div>
    `;

    row.querySelector(".recipe-builder-remove").addEventListener("click", () => {
        row.remove();
        refreshRecipeBuilders();
    });

    row.querySelectorAll("input, textarea").forEach((element) => {
        element.addEventListener("input", refreshRecipeBuilders);
        element.addEventListener("change", refreshRecipeBuilders);
    });

    return row;
}

function renderIngredientList() {
    if (!ingredientList) {
        return;
    }

    const searchTerm = (ingredientSearchInput?.value || "").trim().toLowerCase();
    const filteredItems = adminState.ingredients.filter((ingredient) =>
        !searchTerm
        || matchesSearchTerm(ingredient.name, searchTerm)
        || matchesSearchTerm(ingredient.slug, searchTerm)
        || matchesSearchTerm(ingredient.category_name, searchTerm)
        || matchesSearchTerm(ingredient.description, searchTerm)
    );

    ingredientList.innerHTML = "";

    if (!filteredItems.length) {
        ingredientList.innerHTML = `<div class="rounded-[1.25rem] border border-dashed border-olive/20 bg-sand px-4 py-5 text-sm text-ink/65">No hay ingredientes que coincidan con la busqueda.</div>`;
        return;
    }

    filteredItems.forEach((ingredient) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "admin-list-item w-full rounded-[1.25rem] border border-herb/20 bg-sand px-4 py-4 text-left transition hover:translate-y-[-1px] hover:shadow-soft";
        const description = ingredient.description || "Sin descripcion registrada.";
        item.innerHTML = `
            <div class="flex flex-wrap items-start justify-between gap-4">
                <div class="min-w-0 flex-1">
                    <p class="text-lg font-extrabold text-ink">${ingredient.name}</p>
                    <div class="mt-2 flex flex-wrap gap-2">
                        <span class="admin-summary-chip">${ingredient.category_name || "Sin categoria"}</span>
                        <span class="admin-summary-chip">Slug: ${ingredient.slug}</span>
                    </div>
                    <p class="mt-3 text-sm leading-6 text-ink/70">${description}</p>
                </div>
                <span class="rounded-full px-3 py-1 text-xs font-extrabold ${ingredient.is_active ? "bg-white text-emerald-700" : "bg-white text-rose-700"}">
                    ${ingredient.is_active ? "Activo" : "Inactivo"}
                </span>
            </div>
        `;
        item.addEventListener("click", () => fillIngredientForm(ingredient));
        ingredientList.appendChild(item);
    });
}

function renderRecipeList() {
    if (!recipeList) {
        return;
    }

    const searchTerm = (recipeSearchInput?.value || "").trim().toLowerCase();
    const filteredItems = adminState.recipes.filter((recipe) =>
        !searchTerm
        || matchesSearchTerm(recipe.title, searchTerm)
        || matchesSearchTerm(recipe.slug, searchTerm)
        || matchesSearchTerm(recipe.category_name, searchTerm)
        || matchesSearchTerm(recipe.status_name, searchTerm)
        || matchesSearchTerm(recipe.short_description, searchTerm)
        || (recipe.ingredients || []).some((ingredient) =>
            matchesSearchTerm(ingredient.ingredient_name, searchTerm)
            || matchesSearchTerm(ingredient.preparation_note, searchTerm)
        )
    );

    recipeList.innerHTML = "";

    if (!filteredItems.length) {
        recipeList.innerHTML = `<div class="rounded-[1.25rem] border border-dashed border-olive/20 bg-sand px-4 py-5 text-sm text-ink/65">No hay recetas que coincidan con la busqueda.</div>`;
        return;
    }

    filteredItems.forEach((recipe) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "admin-list-item w-full rounded-[1.25rem] border border-herb/20 bg-sand px-4 py-4 text-left transition hover:translate-y-[-1px] hover:shadow-soft";
        const recipeDescription = recipe.short_description || recipe.description || "Sin descripcion registrada.";
        const ingredientPreview = (recipe.ingredients || [])
            .slice(0, 4)
            .map((ingredient) => ingredient.ingredient_name)
            .filter(Boolean)
            .join(", ");
        item.innerHTML = `
            <div class="flex flex-wrap items-start justify-between gap-4">
                <div class="min-w-0 flex-1">
                    <p class="text-lg font-extrabold text-ink">${recipe.title}</p>
                    <div class="mt-2 flex flex-wrap gap-2">
                        <span class="admin-summary-chip">${recipe.category_name || "Sin categoria"}</span>
                        <span class="admin-summary-chip">${recipe.status_name || "Sin estatus"}</span>
                        ${recipe.difficulty_name ? `<span class="admin-summary-chip">${recipe.difficulty_name}</span>` : ""}
                    </div>
                    <p class="mt-3 text-sm leading-6 text-ink/70">${recipeDescription}</p>
                    <p class="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">Ingredientes cargados</p>
                    <p class="mt-1 text-sm leading-6 text-ink/70">${ingredientPreview || "Sin ingredientes capturados aun."}</p>
                </div>
                <div class="flex flex-wrap gap-2">
                    <span class="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-ink/70">${recipe.ingredients.length} ingredientes</span>
                    <span class="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-ink/70">${recipe.steps.length} pasos</span>
                </div>
            </div>
        `;
        item.addEventListener("click", () => fillRecipeForm(recipe));
        recipeList.appendChild(item);
    });
}

function validateRecipeIngredientRows() {
    const invalidRow = Array.from(recipeIngredientsBuilder.querySelectorAll(".recipe-builder-row"))
        .find((row) => {
            const searchValue = row.querySelector(".recipe-ingredient-search")?.value.trim();
            const ingredientId = row.querySelector(".recipe-ingredient-id")?.value.trim();
            return searchValue && !ingredientId;
        });

    if (!invalidRow) {
        return;
    }

    invalidRow.scrollIntoView({ behavior: "smooth", block: "center" });
    invalidRow.querySelector(".recipe-ingredient-search")?.focus();
    throw new Error("Selecciona un ingrediente valido desde las sugerencias del catalogo antes de guardar.");
}

function resetIngredientForm() {
    ingredientForm.reset();
    ingredientIdInput.value = "";
    ingredientIsActiveInput.checked = true;

    if (ingredientCategorySelect.options.length) {
        ingredientCategorySelect.selectedIndex = 0;
    }
}

function fillIngredientForm(ingredient) {
    ingredientIdInput.value = ingredient.id;
    ingredientNameInput.value = ingredient.name || "";
    ingredientCategorySelect.value = ingredient.ingredient_category_id || "";
    ingredientDescriptionInput.value = ingredient.description || "";
    ingredientIsActiveInput.checked = Boolean(ingredient.is_active);
}

function resetRecipeForm() {
    recipeForm.reset();
    recipeIdInput.value = "";
    recipeIngredientsBuilder.innerHTML = "";
    recipeStepsBuilder.innerHTML = "";

    if (recipeStatusSelect.options.length) {
        recipeStatusSelect.selectedIndex = 0;
    }

    addRecipeIngredientRow();
    addRecipeStepRow();
}

function fillRecipeForm(recipe) {
    recipeIdInput.value = recipe.id;
    recipeTitleInput.value = recipe.title || "";
    recipeStatusSelect.value = recipe.recipe_status_id || "";
    recipeCategorySelect.value = recipe.recipe_category_id || "";
    recipeDifficultySelect.value = recipe.recipe_difficulty_id || "";
    recipeShortDescriptionInput.value = recipe.short_description || "";
    recipeDescriptionInput.value = recipe.description || "";
    recipeServingsInput.value = recipe.servings || "";
    recipePrepTimeInput.value = recipe.prep_time_minutes || "";
    recipeCookTimeInput.value = recipe.cook_time_minutes || "";
    recipeTotalTimeInput.value = recipe.total_time_minutes || "";

    recipeIngredientsBuilder.innerHTML = "";
    recipeStepsBuilder.innerHTML = "";

    (recipe.ingredients || []).forEach((ingredient) => addRecipeIngredientRow(ingredient));
    (recipe.steps || []).forEach((step) => addRecipeStepRow(step));

    if (!(recipe.ingredients || []).length) {
        addRecipeIngredientRow();
    }

    if (!(recipe.steps || []).length) {
        addRecipeStepRow();
    }
}

function addRecipeIngredientRow(data = {}) {
    recipeIngredientsBuilder.appendChild(createRecipeIngredientRow(data));
    refreshRecipeBuilders();
}

function addRecipeStepRow(data = {}) {
    recipeStepsBuilder.appendChild(createRecipeStepRow(data));
    refreshRecipeBuilders();
}

function rebuildRecipeIngredientRows() {
    const currentRows = collectRecipeIngredients();
    recipeIngredientsBuilder.innerHTML = "";

    if (!currentRows.length) {
        addRecipeIngredientRow();
        return;
    }

    currentRows.forEach((item) => addRecipeIngredientRow(item));
}

function renderBuilderEmptyState(container, message) {
    const rowCount = container.querySelectorAll(".recipe-builder-row").length;
    const existingEmptyState = container.querySelector(".builder-empty-state");

    if (rowCount) {
        if (existingEmptyState) {
            existingEmptyState.remove();
        }
        return;
    }

    if (!existingEmptyState) {
        container.innerHTML = `<div class="builder-empty-state">${message}</div>`;
    } else {
        existingEmptyState.textContent = message;
    }
}

function refreshRecipeBuilders() {
    const ingredientRows = Array.from(recipeIngredientsBuilder.querySelectorAll(".recipe-builder-row"));
    ingredientRows.forEach((row, index) => {
        const badge = row.querySelector(".recipe-ingredient-index");
        if (badge) {
            badge.textContent = String(index + 1);
        }
    });

    const stepRows = Array.from(recipeStepsBuilder.querySelectorAll(".recipe-builder-row"));
    stepRows.forEach((row, index) => {
        const badge = row.querySelector(".recipe-step-index");
        if (badge) {
            badge.textContent = String(index + 1);
        }
    });

    if (recipeIngredientsSummary) {
        recipeIngredientsSummary.textContent = ingredientRows.length
            ? `${ingredientRows.length} ingrediente(s) listos para esta receta.`
            : "Aun no has agregado ingredientes.";
    }

    if (recipeStepsSummary) {
        recipeStepsSummary.textContent = stepRows.length
            ? `${stepRows.length} paso(s) definidos en orden de preparacion.`
            : "Aun no has agregado pasos.";
    }

    renderBuilderEmptyState(
        recipeIngredientsBuilder,
        "Agrega al menos un ingrediente para poder guardar la receta."
    );
    renderBuilderEmptyState(
        recipeStepsBuilder,
        "Agrega los pasos de preparacion para dejar clara la receta."
    );
}

function collectRecipeIngredients() {
    validateRecipeIngredientRows();

    return Array.from(recipeIngredientsBuilder.querySelectorAll(".recipe-builder-row"))
        .map((row) => ({
            ingredient_id: row.querySelector(".recipe-ingredient-id").value,
            quantity: row.querySelector(".recipe-ingredient-quantity").value || null,
            preparation_note: row.querySelector(".recipe-ingredient-note").value,
            is_optional: row.querySelector(".recipe-ingredient-optional").checked,
        }))
        .filter((item) => item.ingredient_id);
}

function collectRecipeSteps() {
    return Array.from(recipeStepsBuilder.querySelectorAll(".recipe-builder-row"))
        .map((row) => ({
            instruction: row.querySelector(".recipe-step-instruction").value,
            estimated_minutes: row.querySelector(".recipe-step-minutes").value || null,
        }))
        .filter((item) => item.instruction.trim());
}

async function loadMetadata() {
    const payload = await requestApi("/metadata");
    adminState.metadata = payload.data;
    fillMetadata();
}

async function loadIngredients() {
    const payload = await requestApi("/ingredients");
    adminState.ingredients = payload.data;
    populateRecipeIngredientOptions();
    renderIngredientList();
    rebuildRecipeIngredientRows();
}

async function loadRecipes() {
    const payload = await requestApi("/recipes");
    adminState.recipes = payload.data;
    renderRecipeList();
}

async function reloadAllData() {
    await loadMetadata();
    await loadIngredients();
    await loadRecipes();
}

async function handleIngredientSubmit(event) {
    event.preventDefault();

    const payload = {
        name: ingredientNameInput.value,
        ingredient_category_id: ingredientCategorySelect.value,
        description: ingredientDescriptionInput.value,
        is_active: ingredientIsActiveInput.checked,
    };

    const ingredientId = ingredientIdInput.value;
    const path = ingredientId ? `/ingredients/${ingredientId}` : "/ingredients";
    const method = ingredientId ? "PUT" : "POST";

    const response = await requestApi(path, {
        method,
        body: JSON.stringify(payload),
    });

    await loadIngredients();
    fillIngredientForm(response.data);
    setStatusMessage(response.message || "Ingrediente guardado correctamente.");
}

async function handleRecipeSubmit(event) {
    event.preventDefault();

    const payload = {
        title: recipeTitleInput.value,
        recipe_status_id: recipeStatusSelect.value,
        recipe_category_id: recipeCategorySelect.value || null,
        recipe_difficulty_id: recipeDifficultySelect.value || null,
        short_description: recipeShortDescriptionInput.value,
        description: recipeDescriptionInput.value,
        servings: recipeServingsInput.value || null,
        prep_time_minutes: recipePrepTimeInput.value || null,
        cook_time_minutes: recipeCookTimeInput.value || null,
        total_time_minutes: recipeTotalTimeInput.value || null,
        ingredients: collectRecipeIngredients(),
        steps: collectRecipeSteps(),
    };

    const recipeId = recipeIdInput.value;
    const path = recipeId ? `/recipes/${recipeId}` : "/recipes";
    const method = recipeId ? "PUT" : "POST";

    const response = await requestApi(path, {
        method,
        body: JSON.stringify(payload),
    });

    await Promise.all([loadRecipes(), loadIngredients()]);
    fillRecipeForm(response.data);
    setStatusMessage(response.message || "Receta guardada correctamente.");
}

async function handleIngredientDelete() {
    const ingredientId = ingredientIdInput.value;
    if (!ingredientId) {
        setStatusMessage("Selecciona un ingrediente antes de intentar darlo de baja.", true);
        return;
    }

    const response = await requestApi(`/ingredients/${ingredientId}`, { method: "DELETE" });
    await loadIngredients();
    resetIngredientForm();
    setStatusMessage(response.message || "Ingrediente dado de baja correctamente.");
}

async function handleRecipeDelete() {
    const recipeId = recipeIdInput.value;
    if (!recipeId) {
        setStatusMessage("Selecciona una receta antes de intentar archivarla.", true);
        return;
    }

    const response = await requestApi(`/recipes/${recipeId}`, { method: "DELETE" });
    await loadRecipes();
    resetRecipeForm();
    setStatusMessage(response.message || "Receta archivada correctamente.");
}

function registerEvents() {
    adminTabButtons.forEach((button) => {
        button.addEventListener("click", () => setActiveAdminTab(button.dataset.adminTab));
    });

    ingredientForm.addEventListener("submit", async (event) => {
        try {
            await handleIngredientSubmit(event);
        } catch (error) {
            setStatusMessage(error.message, true);
        }
    });

    recipeForm.addEventListener("submit", async (event) => {
        try {
            await handleRecipeSubmit(event);
        } catch (error) {
            setStatusMessage(error.message, true);
        }
    });

    ingredientDeleteButton.addEventListener("click", async () => {
        try {
            await handleIngredientDelete();
        } catch (error) {
            setStatusMessage(error.message, true);
        }
    });

    recipeDeleteButton.addEventListener("click", async () => {
        try {
            await handleRecipeDelete();
        } catch (error) {
            setStatusMessage(error.message, true);
        }
    });

    ingredientResetButton.addEventListener("click", resetIngredientForm);
    recipeResetButton.addEventListener("click", resetRecipeForm);
    recipeAddIngredientButton.addEventListener("click", () => addRecipeIngredientRow());
    recipeAddStepButton.addEventListener("click", () => addRecipeStepRow());
    ingredientSearchInput.addEventListener("input", renderIngredientList);
    recipeSearchInput.addEventListener("input", renderRecipeList);
}

document.addEventListener("DOMContentLoaded", async () => {
    registerEvents();
    setActiveAdminTab("ingredients");
    setStatusMessage("Cargando catalogos administrativos...");

    try {
        await reloadAllData();
        resetIngredientForm();
        resetRecipeForm();
        setStatusMessage("Catalogos cargados. Ya puedes administrar ingredientes y recetas.");
    } catch (error) {
        setStatusMessage(error.message, true);
    }
});
