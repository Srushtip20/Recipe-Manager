// script.js - Complete interactive Recipe Manager
// Full CRUD operations with localStorage persistence

let recipes = [];
let currentCategory = '';
let editingRecipeId = null;

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  initializeRecipes();
  setupEventListeners();
  displayRecipes();
});

/* ====================================================
   FIXED: Load MANUAL + LOCAL recipes together (NO DUPLICATES)
   ==================================================== */
function initializeRecipes() {
  try {
    let stored = JSON.parse(localStorage.getItem('recipes')) || [];
    let manual = Array.isArray(recipesData)
      ? JSON.parse(JSON.stringify(recipesData))
      : [];

    // Merge both
    recipes = [...manual, ...stored];

    // Remove duplicates by ID
    const unique = {};
    recipes.forEach(r => unique[r.id] = r);
    recipes = Object.values(unique);

    // Save cleaned final list
    localStorage.setItem("recipes", JSON.stringify(recipes));

  } catch (err) {
    console.error("INIT ERROR:", err);
    recipes = [];
  }
}

// Save recipes to localStorage
function saveRecipes() {
  try {
    localStorage.setItem('recipes', JSON.stringify(recipes));
  } catch (err) {
    console.error('Failed to save recipes:', err);
  }
}

// Setup all event listeners
function setupEventListeners() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.addEventListener('input', displayRecipes);

  const difficultyFilter = document.getElementById('difficultyFilter');
  const timeFilter = document.getElementById('timeFilter');
  if (difficultyFilter) difficultyFilter.addEventListener('change', displayRecipes);
  if (timeFilter) timeFilter.addEventListener('input', displayRecipes);

  const categoryBtn = document.getElementById('categoryDropdownBtn');
  const categoryMenu = document.getElementById('categoryDropdownMenu');

  if (categoryBtn && categoryMenu) {
    categoryBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      categoryMenu.style.display =
        categoryMenu.style.display === 'block' ? 'none' : 'block';
    });

    const categoryItems = categoryMenu.querySelectorAll('.category-menu-item');
    categoryItems.forEach(item => {
      item.addEventListener('click', () => {
        currentCategory = item.dataset.dish || '';
        categoryMenu.style.display = 'none';
        displayRecipes();
      });
    });

    document.addEventListener('click', () => {
      categoryMenu.style.display = 'none';
    });
  }

  const clearBtn = document.getElementById('clearFilters');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (difficultyFilter) difficultyFilter.value = '';
      if (timeFilter) timeFilter.value = '';
      currentCategory = '';
      displayRecipes();
    });
  }

  const addBtn = document.getElementById('addRecipeBtn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const modal = document.getElementById('addRecipeModal');
      if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      }
    });
  }

  const closeModal = document.getElementById('closeFormModal');
  const cancelModal = document.getElementById('cancelFormModal');

  if (closeModal) {
    closeModal.addEventListener('click', () => {
      const modal = document.getElementById('addRecipeModal');
      if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        document.getElementById('recipeForm')?.reset();
        editingRecipeId = null;
      }
    });
  }

  if (cancelModal) {
    cancelModal.addEventListener('click', () => {
      const modal = document.getElementById('addRecipeModal');
      if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        document.getElementById('recipeForm')?.reset();
        editingRecipeId = null;
      }
    });
  }

  const modal = document.getElementById('addRecipeModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        document.getElementById('recipeForm')?.reset();
        editingRecipeId = null;
      }
    });
  }

  const closeDetailModal = document.getElementById('closeDetailModal');
  const detailModal = document.getElementById('recipeDetailModal');

  if (closeDetailModal && detailModal) {
    closeDetailModal.addEventListener('click', () => {
      detailModal.style.display = 'none';
      document.body.style.overflow = 'auto';
    });

    detailModal.addEventListener('click', (e) => {
      if (e.target === detailModal) {
        detailModal.style.display = 'none';
        document.body.style.overflow = 'auto';
      }
    });
  }

  const backFromDetail = document.getElementById('backToHomeFromDetail');
  const backFromForm = document.getElementById('backToHomeFromForm');
  if (backFromDetail) backFromDetail.addEventListener('click', showHome);
  if (backFromForm) backFromForm.addEventListener('click', showHome);

  const recipeForm = document.getElementById('recipeForm');
  if (recipeForm) {
    recipeForm.addEventListener('submit', handleFormSubmit);
  }
}

