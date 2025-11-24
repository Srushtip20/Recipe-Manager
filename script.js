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
    const stored = localStorage.getItem('recipes');
    if (stored) {
      recipes = JSON.parse(stored);
    } else if (typeof recipesData !== 'undefined' && Array.isArray(recipesData)) {
      recipes = JSON.parse(JSON.stringify(recipesData));
      saveRecipes();
    } else {
      recipes = [];
    }
  } catch (err) {
    console.error('Failed to initialize recipes:', err);
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
  // Search
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', displayRecipes);
  }

  // Filters
  const difficultyFilter = document.getElementById('difficultyFilter');
  const timeFilter = document.getElementById('timeFilter');
  if (difficultyFilter) difficultyFilter.addEventListener('change', displayRecipes);
  if (timeFilter) timeFilter.addEventListener('input', displayRecipes);

  // Category dropdown
  const categoryBtn = document.getElementById('categoryDropdownBtn');
  const categoryMenu = document.getElementById('categoryDropdownMenu');
  
  if (categoryBtn && categoryMenu) {
    categoryBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      categoryMenu.style.display = categoryMenu.style.display === 'block' ? 'none' : 'block';
    });

    // Category menu items
    const categoryItems = categoryMenu.querySelectorAll('.category-menu-item');
    categoryItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const category = item.dataset.dish || '';
        currentCategory = category;
        categoryMenu.style.display = 'none';
        displayRecipes();
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
      categoryMenu.style.display = 'none';
    });
  }

  // Clear filters
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

  // Add recipe button
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

  // Close modal buttons
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

  // Close modal when clicking outside
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

  // Close detail modal buttons
  const closeDetailModal = document.getElementById('closeDetailModal');
  const detailModal = document.getElementById('recipeDetailModal');
  
  if (closeDetailModal && detailModal) {
    closeDetailModal.addEventListener('click', () => {
      detailModal.style.display = 'none';
      document.body.style.overflow = 'auto';
    });

    // Close detail modal when clicking outside
    detailModal.addEventListener('click', (e) => {
      if (e.target === detailModal) {
        detailModal.style.display = 'none';
        document.body.style.overflow = 'auto';
      }
    });
  }

  // Back buttons
  const backFromDetail = document.getElementById('backToHomeFromDetail');
  const backFromForm = document.getElementById('backToHomeFromForm');
  if (backFromDetail) backFromDetail.addEventListener('click', showHome);
  if (backFromForm) backFromForm.addEventListener('click', showHome);

  // Form submission
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

  // Add click listeners to cards
  recipeGrid.querySelectorAll('.recipe-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't trigger card click if clicking the View button
      if (!e.target.classList.contains('btn-view')) {
        const recipeId = card.dataset.id;
        showRecipeDetail(recipeId);
      }
    });
  });
}

// Create recipe card HTML
function createRecipeCard(recipe) {
  const defaultImage = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600';
  const difficultyClass = recipe.difficulty ? recipe.difficulty.toLowerCase() : 'medium';
  
  return `
    <article class="recipe-card" data-id="${recipe.id}">
      <img src="${recipe.image || defaultImage}" alt="${escapeHtml(recipe.title)}" class="recipe-img" onerror="this.src='${defaultImage}'">
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

  const defaultImage = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600';
  const difficultyClass = recipe.difficulty ? recipe.difficulty.toLowerCase() : 'medium';

  const detailContent = document.getElementById('recipeDetailContent');
  const detailModal = document.getElementById('recipeDetailModal');
  
  if (!detailContent || !detailModal) return;

  detailContent.innerHTML = `
    <div class="detail-header">
      <img src="${recipe.image || defaultImage}" alt="${escapeHtml(recipe.title)}" class="detail-img" onerror="this.src='${defaultImage}'">
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

// Show add recipe form
function showAddRecipeForm() {
  editingRecipeId = null;
  const form = document.getElementById('recipeForm');
  if (form) {
    form.reset();
    form.querySelector('h2').textContent = 'Add New Recipe';
  }

  document.getElementById('homeView').style.display = 'none';
  document.getElementById('recipeDetail').style.display = 'none';
  document.getElementById('addRecipeForm').style.display = 'block';
}

// Edit recipe
function editRecipe(recipeId) {
  const recipe = recipes.find(r => r.id === recipeId);
  if (!recipe) return;

  editingRecipeId = recipeId;
  const form = document.getElementById('recipeForm');
  if (!form) return;

  // Close detail modal
  const detailModal = document.getElementById('recipeDetailModal');
  if (detailModal) {
    detailModal.style.display = 'none';
  }

  // Open add recipe modal with existing data
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
  
  // Close the detail modal
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
    // Update existing recipe
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
        image: image || recipes[index].image
      };
      alert('Recipe updated successfully!');
    }
    editingRecipeId = null;
  } else {
    // Create new recipe
    const newRecipe = {
      id: Date.now().toString(),
      title,
      description,
      category,
      ingredients: ingredients.split('\n').filter(i => i.trim()),
      steps: steps.split('\n').filter(s => s.trim()),
      times: parseInt(time),
      difficulty,
      image: image || 'https://via.placeholder.com/400x300?text=No+Image'
    };
    recipes.unshift(newRecipe);
    alert('Recipe added successfully!');
  }

  saveRecipes();
  displayRecipes();
  
  // Close modal
  const modal = document.getElementById('addRecipeModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
  
  // Reset form
  e.target.reset();
  document.getElementById('formTitle').textContent = 'Add New Recipe';
}

// Show home view
function showHome() {
  document.getElementById('homeView').style.display = 'block';
  document.getElementById('recipeDetail').style.display = 'none';
  document.getElementById('addRecipeForm').style.display = 'none';
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}