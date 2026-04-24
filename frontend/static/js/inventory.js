// Maneja la seleccion de ingredientes del inventario y su guardado local.

document.addEventListener("DOMContentLoaded", initInventoryPage);

// funcion de entrada que inicializa todo
function initInventoryPage() {
    const elements = getInventoryElements();
    if (!elements) {
        return;
    }

    const catalog = getIngredientCatalog();
    const state = createInitialInventoryState(catalog);

    bindInventoryEvents(state, elements);
    loadInventoryState(state);
    renderInventoryPage(state, elements);
}

// Inicializacion de los elementos manipulables y leibles
function getInventoryElements() {
    const form = document.querySelector("form");
    const categorySelect = document.getElementById("ingredient-category-select");
    const ingredientSelect = document.getElementById("ingredient-select");

    if (!form || !categorySelect || !ingredientSelect) {
        return null;
    }

    return {
        form,
        categorySelect,
        ingredientSelect,
        addAvailableButton: document.getElementById("add-available-button"),
        addBannedButton: document.getElementById("add-banned-button"),
        clearButton: document.getElementById("clear-button"),
        availableInput: document.getElementById("available-ingredients-input"),
        bannedInput: document.getElementById("banned-ingredients-input"),
        availableChipList: document.getElementById("available-chip-list"),
        bannedChipList: document.getElementById("banned-chip-list"),
        availableCount: document.getElementById("available-count"),
        bannedCount: document.getElementById("banned-count"),
        availableEmptyState: document.getElementById("available-empty-state"),
        bannedEmptyState: document.getElementById("banned-empty-state"),
        tabButtons: Array.from(document.querySelectorAll(".app-tab")),
        tabPanels: Array.from(document.querySelectorAll(".app-tab-panel")),
        catalogActionButtons: Array.from(document.querySelectorAll(".catalog-action")),
    };
}

// Funcion de inicializacion del catalogo
function getIngredientCatalog() {
    const catalogScript = document.getElementById("ingredient-catalog-data");

    if (!catalogScript) {
        return [];
    }

    try {
        return JSON.parse(catalogScript.textContent);
    } catch (error) {
        console.error("Could not parse ingredient catalog:", error);
        return [];
    }
}

// Create the state variables (used for storing data)
function createInitialInventoryState(catalog) {
    return {
        catalog,
        selectedAvailable: [],
        selectedBanned: [],
        activeTab: "inventory-panel",
    };
}

function bindInventoryEvents(state, elements) {
    elements.categorySelect.addEventListener("change", () => {
        renderIngredientSelect(state, elements);
    });

    if (elements.addAvailableButton) {
        elements.addAvailableButton.addEventListener("click", () => {
            const ingredientName = getSelectedIngredientName(elements);
            addIngredient(state, "available", ingredientName);
            renderInventoryPage(state, elements);
        });
    }

    if (elements.addBannedButton) {
        elements.addBannedButton.addEventListener("click", () => {
            const ingredientName = getSelectedIngredientName(elements);
            addIngredient(state, "banned", ingredientName);
            renderInventoryPage(state, elements);
        });
    }

    if (elements.clearButton) {
        elements.clearButton.addEventListener("click", () => {
            clearSelections(state, elements);
            renderInventoryPage(state, elements);
        });
    }

    elements.catalogActionButtons.forEach((button) => {
        button.addEventListener("click", () => {
            addIngredient(state, button.dataset.catalogAction, button.dataset.ingredientName);
            state.activeTab = "inventory-panel";
            renderInventoryPage(state, elements);
        });
    });

    elements.tabButtons.forEach((button) => {
        button.addEventListener("click", () => {
            state.activeTab = button.dataset.tabTarget;
            renderInventoryPage(state, elements);
        });
    });
}

function loadInventoryState(state) {
    const savedAvailable = localStorage.getItem("availableIngredients");
    const savedBanned = localStorage.getItem("bannedIngredients");
    const savedTab = localStorage.getItem("ingredientModeTab");

    state.selectedAvailable = savedAvailable ? JSON.parse(savedAvailable) : [];
    state.selectedBanned = savedBanned ? JSON.parse(savedBanned) : [];
    state.activeTab = savedTab || "inventory-panel";
}

function renderInventoryPage(state, elements) {
    renderIngredientSelect(state, elements);
    renderSelections(state, elements);
    renderTabs(state, elements);
    syncHiddenInputs(state, elements);
    saveInventoryState(state);
}