// Display filtered recipes
function displayRecipes() {
  const searchQuery = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const difficultyFilter = document.getElementById('difficultyFilter')?.value || '';
  const timeFilter = parseInt(document.getElementById('timeFilter')?.value) || Infinity;

  const filtered = recipes.filter(recipe => {
    const matchesSearch =
      !searchQuery ||
      recipe.title.toLowerCase().includes(searchQuery) ||
      recipe.description.toLowerCase().includes(searchQuery) ||
      recipe.ingredients?.some(i =>
        i.toLowerCase().includes(searchQuery)
      );

    const matchesDifficulty = !difficultyFilter || recipe.difficulty === difficultyFilter;
    const matchesTime = recipe.times <= timeFilter;
    const matchesCategory = !currentCategory || recipe.category === currentCategory;

    return matchesSearch && matchesDifficulty && matchesTime && matchesCategory;
  });

  const recipeGrid = document.getElementById('recipeGrid');
  if (!recipeGrid) return;

  if (filtered.length === 0) {
    recipeGrid.innerHTML =
      '<div class="no-recipes"><p>No recipes found. Try adjusting your filters!</p></div>';
    return;
  }

  recipeGrid.innerHTML = filtered.map(recipe => createRecipeCard(recipe)).join('');

  recipeGrid.querySelectorAll('.recipe-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (!e.target.classList.contains('btn-view')) {
        const recipeId = card.dataset.id;
        showRecipeDetail(recipeId);
      }
    });
  });
}

// Create recipe card
function createRecipeCard(recipe) {
  const imagePart = recipe.image && recipe.image.trim() !== ''
    ? `<img src="${recipe.image}" class="recipe-img" onerror="this.style.display='none'">`
    : '';

  return `
    <article class="recipe-card" data-id="${recipe.id}">
      ${imagePart}

      <div class="recipe-card-body">
        <h3 class="recipe-title">${escapeHtml(recipe.title)}</h3>
        <p class="recipe-desc">${escapeHtml(recipe.description || 'No description')}</p>
        
        <div class="recipe-meta">
          <span class="time-badge">⏱️ ${recipe.times || 0} min</span>
          <span class="difficulty-badge ${recipe.difficulty?.toLowerCase() || 'medium'}">
            ${recipe.difficulty || 'Medium'}
          </span>
        </div>

        <button class="btn-view"
                onclick="event.stopPropagation(); showRecipeDetail('${recipe.id}')">
          View Recipe
        </button>
      </div>
    </article>
  `;
}

