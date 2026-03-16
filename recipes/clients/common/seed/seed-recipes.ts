/** Recipe definitions for seed data. Each gets an Unsplash image via searchQuery. */
export const SEED_RECIPES = [
  {
    title: "Simple Pasta",
    subtitle: "Quick weeknight dinner",
    searchQuery: "pasta",
    initialVersion: {
      ingredients: [
        { name: "Pasta", quantity: "400", unit: "g" },
        { name: "Olive oil", quantity: "2", unit: "tbsp" },
        { name: "Garlic", quantity: "2", unit: "cloves" },
      ],
      instructionsMarkdown:
        "Boil pasta. Sauté garlic in oil. Toss and serve.",
    },
  },
  {
    title: "Green Salad",
    subtitle: "Fresh side",
    searchQuery: "green salad",
    initialVersion: {
      ingredients: [
        { name: "Lettuce", quantity: "1", unit: "head" },
        { name: "Cucumber", quantity: "1", unit: "" },
        { name: "Olive oil", quantity: "1", unit: "tbsp" },
      ],
      instructionsMarkdown: "Chop vegetables. Dress with oil and season.",
    },
  },
  {
    title: "Scrambled Eggs",
    subtitle: "Classic breakfast",
    searchQuery: "scrambled eggs",
    initialVersion: {
      ingredients: [
        { name: "Eggs", quantity: "4", unit: "" },
        { name: "Butter", quantity: "1", unit: "tbsp" },
      ],
      instructionsMarkdown:
        "Beat eggs. Melt butter in pan. Scramble over low heat.",
    },
  },
  {
    title: "Tomato Soup",
    subtitle: "Comfort in a bowl",
    searchQuery: "tomato soup",
    initialVersion: {
      ingredients: [
        { name: "Canned tomatoes", quantity: "400", unit: "g" },
        { name: "Onion", quantity: "1", unit: "" },
        { name: "Basil", quantity: "few", unit: "leaves" },
      ],
      instructionsMarkdown:
        "Sauté onion. Add tomatoes and basil. Simmer and blend.",
    },
  },
  {
    title: "Garlic Bread",
    subtitle: "Crispy and buttery",
    searchQuery: "garlic bread",
    initialVersion: {
      ingredients: [
        { name: "Baguette", quantity: "1", unit: "" },
        { name: "Butter", quantity: "4", unit: "tbsp" },
        { name: "Garlic", quantity: "3", unit: "cloves" },
      ],
      instructionsMarkdown:
        "Mix soft butter with minced garlic. Spread on bread. Bake until golden.",
    },
  },
  {
    title: "Caesar Salad",
    subtitle: "Classic with croutons",
    searchQuery: "caesar salad",
    initialVersion: {
      ingredients: [
        { name: "Romaine", quantity: "1", unit: "head" },
        { name: "Parmesan", quantity: "50", unit: "g" },
        { name: "Croutons", quantity: "1", unit: "cup" },
        { name: "Caesar dressing", quantity: "3", unit: "tbsp" },
      ],
      instructionsMarkdown:
        "Chop romaine. Toss with dressing, parmesan, and croutons.",
    },
  },
  {
    title: "French Toast",
    subtitle: "Sweet breakfast",
    searchQuery: "french toast",
    initialVersion: {
      ingredients: [
        { name: "Bread", quantity: "4", unit: "slices" },
        { name: "Eggs", quantity: "2", unit: "" },
        { name: "Milk", quantity: "2", unit: "tbsp" },
        { name: "Cinnamon", quantity: "½", unit: "tsp" },
      ],
      instructionsMarkdown:
        "Whisk eggs, milk, cinnamon. Soak bread. Fry in butter until golden.",
    },
  },
  {
    title: "Chicken Noodle Soup",
    subtitle: "Hearty and comforting",
    searchQuery: "chicken noodle soup",
    initialVersion: {
      ingredients: [
        { name: "Chicken broth", quantity: "1", unit: "L" },
        { name: "Egg noodles", quantity: "200", unit: "g" },
        { name: "Cooked chicken", quantity: "2", unit: "cups" },
        { name: "Carrots", quantity: "2", unit: "" },
      ],
      instructionsMarkdown:
        "Simmer broth with diced carrots. Add noodles and chicken. Cook until noodles are tender.",
    },
  },
  {
    title: "Roasted Vegetables",
    subtitle: "Caramelized and simple",
    searchQuery: "roasted vegetables",
    initialVersion: {
      ingredients: [
        { name: "Bell peppers", quantity: "2", unit: "" },
        { name: "Zucchini", quantity: "2", unit: "" },
        { name: "Olive oil", quantity: "2", unit: "tbsp" },
        { name: "Salt and pepper", quantity: "", unit: "" },
      ],
      instructionsMarkdown:
        "Chop vegetables. Toss with oil and seasonings. Roast at 200°C until tender.",
    },
  },
  {
    title: "Margherita Pizza",
    subtitle: "Tomato, mozzarella, basil",
    searchQuery: "margherita pizza",
    initialVersion: {
      ingredients: [
        { name: "Pizza dough", quantity: "1", unit: "ball" },
        { name: "Tomato sauce", quantity: "½", unit: "cup" },
        { name: "Mozzarella", quantity: "150", unit: "g" },
        { name: "Fresh basil", quantity: "handful", unit: "" },
      ],
      instructionsMarkdown:
        "Stretch dough. Top with sauce and cheese. Bake until bubbly. Add basil.",
    },
  },
  {
    title: "Omelette",
    subtitle: "Fluffy and fillable",
    searchQuery: "omelette",
    initialVersion: {
      ingredients: [
        { name: "Eggs", quantity: "3", unit: "" },
        { name: "Butter", quantity: "1", unit: "tbsp" },
        { name: "Fillings of choice", quantity: "", unit: "" },
      ],
      instructionsMarkdown:
        "Beat eggs. Melt butter in nonstick pan. Pour eggs, add fillings, fold.",
    },
  },
  {
    title: "Butternut Squash Soup",
    subtitle: "Creamy and warming",
    searchQuery: "butternut squash soup",
    initialVersion: {
      ingredients: [
        { name: "Butternut squash", quantity: "1", unit: "" },
        { name: "Onion", quantity: "1", unit: "" },
        { name: "Vegetable stock", quantity: "500", unit: "ml" },
        { name: "Cream", quantity: "2", unit: "tbsp" },
      ],
      instructionsMarkdown:
        "Roast squash. Sauté onion. Blend with stock and cream until smooth.",
    },
  },
  {
    title: "Mashed Potatoes",
    subtitle: "Creamy and smooth",
    searchQuery: "mashed potatoes",
    initialVersion: {
      ingredients: [
        { name: "Potatoes", quantity: "1", unit: "kg" },
        { name: "Butter", quantity: "50", unit: "g" },
        { name: "Milk", quantity: "100", unit: "ml" },
      ],
      instructionsMarkdown:
        "Boil peeled potatoes until tender. Mash with butter and warm milk.",
    },
  },
  {
    title: "Spaghetti Carbonara",
    subtitle: "Roman classic",
    searchQuery: "spaghetti carbonara",
    initialVersion: {
      ingredients: [
        { name: "Spaghetti", quantity: "400", unit: "g" },
        { name: "Guanciale", quantity: "150", unit: "g" },
        { name: "Egg yolks", quantity: "4", unit: "" },
        { name: "Pecorino", quantity: "50", unit: "g" },
      ],
      instructionsMarkdown:
        "Cook pasta. Fry guanciale. Toss hot pasta with egg yolks, cheese, and guanciale.",
    },
  },
  {
    title: "Greek Salad",
    subtitle: "Feta and olives",
    searchQuery: "greek salad",
    initialVersion: {
      ingredients: [
        { name: "Cucumber", quantity: "1", unit: "" },
        { name: "Tomatoes", quantity: "3", unit: "" },
        { name: "Feta", quantity: "100", unit: "g" },
        { name: "Kalamata olives", quantity: "50", unit: "g" },
      ],
      instructionsMarkdown:
        "Chop cucumber and tomatoes. Add cubed feta and olives. Dress with olive oil and oregano.",
    },
  },
  {
    title: "Pancakes",
    subtitle: "Fluffy stack",
    searchQuery: "pancakes",
    initialVersion: {
      ingredients: [
        { name: "Flour", quantity: "1", unit: "cup" },
        { name: "Milk", quantity: "1", unit: "cup" },
        { name: "Egg", quantity: "1", unit: "" },
        { name: "Baking powder", quantity: "1", unit: "tsp" },
      ],
      instructionsMarkdown:
        "Mix dry and wet ingredients. Ladle onto hot griddle. Flip when bubbly.",
    },
  },
  {
    title: "Minestrone",
    subtitle: "Italian vegetable soup",
    searchQuery: "minestrone soup",
    initialVersion: {
      ingredients: [
        { name: "Cannellini beans", quantity: "400", unit: "g" },
        { name: "Pasta", quantity: "100", unit: "g" },
        { name: "Tomatoes", quantity: "400", unit: "g" },
        { name: "Celery", quantity: "2", unit: "stalks" },
      ],
      instructionsMarkdown:
        "Sauté celery and onion. Add tomatoes, beans, stock. Simmer. Add pasta and cook.",
    },
  },
  {
    title: "Grilled Cheese",
    subtitle: "Crispy and melty",
    searchQuery: "grilled cheese",
    initialVersion: {
      ingredients: [
        { name: "Bread", quantity: "2", unit: "slices" },
        { name: "Cheddar", quantity: "2", unit: "slices" },
        { name: "Butter", quantity: "1", unit: "tbsp" },
      ],
      instructionsMarkdown:
        "Butter bread. Sandwich cheese. Grill in pan until golden and melted.",
    },
  },
  {
    title: "Beef Tacos",
    subtitle: "Spiced and fresh",
    searchQuery: "beef tacos",
    initialVersion: {
      ingredients: [
        { name: "Ground beef", quantity: "400", unit: "g" },
        { name: "Taco shells", quantity: "8", unit: "" },
        { name: "Lettuce", quantity: "1", unit: "cup" },
        { name: "Salsa", quantity: "4", unit: "tbsp" },
      ],
      instructionsMarkdown:
        "Brown beef with taco seasoning. Warm shells. Fill with beef, lettuce, salsa.",
    },
  },
  {
    title: "Caprese Salad",
    subtitle: "Mozzarella and tomato",
    searchQuery: "caprese salad",
    initialVersion: {
      ingredients: [
        { name: "Tomatoes", quantity: "3", unit: "" },
        { name: "Mozzarella", quantity: "200", unit: "g" },
        { name: "Basil", quantity: "1", unit: "bunch" },
        { name: "Balsamic", quantity: "1", unit: "tbsp" },
      ],
      instructionsMarkdown:
        "Slice tomatoes and mozzarella. Layer with basil. Drizzle balsamic and oil.",
    },
  },
  {
    title: "Waffles",
    subtitle: "Crispy outside, soft inside",
    searchQuery: "waffles",
    initialVersion: {
      ingredients: [
        { name: "Flour", quantity: "2", unit: "cups" },
        { name: "Eggs", quantity: "2", unit: "" },
        { name: "Milk", quantity: "1½", unit: "cups" },
        { name: "Baking powder", quantity: "2", unit: "tsp" },
      ],
      instructionsMarkdown:
        "Mix batter. Pour into waffle iron. Cook until golden and crisp.",
    },
  },
  {
    title: "Lentil Soup",
    subtitle: "Hearty and healthy",
    searchQuery: "lentil soup",
    initialVersion: {
      ingredients: [
        { name: "Red lentils", quantity: "200", unit: "g" },
        { name: "Onion", quantity: "1", unit: "" },
        { name: "Carrot", quantity: "2", unit: "" },
        { name: "Cumin", quantity: "1", unit: "tsp" },
      ],
      instructionsMarkdown:
        "Sauté onion and carrot. Add lentils and stock. Simmer until tender. Season with cumin.",
    },
  },
  {
    title: "Roast Chicken",
    subtitle: "Golden and juicy",
    searchQuery: "roast chicken",
    initialVersion: {
      ingredients: [
        { name: "Whole chicken", quantity: "1.5", unit: "kg" },
        { name: "Lemon", quantity: "1", unit: "" },
        { name: "Garlic", quantity: "1", unit: "head" },
        { name: "Herbs", quantity: "sprigs", unit: "" },
      ],
      instructionsMarkdown:
        "Season chicken. Stuff with lemon and garlic. Roast at 190°C until juices run clear.",
    },
  },
  {
    title: "Fettuccine Alfredo",
    subtitle: "Creamy pasta",
    searchQuery: "fettuccine alfredo",
    initialVersion: {
      ingredients: [
        { name: "Fettuccine", quantity: "400", unit: "g" },
        { name: "Heavy cream", quantity: "1", unit: "cup" },
        { name: "Parmesan", quantity: "100", unit: "g" },
        { name: "Butter", quantity: "50", unit: "g" },
      ],
      instructionsMarkdown:
        "Cook pasta. Warm cream and butter. Toss with parmesan and pasta.",
    },
  },
  {
    title: "Coleslaw",
    subtitle: "Creamy cabbage slaw",
    searchQuery: "coleslaw",
    initialVersion: {
      ingredients: [
        { name: "Cabbage", quantity: "½", unit: "head" },
        { name: "Carrot", quantity: "2", unit: "" },
        { name: "Mayo", quantity: "3", unit: "tbsp" },
        { name: "Vinegar", quantity: "1", unit: "tbsp" },
      ],
      instructionsMarkdown:
        "Shred cabbage and carrot. Mix with mayo and vinegar. Chill before serving.",
    },
  },
  {
    title: "Huevos Rancheros",
    subtitle: "Eggs with salsa",
    searchQuery: "huevos rancheros",
    initialVersion: {
      ingredients: [
        { name: "Eggs", quantity: "4", unit: "" },
        { name: "Tortillas", quantity: "4", unit: "" },
        { name: "Salsa", quantity: "1", unit: "cup" },
        { name: "Black beans", quantity: "1", unit: "can" },
      ],
      instructionsMarkdown:
        "Warm tortillas. Fry eggs. Top with salsa and beans.",
    },
  },
  {
    title: "Clam Chowder",
    subtitle: "New England style",
    searchQuery: "clam chowder",
    initialVersion: {
      ingredients: [
        { name: "Clams", quantity: "500", unit: "g" },
        { name: "Potatoes", quantity: "3", unit: "" },
        { name: "Cream", quantity: "200", unit: "ml" },
        { name: "Bacon", quantity: "4", unit: "strips" },
      ],
      instructionsMarkdown:
        "Cook bacon. Sauté onion. Add potatoes and clam juice. Simmer. Add clams and cream.",
    },
  },
  {
    title: "Baked Potato",
    subtitle: "Loaded or simple",
    searchQuery: "baked potato",
    initialVersion: {
      ingredients: [
        { name: "Russet potatoes", quantity: "4", unit: "" },
        { name: "Butter", quantity: "2", unit: "tbsp" },
        { name: "Sour cream", quantity: "4", unit: "tbsp" },
        { name: "Chives", quantity: "2", unit: "tbsp" },
      ],
      instructionsMarkdown:
        "Bake potatoes at 200°C until tender. Split and top with butter, sour cream, chives.",
    },
  },
  {
    title: "Chicken Stir Fry",
    subtitle: "Quick and colorful",
    searchQuery: "chicken stir fry",
    initialVersion: {
      ingredients: [
        { name: "Chicken breast", quantity: "400", unit: "g" },
        { name: "Bell peppers", quantity: "2", unit: "" },
        { name: "Soy sauce", quantity: "2", unit: "tbsp" },
        { name: "Vegetable oil", quantity: "2", unit: "tbsp" },
      ],
      instructionsMarkdown:
        "Slice chicken and vegetables. Stir-fry in hot wok. Add soy sauce and serve over rice.",
    },
  },
  {
    title: "Waldorf Salad",
    subtitle: "Apples, celery, walnuts",
    searchQuery: "waldorf salad",
    initialVersion: {
      ingredients: [
        { name: "Apples", quantity: "2", unit: "" },
        { name: "Celery", quantity: "3", unit: "stalks" },
        { name: "Walnuts", quantity: "½", unit: "cup" },
        { name: "Mayo", quantity: "2", unit: "tbsp" },
      ],
      instructionsMarkdown:
        "Dice apples and celery. Toast walnuts. Toss with mayo and lemon juice.",
    },
  },
  {
    title: "Oatmeal",
    subtitle: "Warm and filling",
    searchQuery: "oatmeal",
    initialVersion: {
      ingredients: [
        { name: "Rolled oats", quantity: "1", unit: "cup" },
        { name: "Milk or water", quantity: "2", unit: "cups" },
        { name: "Pinch of salt", quantity: "", unit: "" },
      ],
      instructionsMarkdown:
        "Bring liquid to boil. Stir in oats. Simmer 5 minutes. Top with fruit or honey.",
    },
  },
  {
    title: "Pho",
    subtitle: "Vietnamese noodle soup",
    searchQuery: "pho soup",
    initialVersion: {
      ingredients: [
        { name: "Beef broth", quantity: "1.5", unit: "L" },
        { name: "Rice noodles", quantity: "200", unit: "g" },
        { name: "Thin beef", quantity: "200", unit: "g" },
        { name: "Bean sprouts", quantity: "1", unit: "cup" },
      ],
      instructionsMarkdown:
        "Simmer broth with spices. Cook noodles. Top with raw beef and herbs. Add hot broth.",
    },
  },
  {
    title: "Sweet Potato Fries",
    subtitle: "Crispy and sweet",
    searchQuery: "sweet potato fries",
    initialVersion: {
      ingredients: [
        { name: "Sweet potatoes", quantity: "2", unit: "" },
        { name: "Olive oil", quantity: "2", unit: "tbsp" },
        { name: "Paprika", quantity: "½", unit: "tsp" },
      ],
      instructionsMarkdown:
        "Cut into sticks. Toss with oil and paprika. Bake at 220°C until crisp.",
    },
  },
  {
    title: "Lasagna",
    subtitle: "Layered and cheesy",
    searchQuery: "lasagna",
    initialVersion: {
      ingredients: [
        { name: "Lasagna sheets", quantity: "12", unit: "" },
        { name: "Bolognese", quantity: "500", unit: "g" },
        { name: "Béchamel", quantity: "2", unit: "cups" },
        { name: "Mozzarella", quantity: "200", unit: "g" },
      ],
      instructionsMarkdown:
        "Layer sheets, bolognese, béchamel, cheese. Repeat. Bake until bubbly.",
    },
  },
  {
    title: "Cobb Salad",
    subtitle: "Loaded with protein",
    searchQuery: "cobb salad",
    initialVersion: {
      ingredients: [
        { name: "Lettuce", quantity: "1", unit: "head" },
        { name: "Chicken", quantity: "1", unit: "breast" },
        { name: "Bacon", quantity: "4", unit: "strips" },
        { name: "Blue cheese", quantity: "50", unit: "g" },
      ],
      instructionsMarkdown:
        "Chop lettuce. Top with diced chicken, bacon, egg, avocado, cheese. Dress and serve.",
    },
  },
  {
    title: "Shakshuka",
    subtitle: "Eggs in tomato sauce",
    searchQuery: "shakshuka",
    initialVersion: {
      ingredients: [
        { name: "Tomatoes", quantity: "400", unit: "g" },
        { name: "Eggs", quantity: "4", unit: "" },
        { name: "Bell pepper", quantity: "1", unit: "" },
        { name: "Cumin", quantity: "1", unit: "tsp" },
      ],
      instructionsMarkdown:
        "Sauté pepper and garlic. Add tomatoes and spices. Simmer. Crack eggs in. Cover until set.",
    },
  },
  {
    title: "Gazpacho",
    subtitle: "Chilled tomato soup",
    searchQuery: "gazpacho",
    initialVersion: {
      ingredients: [
        { name: "Tomatoes", quantity: "1", unit: "kg" },
        { name: "Cucumber", quantity: "1", unit: "" },
        { name: "Bell pepper", quantity: "1", unit: "" },
        { name: "Olive oil", quantity: "3", unit: "tbsp" },
      ],
      instructionsMarkdown:
        "Blend tomatoes, cucumber, pepper, garlic, oil, vinegar. Chill. Serve cold.",
    },
  },
  {
    title: "Mac and Cheese",
    subtitle: "Creamy and indulgent",
    searchQuery: "mac and cheese",
    initialVersion: {
      ingredients: [
        { name: "Elbow macaroni", quantity: "300", unit: "g" },
        { name: "Cheddar", quantity: "200", unit: "g" },
        { name: "Milk", quantity: "2", unit: "cups" },
        { name: "Butter", quantity: "2", unit: "tbsp" },
      ],
      instructionsMarkdown:
        "Cook pasta. Make cheese sauce with butter, flour, milk, cheese. Combine and bake.",
    },
  },
  {
    title: "Beef Stew",
    subtitle: "Hearty and slow-cooked",
    searchQuery: "beef stew",
    initialVersion: {
      ingredients: [
        { name: "Beef chuck", quantity: "800", unit: "g" },
        { name: "Potatoes", quantity: "4", unit: "" },
        { name: "Carrots", quantity: "3", unit: "" },
        { name: "Red wine", quantity: "200", unit: "ml" },
      ],
      instructionsMarkdown:
        "Brown beef. Sauté onions. Add wine, stock, vegetables. Braise until tender.",
    },
  },
  {
    title: "Kale Salad",
    subtitle: "Massaged and tender",
    searchQuery: "kale salad",
    initialVersion: {
      ingredients: [
        { name: "Kale", quantity: "1", unit: "bunch" },
        { name: "Lemon juice", quantity: "2", unit: "tbsp" },
        { name: "Parmesan", quantity: "30", unit: "g" },
        { name: "Olive oil", quantity: "2", unit: "tbsp" },
      ],
      instructionsMarkdown:
        "Remove stems. Massage kale with oil and lemon. Add parmesan and toppings.",
    },
  },
  {
    title: "Belgian Waffles",
    subtitle: "Deep pockets",
    searchQuery: "belgian waffles",
    initialVersion: {
      ingredients: [
        { name: "Flour", quantity: "2", unit: "cups" },
        { name: "Eggs", quantity: "2", unit: "" },
        { name: "Yeast", quantity: "1", unit: "tsp" },
        { name: "Pearl sugar", quantity: "2", unit: "tbsp" },
      ],
      instructionsMarkdown:
        "Make yeast batter. Rest 30 min. Cook in Belgian waffle iron. Serve with syrup.",
    },
  },
  {
    title: "French Onion Soup",
    subtitle: "Cheesy croûte",
    searchQuery: "french onion soup",
    initialVersion: {
      ingredients: [
        { name: "Onions", quantity: "5", unit: "" },
        { name: "Beef stock", quantity: "1", unit: "L" },
        { name: "Gruyère", quantity: "100", unit: "g" },
        { name: "Baguette", quantity: "4", unit: "slices" },
      ],
      instructionsMarkdown:
        "Caramelize onions. Add stock. Simmer. Top with bread and cheese. Broil.",
    },
  },
  {
    title: "Rice Pilaf",
    subtitle: "Fluffy and fragrant",
    searchQuery: "rice pilaf",
    initialVersion: {
      ingredients: [
        { name: "Long-grain rice", quantity: "1", unit: "cup" },
        { name: "Chicken stock", quantity: "2", unit: "cups" },
        { name: "Onion", quantity: "1", unit: "" },
        { name: "Butter", quantity: "2", unit: "tbsp" },
      ],
      instructionsMarkdown:
        "Sauté rice and onion in butter. Add stock. Cover and simmer until tender.",
    },
  },
  {
    title: "Pad Thai",
    subtitle: "Stir-fried noodles",
    searchQuery: "pad thai",
    initialVersion: {
      ingredients: [
        { name: "Rice noodles", quantity: "200", unit: "g" },
        { name: "Shrimp or tofu", quantity: "200", unit: "g" },
        { name: "Fish sauce", quantity: "2", unit: "tbsp" },
        { name: "Tamarind", quantity: "1", unit: "tbsp" },
      ],
      instructionsMarkdown:
        "Soak noodles. Stir-fry protein. Add noodles, sauce, eggs, peanuts. Toss and serve.",
    },
  },
] as const;