function renderIngredientSelect(state, elements) {
    const { categorySelect, ingredientSelect } = elements;

    if (!categorySelect || !ingredientSelect) {
        return;
    }

    const selectedCategorySlug = categorySelect.value;
    ingredientSelect.innerHTML = "";

    if (!selectedCategorySlug) {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "Primero elige una categoria";
        ingredientSelect.appendChild(option);
        return;
    }

    const category = state.catalog.find(
        (item) => item.slug === selectedCategorySlug
    );

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Selecciona un ingrediente";
    ingredientSelect.appendChild(defaultOption);

    if (!category) {
        return;
    }

    category.ingredients.forEach((ingredient) => {
        const option = document.createElement("option");
        option.value = ingredient.name;
        option.textContent = ingredient.name;
        ingredientSelect.appendChild(option);
    });
}

function renderTabs(state, elements) {
    elements.tabButtons.forEach((button) => {
        const isActive = button.dataset.tabTarget === state.activeTab;
        button.classList.toggle("is-active", isActive);
        button.classList.toggle("bg-sand", isActive);
        button.classList.toggle("bg-white", !isActive);
        button.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    elements.tabPanels.forEach((panel) => {
        panel.classList.toggle("hidden", panel.id !== state.activeTab);
    });
}

function saveInventoryState(state) {
    localStorage.setItem("availableIngredients", JSON.stringify(state.selectedAvailable));
    localStorage.setItem("bannedIngredients", JSON.stringify(state.selectedBanned));
    localStorage.setItem("ingredientModeTab", state.activeTab);
}

function syncHiddenInputs(state, elements) {
    if (elements.availableInput) {
        elements.availableInput.value = state.selectedAvailable.join(", ");
    }

    if (elements.bannedInput) {
        elements.bannedInput.value = state.selectedBanned.join(", ");
    }
}

function renderSelections(state, elements) {
    renderSelectionList(
        state.selectedAvailable,
        "available",
        elements.availableChipList,
        elements.availableCount,
        elements.availableEmptyState,
        state,
        elements
    );

    renderSelectionList(
        state.selectedBanned,
        "banned",
        elements.bannedChipList,
        elements.bannedCount,
        elements.bannedEmptyState,
        state,
        elements
    );
}

function renderSelectionList(items, type, listElement, countElement, emptyElement, state, elements) {
    if (!listElement || !countElement || !emptyElement) {
        return;
    }

    listElement.innerHTML = "";

    items.forEach((item) => {
        listElement.appendChild(
            createChip(item, type, () => {
                removeIngredient(state, type, item);
                renderInventoryPage(state, elements);
            })
        );
    });

    countElement.textContent = String(items.length);
    emptyElement.classList.toggle("hidden", items.length > 0);
}

function normalizeText(value) {
    return value.trim();
}

function createChip(name, type, onRemove) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className =
        type === "available"
            ? "selection-chip inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-ink shadow-sm"
            : "selection-chip inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-rose-700 shadow-sm";

    chip.innerHTML = `<span>${name}</span><span class="text-xs opacity-70">×</span>`;
    chip.addEventListener("click", onRemove);
    return chip;
}

function addIngredient(state, type, ingredientName) {
    const cleanName = normalizeText(ingredientName);
    if (!cleanName) {
        return;
    }

    if (type === "available") {
        if (!state.selectedAvailable.includes(cleanName)) {
            state.selectedAvailable.push(cleanName);
            state.selectedAvailable.sort();
        }
        state.selectedBanned = state.selectedBanned.filter((item) => item !== cleanName);
    } else {
        if (!state.selectedBanned.includes(cleanName)) {
            state.selectedBanned.push(cleanName);
            state.selectedBanned.sort();
        }
        state.selectedAvailable = state.selectedAvailable.filter((item) => item !== cleanName);
    }
}

function removeIngredient(state, type, ingredientName) {
    if (type === "available") {
        state.selectedAvailable = state.selectedAvailable.filter((item) => item !== ingredientName);
    } else {
        state.selectedBanned = state.selectedBanned.filter((item) => item !== ingredientName);
    }
}

function getSelectedIngredientName(elements) {
    if (!elements.ingredientSelect) {
        return "";
    }

    return normalizeText(elements.ingredientSelect.value);
}

function clearSelections(state, elements) {
    state.selectedAvailable = [];
    state.selectedBanned = [];
    state.activeTab = "inventory-panel";

    if (elements.categorySelect) {
        elements.categorySelect.value = "";
    }
}