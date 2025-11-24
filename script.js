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

// Load recipes from localStorage or default data
function initializeRecipes() {
  try {
    const stored = localStorage.getItem("recipes");

    if (stored) {
      recipes = JSON.parse(stored);
      return;
    }

    if (typeof recipesData !== "undefined" && Array.isArray(recipesData)) {
      recipes = JSON.parse(JSON.stringify(recipesData));
    } else {
      recipes = [];
    }

    localStorage.setItem("recipes", JSON.stringify(recipes));

  } catch (err) {
    console.error("Error loading recipes:", err);
    recipes = [];
  }
}

// Save recipes to localStorage
function saveRecipes() {
  try {
    localStorage.setItem('recipes', JSON.stringify(recipes));
  } catch (err) {
    console.error('Failed to save recipes:', err);
    alert('Failed to save recipes. Storage might be full.');
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
      categoryMenu.style.display = categoryMenu.style.display === 'block' ? 'none' : 'block';
    });

    const categoryItems = categoryMenu.querySelectorAll('.category-menu-item');
    categoryItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
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
  if (recipeForm) recipeForm.addEventListener('submit', handleFormSubmit);

  // OPTIONAL IMAGE PREVIEW
  const imageInput = document.getElementById("recipeImage");
  const imagePreview = document.getElementById("imagePreview");

  if (imageInput && imagePreview) {
    imageInput.addEventListener("input", () => {
      const url = imageInput.value.trim();

      if (url === "") {
        imagePreview.innerHTML = ""; // no image if empty
        return;
      }

      imagePreview.innerHTML =
        `<img src="${url}" style="max-width:150px;border-radius:6px;">`;
    });
  }
}

