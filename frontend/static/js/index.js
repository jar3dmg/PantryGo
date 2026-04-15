// Maneja la seleccion de ingredientes del inventario y su guardado local.

const STORAGE_KEYS = {
    available: "availableIngredients",
    banned: "bannedIngredients",
    activeTab: "ingredientModeTab",
};

const catalogScript = document.getElementById("ingredient-catalog-data");
const ingredientCatalog = catalogScript ? JSON.parse(catalogScript.textContent) : [];

const categorySelect = document.getElementById("ingredient-category-select");
const ingredientSelect = document.getElementById("ingredient-select");
const addAvailableButton = document.getElementById("add-available-button");
const addBannedButton = document.getElementById("add-banned-button");
const clearButton = document.getElementById("clear-button");
const availableInput = document.getElementById("available-ingredients-input");
const bannedInput = document.getElementById("banned-ingredients-input");
const availableChipList = document.getElementById("available-chip-list");
const bannedChipList = document.getElementById("banned-chip-list");
const availableCount = document.getElementById("available-count");
const bannedCount = document.getElementById("banned-count");
const availableEmptyState = document.getElementById("available-empty-state");
const bannedEmptyState = document.getElementById("banned-empty-state");
const tabButtons = Array.from(document.querySelectorAll(".app-tab"));
const tabPanels = Array.from(document.querySelectorAll(".app-tab-panel"));
const catalogActionButtons = Array.from(document.querySelectorAll(".catalog-action"));

let selectedAvailable = [];
let selectedBanned = [];

function normalizeText(value) {
    return value.trim();
}

function saveSelections() {
    // Guarda las selecciones para restaurarlas al volver a entrar.
    localStorage.setItem(STORAGE_KEYS.available, JSON.stringify(selectedAvailable));
    localStorage.setItem(STORAGE_KEYS.banned, JSON.stringify(selectedBanned));
}

function syncHiddenInputs() {
    // Prepara los campos ocultos que Flask recibe en el formulario.
    if (availableInput) {
        availableInput.value = selectedAvailable.join(", ");
    }

    if (bannedInput) {
        bannedInput.value = selectedBanned.join(", ");
    }
}

function createChip(name, type) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className =
        type === "available"
            ? "selection-chip inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-ink shadow-sm"
            : "selection-chip inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-rose-700 shadow-sm";
    chip.dataset.name = name;
    chip.dataset.type = type;
    chip.innerHTML = `<span>${name}</span><span class="text-xs opacity-70">×</span>`;
    chip.addEventListener("click", () => removeIngredient(type, name));
    return chip;
}

function renderSelectionList(type) {
    // Redibuja chips, contadores y estados vacios del bloque indicado.
    const isAvailable = type === "available";
    const items = isAvailable ? selectedAvailable : selectedBanned;
    const listElement = isAvailable ? availableChipList : bannedChipList;
    const countElement = isAvailable ? availableCount : bannedCount;
    const emptyElement = isAvailable ? availableEmptyState : bannedEmptyState;

    if (!listElement || !countElement || !emptyElement) {
        return;
    }

    listElement.innerHTML = "";
    items.forEach((item) => listElement.appendChild(createChip(item, type)));
    countElement.textContent = String(items.length);
    emptyElement.classList.toggle("hidden", items.length > 0);
}

function renderSelections() {
    renderSelectionList("available");
    renderSelectionList("banned");
    syncHiddenInputs();
    saveSelections();
}

function addIngredient(type, ingredientName) {
    // Evita que un ingrediente quede a la vez en disponibles y prohibidos.
    const cleanName = normalizeText(ingredientName);
    if (!cleanName) {
        return;
    }

    if (type === "available") {
        if (!selectedAvailable.includes(cleanName)) {
            selectedAvailable.push(cleanName);
            selectedAvailable.sort();
        }
        selectedBanned = selectedBanned.filter((item) => item !== cleanName);
    } else {
        if (!selectedBanned.includes(cleanName)) {
            selectedBanned.push(cleanName);
            selectedBanned.sort();
        }
        selectedAvailable = selectedAvailable.filter((item) => item !== cleanName);
    }

    renderSelections();
}

function removeIngredient(type, ingredientName) {
    if (type === "available") {
        selectedAvailable = selectedAvailable.filter((item) => item !== ingredientName);
    } else {
        selectedBanned = selectedBanned.filter((item) => item !== ingredientName);
    }

    renderSelections();
}

function populateIngredientSelect(categorySlug) {
    // Cambia la lista de ingredientes segun la categoria seleccionada.
    if (!ingredientSelect) {
        return;
    }

    ingredientSelect.innerHTML = "";

    if (!categorySlug) {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "Primero elige una categoria";
        ingredientSelect.appendChild(option);
        return;
    }

    const category = ingredientCatalog.find((item) => item.slug === categorySlug);
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

function getSelectedIngredientName() {
    return ingredientSelect ? normalizeText(ingredientSelect.value) : "";
}

function setActiveTab(targetId) {
    // Activa una pestana y oculta visualmente las demas.
    tabButtons.forEach((button) => {
        const isActive = button.dataset.tabTarget === targetId;
        button.classList.toggle("is-active", isActive);
        button.classList.toggle("bg-sand", isActive);
        button.classList.toggle("bg-white", !isActive);
        button.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    tabPanels.forEach((panel) => {
        panel.classList.toggle("hidden", panel.id !== targetId);
    });

    localStorage.setItem(STORAGE_KEYS.activeTab, targetId);
}

function clearSelections() {
    selectedAvailable = [];
    selectedBanned = [];

    if (categorySelect) {
        categorySelect.value = "";
    }

    populateIngredientSelect("");
    localStorage.removeItem(STORAGE_KEYS.available);
    localStorage.removeItem(STORAGE_KEYS.banned);
    renderSelections();
}

function loadSelections() {
    // Recupera estado previo guardado en localStorage.
    const savedAvailable = localStorage.getItem(STORAGE_KEYS.available);
    const savedBanned = localStorage.getItem(STORAGE_KEYS.banned);
    const savedTab = localStorage.getItem(STORAGE_KEYS.activeTab);

    selectedAvailable = savedAvailable ? JSON.parse(savedAvailable) : [];
    selectedBanned = savedBanned ? JSON.parse(savedBanned) : [];
    renderSelections();
    setActiveTab(savedTab || "inventory-panel");
    populateIngredientSelect(categorySelect ? categorySelect.value : "");
}

if (categorySelect) {
    categorySelect.addEventListener("change", (event) => {
        populateIngredientSelect(event.target.value);
    });
}

if (addAvailableButton) {
    addAvailableButton.addEventListener("click", () => {
        addIngredient("available", getSelectedIngredientName());
    });
}

if (addBannedButton) {
    addBannedButton.addEventListener("click", () => {
        addIngredient("banned", getSelectedIngredientName());
    });
}

if (clearButton) {
    clearButton.addEventListener("click", clearSelections);
}

tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
        setActiveTab(button.dataset.tabTarget);
    });
});

catalogActionButtons.forEach((button) => {
    button.addEventListener("click", () => {
        addIngredient(button.dataset.catalogAction, button.dataset.ingredientName);
        setActiveTab("inventory-panel");
    });
});

document.addEventListener("DOMContentLoaded", loadSelections);
