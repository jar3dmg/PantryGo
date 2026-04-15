import re


def clean_ingredient(raw_string: str) -> str:
    """Limpia y normaliza un ingrediente para poder compararlo mejor."""
    ingredient = raw_string.lower()

    units = [
        "cup",
        "c.",
        "cups",
        "tablespoon",
        "tbsp",
        "teaspoon",
        "tsp",
        "ounce",
        "oz",
        "pound",
        "lb",
        "lbs",
        "gram",
        "g",
        "kg",
        "ml",
        "l",
        "clove",
        "cloves",
        "pinch",
        "dash",
        "package",
        "pkg",
        "can",
    ]
    descriptors = [
        "packed",
        "chopped",
        "diced",
        "minced",
        "melted",
        "fresh",
        "dry",
        "ground",
        "sliced",
        "firmly",
        "softened",
        "beaten",
        "shredded",
        "optional",
        "to taste",
        "large",
        "medium",
        "small",
        "thin",
        "thick",
    ]

    ingredient = re.sub(r"^\s*[\d\s/.-]+", "", ingredient).strip()
    ingredient = re.sub(r"\s*\(.*\)\s*", " ", ingredient).strip()

    clean_words = []
    for word in ingredient.split():
        word_cleaned = word.strip(",.")
        if word_cleaned not in units and word_cleaned not in descriptors:
            clean_words.append(word_cleaned)

    final_name = " ".join(clean_words).replace(" and ", " ")
    return final_name.strip()
