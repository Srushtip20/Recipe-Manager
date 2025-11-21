# Recipe Manager Web Application

A full-stack Recipe Manager web application built with HTML, CSS, and JavaScript. This application allows users to manage their favorite recipes with full CRUD (Create, Read, Update, Delete) functionality, search capabilities, and filtering options. All data is stored locally using browser localStorage.

## 🚀 How to Run the Application

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- No server or backend required - runs entirely in the browser

### Running the App
1. Navigate to the project folder: `c:\Users\Ankita\Desktop\Recipe`
2. Open `index.html` in your web browser by:
   - Double-clicking the file, OR
   - Right-clicking and selecting "Open with" → Your preferred browser, OR
   - Dragging the file into an open browser window

3. The application will automatically load with sample recipes including Biryani (the candidate's favorite dish) as the first recipe.

## 📋 Features

### 1. Views/Pages
- **Home (Recipe List)**: Grid layout displaying all recipes as cards with search and filter controls
- **Recipe Detail**: Full recipe view with ingredients, steps, prep time, difficulty, and action buttons
- **Add/Edit Recipe Form**: Form for creating new recipes or editing existing ones with validation

### 2. Data Management
- **Initial Load**: Automatically inserts 5 sample recipes including the candidate's favorite (Biryani)
- **localStorage Structure**: Recipes stored under the key "recipes" as a JSON array
- **Persistent Storage**: All changes are saved to localStorage and persist across browser sessions

### 3. CRUD Operations
- **Create**: Add new recipes through the form with full validation
- **Read**: View all recipes on the home page or individual recipe details
- **Update**: Edit existing recipes while preserving the recipe ID
- **Delete**: Remove recipes with confirmation prompt to prevent accidental deletion

### 4. Search & Filter
- **Search**: Real-time search by recipe title (case-insensitive)
- **Difficulty Filter**: Filter by Easy, Medium, Hard, or show All
- **Time Filter**: Optional filter to show only recipes with prep time ≤ specified minutes
- **Clear Filters**: Reset all filters with one click

### 5. Responsive Design
- Fully responsive layout that works on desktop, tablet, and mobile devices
- Grid layout automatically adjusts columns based on screen size
- Mobile-optimized navigation and forms
- No CSS frameworks used - pure custom CSS

### 6. Error Handling & Validation
- Client-side form validation for all required fields
- Clear error messages displayed below each invalid field
- URL validation for optional image field
- Graceful handling of corrupted localStorage data
- Default placeholder images for missing recipe images
- Confirmation dialogs for destructive actions (delete)

## 📦 Data Structure in localStorage

### Storage Key
```
"recipes"
```

### Data Format
```javascript
[
  {
    "id": "1700000000000abc123",           // Unique identifier (timestamp + random string)
    "title": "Biryani",                    // Recipe name
    "description": "A flavorful and...",   // Brief description
    "ingredients": [                        // Array of ingredient strings
      "2 cups basmati rice",
      "500g chicken or mutton",
      "..."
    ],
    "steps": [                              // Array of instruction steps
      "Marinate the meat...",
      "Cook basmati rice...",
      "..."
    ],
    "times": 90,                            // Prep time in minutes (integer)
    "difficulty": "Hard",                   // One of: "Easy", "Medium", "Hard"
    "image": "https://example.com/..."      // Optional image URL (string, can be empty)
  }
]
```

## 🏗️ Technical Implementation

### File Structure
```
Recipe/
├── index.html      # Main HTML structure with all views
├── styles.css      # Complete styling with responsive design
└── script.js       # All JavaScript logic for CRUD, search, and UI
```

### Key Technologies
- **HTML5**: Semantic markup, form validation attributes
- **CSS3**: Flexbox, Grid, animations, media queries
- **JavaScript (ES6+)**: localStorage API, DOM manipulation, event handling
- **No frameworks**: Pure vanilla JavaScript, HTML, and CSS

### Modular JavaScript Structure
- `initializeApp()`: Application initialization
- `initializeRecipes()`: Loads sample recipes on first run
- `displayRecipes()`: Renders filtered recipe cards
- `showRecipeDetail()`: Displays full recipe information
- `handleFormSubmit()`: Processes form data with validation
- `editRecipe()` / `deleteRecipe()`: CRUD operations
- `getRecipes()` / `saveRecipes()`: localStorage interface

## 🔒 Assumptions and Limitations

### Assumptions
1. **Browser Support**: Assumes modern browser with localStorage support (2015+)
2. **Single User**: Designed for single-user local use (no multi-user or authentication)
3. **Data Size**: Assumes reasonable number of recipes (< 1000) due to localStorage limits
4. **Image Hosting**: Expects image URLs to be externally hosted (no local image upload)
5. **Input Format**: Ingredients and steps entered one per line in textarea
6. **Language**: Application is in English only

### Limitations
1. **No Backend**: All data stored locally; clearing browser data will delete recipes
2. **No Export/Import**: No built-in way to backup or transfer recipes to another device
3. **No Image Upload**: Only supports URLs for recipe images, not local file upload
4. **No User Accounts**: Single user application with no authentication
5. **localStorage Size**: Browser localStorage typically limited to 5-10MB
6. **No Rich Text**: Recipe descriptions use plain text only
7. **No Categories/Tags**: Recipes not organized by cuisine type, meal type, etc.
8. **No Rating System**: No ability to rate or favorite recipes
9. **No Printing**: No print-friendly view for recipes

## 🐛 Known Issues

1. **Image Loading**: External images may fail to load if URL is broken or blocked by CORS
   - Mitigation: Default placeholder image displays on error

2. **localStorage Quota**: Storing many large recipes may exceed browser storage limits
   - Mitigation: Try/catch blocks prevent app crashes; error messages displayed

3. **Data Loss Risk**: Clearing browser data or using incognito mode will lose all recipes
   - Mitigation: Users should manually backup important recipes (copy/paste)

4. **No Undo**: Deleting a recipe is permanent with no recovery option
   - Mitigation: Confirmation dialog before deletion

5. **Line Break Parsing**: Empty lines in ingredients/steps textarea are filtered out
   - Mitigation: Instructions indicate "one per line" format

6. **Browser Compatibility**: Older browsers (IE11) not fully supported
   - Mitigation: Modern browser required (noted in prerequisites)

## 🎨 Features Highlights

### User Experience
- ✅ Smooth animations and transitions
- ✅ Intuitive navigation between views
- ✅ Real-time search and filtering
- ✅ Visual feedback for all actions
- ✅ Responsive grid layout
- ✅ Color-coded difficulty badges
- ✅ Clear error messages
- ✅ Confirmation for destructive actions

### Code Quality
- ✅ Clean, organized folder structure
- ✅ Separate HTML, CSS, and JS files
- ✅ Modular JavaScript functions
- ✅ Comprehensive error handling
- ✅ Input sanitization (XSS prevention)
- ✅ Consistent naming conventions
- ✅ Comments for complex logic

## 📱 Responsive Breakpoints

- **Desktop**: > 768px (Multi-column grid)
- **Tablet**: 481px - 768px (Adjusted layout)
- **Mobile**: ≤ 480px (Single column, stacked elements)

## 🎯 Assessment Requirements Met

✅ Recipe Manager Web App with candidate's recipe as first record  
✅ All persistence using browser localStorage only  
✅ Home page with grid layout, recipe cards, search, and difficulty filter  
✅ Recipe Detail view with full information and edit/delete options  
✅ Add/Edit Recipe Form with client-side validation  
✅ Initial load inserts candidate's recipe + 3-5 sample recipes  
✅ Consistent JSON structure stored under "recipes" key  
✅ Full CRUD operations (Create, Read, Update, Delete)  
✅ Search by title functionality  
✅ Filter by difficulty (All/Easy/Medium/Hard)  
✅ Optional filter by max prep time  
✅ Responsive design for desktop and mobile  
✅ No CSS frameworks (custom CSS only)  
✅ Error handling and validation  
✅ Clear error messages  
✅ Graceful localStorage handling  
✅ Clean folder structure  
✅ Separate HTML/CSS/JS files  
✅ Modular JavaScript  
✅ No frontend frameworks  
✅ README with all required documentation  

---

**Developed as a Full-Stack Engineer Assessment Project**  
**Duration**: Designed to be completed within 10 hours  
**Technologies**: HTML5, CSS3, Vanilla JavaScript, localStorage API