// Show recipe detail modal
function showRecipeDetail(recipeId) {
  const recipe = recipes.find(r => r.id === recipeId);
  if (!recipe) return alert('Recipe not found!');

  const detailContent = document.getElementById('recipeDetailContent');
  const detailModal = document.getElementById('recipeDetailModal');

  const imagePart = recipe.image && recipe.image.trim() !== ''
    ? `<img src="${recipe.image}" class="detail-img" onerror="this.style.display='none'">`
    : '';

  detailContent.innerHTML = `
    <div class="detail-header">
      ${imagePart}

      <h2>${escapeHtml(recipe.title)}</h2>
      <p>${escapeHtml(recipe.description)}</p>

      <div class="detail-meta">
        <span class="time-badge">⏱️ ${recipe.times} minutes</span>
        <span class="difficulty-badge ${recipe.difficulty?.toLowerCase()}">
          ${recipe.difficulty}
        </span>
        <span class="category-badge">${recipe.category}</span>
      </div>
    </div>

    <div class="detail-section">
      <h3>🥗 Ingredients</h3>
      <ul>
        ${recipe.ingredients.map(i => `<li>${escapeHtml(i)}</li>`).join('')}
      </ul>
    </div>

    <div class="detail-section">
      <h3>👨‍🍳 Instructions</h3>
      <ol>
        ${recipe.steps.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
      </ol>
    </div>

    <div class="detail-actions">
      <button class="btn btn-edit" onclick="editRecipe('${recipe.id}')">✏️ Edit</button>
      <button class="btn btn-delete" onclick="deleteRecipe('${recipe.id}')">🗑️ Delete</button>
    </div>
  `;

  detailModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

// Edit recipe
function editRecipe(recipeId) {
  const recipe = recipes.find(r => r.id === recipeId);
  if (!recipe) return;

  editingRecipeId = recipeId;

  const detailModal = document.getElementById('recipeDetailModal');
  const addModal = document.getElementById('addRecipeModal');

  detailModal.style.display = 'none';

  document.getElementById('formTitle').textContent = 'Edit Recipe';
  document.getElementById('recipeTitle').value = recipe.title;
  document.getElementById('recipeDescription').value = recipe.description;
  document.getElementById('recipeCategory').value = recipe.category;
  document.getElementById('recipeIngredients').value = recipe.ingredients.join('\n');
  document.getElementById('recipeSteps').value = recipe.steps.join('\n');
  document.getElementById('recipeTimes').value = recipe.times;
  document.getElementById('recipeDifficulty').value = recipe.difficulty;

  document.getElementById('recipeImage').value = recipe.image || '';

  addModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

// Delete recipe
function deleteRecipe(recipeId) {
  if (!confirm('Are you sure you want to delete this recipe?')) return;

  recipes = recipes.filter(r => r.id !== recipeId);
  saveRecipes();

  const detailModal = document.getElementById('recipeDetailModal');
  detailModal.style.display = 'none';

  displayRecipes();
  alert('Recipe deleted successfully!');
}

// Add or update recipe
function handleFormSubmit(e) {
  e.preventDefault();

  const title = document.getElementById('recipeTitle').value.trim();
  const description = document.getElementById('recipeDescription').value.trim();
  const category = document.getElementById('recipeCategory').value;
  const ingredients = document.getElementById('recipeIngredients').value.trim();
  const steps = document.getElementById('recipeSteps').value.trim();
  const time = document.getElementById('recipeTimes').value;
  const difficulty = document.getElementById('recipeDifficulty').value;

  const imageInput = document.getElementById('recipeImage').value.trim();

  if (!title || !description || !category || !ingredients || !steps || !time || !difficulty) {
    alert('Please fill in all required fields');
    return;
  }

  if (editingRecipeId) {
    const index = recipes.findIndex(r => r.id === editingRecipeId);
    recipes[index] = {
      ...recipes[index],
      title,
      description,
      category,
      ingredients: ingredients.split('\n').filter(i => i.trim()),
      steps: steps.split('\n').filter(s => s.trim()),
      times: parseInt(time),
      difficulty,
      image: imageInput || '' // NO DEFAULT IMAGE
    };

    alert('Recipe updated successfully!');
    editingRecipeId = null;

  } else {
    const newRecipe = {
      id: Date.now().toString(),
      title,
      description,
      category,
      ingredients: ingredients.split('\n'),
      steps: steps.split('\n'),
      times: parseInt(time),
      difficulty,
      image: imageInput || ''   // NO DEFAULT IMAGE
    };

    recipes.unshift(newRecipe);
    alert('Recipe added successfully!');
  }

  saveRecipes();
  displayRecipes();

  const modal = document.getElementById('addRecipeModal');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';

  e.target.reset();
  document.getElementById('formTitle').textContent = 'Add New Recipe';
}

function showHome() {
  document.getElementById('homeView').style.display = 'block';
  document.getElementById('recipeDetail').style.display = 'none';
  document.getElementById('addRecipeForm').style.display = 'none';
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