// Display filtered recipes
function displayRecipes() {
  const searchQuery = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const difficultyFilter = document.getElementById('difficultyFilter')?.value || '';
  const timeFilter = parseInt(document.getElementById('timeFilter')?.value) || Infinity;

  const filtered = recipes.filter(recipe => {
    const matchesSearch = !searchQuery || 
      recipe.title.toLowerCase().includes(searchQuery) ||
      recipe.description.toLowerCase().includes(searchQuery) ||
      (recipe.ingredients && recipe.ingredients.some(i => i.toLowerCase().includes(searchQuery)));
    
    const matchesDifficulty = !difficultyFilter || recipe.difficulty === difficultyFilter;
    const matchesTime = recipe.times <= timeFilter;
    const matchesCategory = !currentCategory || recipe.category === currentCategory;

    return matchesSearch && matchesDifficulty && matchesTime && matchesCategory;
  });

  const recipeGrid = document.getElementById('recipeGrid');
  if (!recipeGrid) return;

  if (filtered.length === 0) {
    recipeGrid.innerHTML = '<div class="no-recipes"><p>No recipes found. Try adjusting your filters!</p></div>';
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

// Create recipe card HTML
function createRecipeCard(recipe) {
  const difficultyClass = recipe.difficulty ? recipe.difficulty.toLowerCase() : 'medium';
  
  return `
    <article class="recipe-card" data-id="${recipe.id}">
      
      ${recipe.image ? 
        `<img src="${recipe.image}" alt="${escapeHtml(recipe.title)}" class="recipe-img">`
        : ""
      }

      <div class="recipe-card-body">
        <h3 class="recipe-title">${escapeHtml(recipe.title)}</h3>
        <p class="recipe-desc">${escapeHtml(recipe.description || 'No description available')}</p>
        <div class="recipe-meta">
          <span class="time-badge">⏱️ ${recipe.times || 0} min</span>
          <span class="difficulty-badge ${difficultyClass}">${recipe.difficulty || 'Medium'}</span>
        </div>
        <button class="btn-view" onclick="event.stopPropagation(); showRecipeDetail('${recipe.id}')">View Recipe</button>
      </div>
    </article>
  `;
}

// Show recipe detail
function showRecipeDetail(recipeId) {
  const recipe = recipes.find(r => r.id === recipeId);
  if (!recipe) {
    alert('Recipe not found!');
    return;
  }

  const difficultyClass = recipe.difficulty ? recipe.difficulty.toLowerCase() : 'medium';

  const detailContent = document.getElementById('recipeDetailContent');
  const detailModal = document.getElementById('recipeDetailModal');
  
  if (!detailContent || !detailModal) return;

  detailContent.innerHTML = `
    <div class="detail-header">

      ${recipe.image ? 
        `<img src="${recipe.image}" alt="${escapeHtml(recipe.title)}" class="detail-img">`
        : ""
      }

      <h2>${escapeHtml(recipe.title)}</h2>
      <p class="detail-desc">${escapeHtml(recipe.description || '')}</p>
      <div class="detail-meta">
        <span class="time-badge">⏱️ ${recipe.times || 0} minutes</span>
        <span class="difficulty-badge ${difficultyClass}">${recipe.difficulty || 'Medium'}</span>
        ${recipe.category ? `<span class="category-badge">${escapeHtml(recipe.category)}</span>` : ''}
      </div>
    </div>

    <div class="detail-section">
      <h3>🥗 Ingredients</h3>
      <ul>
        ${recipe.ingredients ? recipe.ingredients.map(ing => `<li>${escapeHtml(ing)}</li>`).join('') : '<li>No ingredients listed</li>'}
      </ul>
    </div>

    <div class="detail-section">
      <h3>👨‍🍳 Instructions</h3>
      <ol>
        ${recipe.steps ? recipe.steps.map(step => `<li>${escapeHtml(step)}</li>`).join('') : '<li>No instructions provided</li>'}
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
  const form = document.getElementById('recipeForm');
  if (!form) return;

  const detailModal = document.getElementById('recipeDetailModal');
  if (detailModal) detailModal.style.display = 'none';

  const addModal = document.getElementById('addRecipeModal');
  const formTitle = document.getElementById('formTitle');
  
  if (formTitle) formTitle.textContent = 'Edit Recipe';
  
  document.getElementById('recipeTitle').value = recipe.title || '';
  document.getElementById('recipeDescription').value = recipe.description || '';
  document.getElementById('recipeCategory').value = recipe.category || '';
  document.getElementById('recipeIngredients').value = recipe.ingredients ? recipe.ingredients.join('\n') : '';
  document.getElementById('recipeSteps').value = recipe.steps ? recipe.steps.join('\n') : '';
  document.getElementById('recipeTimes').value = recipe.times || '';
  document.getElementById('recipeDifficulty').value = recipe.difficulty || '';
  document.getElementById('recipeImage').value = recipe.image || '';

  if (addModal) {
    addModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

// Delete recipe
function deleteRecipe(recipeId) {
  if (!confirm('Are you sure you want to delete this recipe?')) return;

  recipes = recipes.filter(r => r.id !== recipeId);
  saveRecipes();
  
  const detailModal = document.getElementById('recipeDetailModal');
  if (detailModal) {
    detailModal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
  
  displayRecipes();
  alert('Recipe deleted successfully!');
}

// Handle form submission
function handleFormSubmit(e) {
  e.preventDefault();
  
  const title = document.getElementById('recipeTitle')?.value.trim();
  const description = document.getElementById('recipeDescription')?.value.trim();
  const category = document.getElementById('recipeCategory')?.value;
  const ingredients = document.getElementById('recipeIngredients')?.value.trim();
  const steps = document.getElementById('recipeSteps')?.value.trim();
  const time = document.getElementById('recipeTimes')?.value;
  const difficulty = document.getElementById('recipeDifficulty')?.value;
  const image = document.getElementById('recipeImage')?.value.trim();

  if (!title || !description || !category || !ingredients || !steps || !time || !difficulty) {
    alert('Please fill in all required fields');
    return;
  }

  if (editingRecipeId) {
    const index = recipes.findIndex(r => r.id === editingRecipeId);
    if (index !== -1) {
      recipes[index] = {
        ...recipes[index],
        title,
        description,
        category,
        ingredients: ingredients.split('\n').filter(i => i.trim()),
        steps: steps.split('\n').filter(s => s.trim()),
        times: parseInt(time),
        difficulty,
        image: image || ""
      };
      alert('Recipe updated successfully!');
    }
    editingRecipeId = null;
  } else {
    const newRecipe = {
      id: Date.now().toString(),
      title,
      description,
      category,
      ingredients: ingredients.split('\n').filter(i => i.trim()),
      steps: steps.split('\n').filter(s => s.trim()),
      times: parseInt(time),
      difficulty,
      image: image || ""
    };
    recipes.unshift(newRecipe);
    alert('Recipe added successfully!');
  }

  saveRecipes();
  displayRecipes();

  const modal = document.getElementById('addRecipeModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
  
  e.target.reset();
  document.getElementById('formTitle').textContent = 'Add New Recipe';
}

// Show home
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
