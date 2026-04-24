// Administra el CRUD visual de ingredientes y recetas consumiendo la API JSON.
const API_BASE_URL = "/api/catalogs";

document.addEventListener("DOMContentLoaded", initCatalogAdminPage);

function createAdminState() {
    return {
        metadata: null,
        ingredients: [],
        recipes: [],
        activeTab: "ingredients",
    };
}

function getAdminElements() {
    return {
        statusMessage: document.getElementById("admin-status-message"),
        tabButtons: Array.from(document.querySelectorAll(".admin-tab-button")),
        panels: Array.from(document.querySelectorAll(".admin-panel")),

        ingredient: {
            form: document.getElementById("ingredient-form"),
            idInput: document.getElementById("ingredient-id"),
            nameInput: document.getElementById("ingredient-name"),
            categorySelect: document.getElementById("ingredient-category"),
            descriptionInput: document.getElementById("ingredient-description"),
            isActiveInput: document.getElementById("ingredient-is-active"),
            deleteButton: document.getElementById("ingredient-delete-button"),
            resetButton: document.getElementById("ingredient-reset-button"),
            list: document.getElementById("ingredient-list"),
            searchInput: document.getElementById("ingredient-search"),
        },

        recipe: {
            form: document.getElementById("recipe-form"),
            idInput: document.getElementById("recipe-id"),
            titleInput: document.getElementById("recipe-title"),
            statusSelect: document.getElementById("recipe-status"),
            categorySelect: document.getElementById("recipe-category"),
            difficultySelect: document.getElementById("recipe-difficulty"),
            shortDescriptionInput: document.getElementById("recipe-short-description"),
            descriptionInput: document.getElementById("recipe-description"),
            servingsInput: document.getElementById("recipe-servings"),
            prepTimeInput: document.getElementById("recipe-prep-time"),
            cookTimeInput: document.getElementById("recipe-cook-time"),
            totalTimeInput: document.getElementById("recipe-total-time"),
            ingredientsBuilder: document.getElementById("recipe-ingredients-builder"),
            stepsBuilder: document.getElementById("recipe-steps-builder"),
            ingredientsSummary: document.getElementById("recipe-ingredients-summary"),
            stepsSummary: document.getElementById("recipe-steps-summary"),
            ingredientOptions: document.getElementById("recipe-ingredient-options"),
            addIngredientButton: document.getElementById("recipe-add-ingredient-button"),
            addStepButton: document.getElementById("recipe-add-step-button"),
            deleteButton: document.getElementById("recipe-delete-button"),
            resetButton: document.getElementById("recipe-reset-button"),
            list: document.getElementById("recipe-list"),
            searchInput: document.getElementById("recipe-search"),
        },
    };
}

function setStatusMessage(elements, message, isError = false) {
    if (!elements.statusMessage) {
        return;
    }

    elements.statusMessage.textContent = message;
    elements.statusMessage.classList.toggle("text-rose-700", isError);
    elements.statusMessage.classList.toggle("text-ink/70", !isError);
}

async function requestApi(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
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

function setActiveAdminTab(state, elements, tabName) {
    state.activeTab = tabName;

    elements.tabButtons.forEach((button) => {
        const isActive = button.dataset.adminTab === tabName;
        button.classList.toggle("is-active", isActive);
        button.classList.toggle("bg-sand", isActive);
        button.classList.toggle("bg-white", !isActive);
    });

    elements.panels.forEach((panel) => {
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

function fillMetadata(state, elements) {
    if (!state.metadata) {
        return;
    }

    fillSelect(
        elements.ingredient.categorySelect,
        state.metadata.ingredient_categories || [],
        "name",
        "id",
        false
    );

    fillSelect(
        elements.recipe.statusSelect,
        state.metadata.recipe_statuses || [],
        "name",
        "id",
        false
    );

    fillSelect(
        elements.recipe.categorySelect,
        state.metadata.recipe_categories || [],
        "name"
    );

    fillSelect(
        elements.recipe.difficultySelect,
        state.metadata.recipe_difficulties || [],
        "name"
    );
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

async function loadMetadata(state, elements) {
    const payload = await requestApi("/metadata");
    state.metadata = payload.data;
    fillMetadata(state, elements);
}

async function reloadAllData(state, elements) {
    await loadMetadata(state, elements);
    await loadIngredients(state, elements);
    await loadRecipes(state, elements);
}

function registerAdminEvents(state, elements) {
    elements.tabButtons.forEach((button) => {
        button.addEventListener("click", () => {
            setActiveAdminTab(state, elements, button.dataset.adminTab);
        });
    });

    elements.ingredient.form.addEventListener("submit", async (event) => {
        try {
            await handleIngredientSubmit(event, state, elements);
        } catch (error) {
            setStatusMessage(elements, error.message, true);
        }
    });

    elements.recipe.form.addEventListener("submit", async (event) => {
        try {
            await handleRecipeSubmit(event, state, elements);
        } catch (error) {
            setStatusMessage(elements, error.message, true);
        }
    });

    elements.ingredient.deleteButton.addEventListener("click", async () => {
        try {
            await handleIngredientDelete(state, elements);
        } catch (error) {
            setStatusMessage(elements, error.message, true);
        }
    });

    elements.recipe.deleteButton.addEventListener("click", async () => {
        try {
            await handleRecipeDelete(state, elements);
        } catch (error) {
            setStatusMessage(elements, error.message, true);
        }
    });

    elements.ingredient.resetButton.addEventListener("click", () => {
        resetIngredientForm(elements);
    });

    elements.recipe.resetButton.addEventListener("click", () => {
        resetRecipeForm(state, elements);
    });

    elements.recipe.addIngredientButton.addEventListener("click", () => {
        addRecipeIngredientRow(state, elements);
    });

    elements.recipe.addStepButton.addEventListener("click", () => {
        addRecipeStepRow(elements);
    });

    elements.ingredient.searchInput.addEventListener("input", () => {
        renderIngredientList(state, elements);
    });

    elements.recipe.searchInput.addEventListener("input", () => {
        renderRecipeList(state, elements);
    });
}

async function initCatalogAdminPage() {
    const elements = getAdminElements();
    const state = createAdminState();

    registerAdminEvents(state, elements);
    setActiveAdminTab(state, elements, "ingredients");
    setStatusMessage(elements, "Cargando catalogos administrativos...");

    try {
        await reloadAllData(state, elements);
        resetIngredientForm(elements);
        resetRecipeForm(state, elements);
        setStatusMessage(elements, "Catalogos cargados. Ya puedes administrar ingredientes y recetas.");
    } catch (error) {
        setStatusMessage(elements, error.message, true);
    }
}