export const SEED_COLLECTION_NAME = "Seed Kitchen";

/** Menu definitions for seed data. Groupings use recipe indices (0-based into SEED_RECIPES). */
export const SEED_MENUS = [
  {
    name: "Weeknight Dinners",
    isPublic: true,
    groupings: [
      {
        name: "Mains",
        recipeIndices: [0, 9, 13, 18, 23, 28, 33, 37, 43],
      },
      {
        name: "Sides",
        recipeIndices: [1, 4, 5, 8, 12, 14, 17, 19, 24, 27, 32, 34, 39, 42],
      },
      {
        name: "Soups",
        recipeIndices: [3, 7, 11, 16, 21, 26, 31, 36, 38, 41],
      },
    ],
  },
  {
    name: "Brunch",
    isPublic: false,
    groupings: [
      {
        name: "Mains",
        recipeIndices: [2, 6, 10, 15, 20, 25, 35, 40],
      },
      {
        name: "Sides & extras",
        recipeIndices: [1, 4, 17, 30],
      },
    ],
  },
  {
    name: "Soups & Sides",
    isPublic: true,
    groupings: [
      {
        name: "Soups",
        recipeIndices: [3, 7, 11, 16, 21, 26, 31, 36, 38, 41],
      },
      {
        name: "Sides",
        recipeIndices: [1, 4, 5, 8, 12, 14, 19, 24, 27, 29, 32, 34, 39, 42],
      },
    ],
  },
  {
    name: "Holiday Feast",
    isPublic: true,
    groupings: [
      {
        name: "Mains",
        recipeIndices: [22, 33, 37, 38],
      },
      {
        name: "Sides",
        recipeIndices: [1, 4, 5, 8, 12, 14, 19, 24, 27, 29, 32, 34, 39, 42],
      },
      {
        name: "Soups",
        recipeIndices: [3, 7, 11, 16, 21, 26, 31, 36, 41],
      },
    ],
  },
] as const;
