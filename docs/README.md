# Story Grammar Examples

This folder contains interactive examples demonstrating the Story Grammar library in action.

## 🏰 Fantasy Kingdom Generator

**File:** `fantasy-kingdom-example.html`

An interactive web example that generates 12 generations of fantasy kingdoms, each ending in dramatic fashion. This example demonstrates:

### Features Showcased

- **CDN Integration**: Loads Story Grammar via CDN for web use
- **Complex Grammar Rules**: Multi-layered storytelling with interconnected variables
- **English Modifiers**: Uses all built-in English language modifiers
- **Interactive UI**: Generate individual or batch stories
- **Statistical Tracking**: Counts different ending types

### Story Elements

Each generated kingdom includes:

- **Kingdom Details**: Names, rulers, characteristics, and features
- **Reign Events**: What the ruler accomplished during their time
- **Dramatic Endings**: Three possible fates:
  - 🗡️ **Murder**: Assassination, poisoning, betrayal
  - ⚔️ **Invasion**: Conquest by external forces
  - 🏃 **Flight**: Ruler forced to flee due to disasters

### Technical Implementation

- **Grammar Rules**: 15+ interconnected rule sets
- **Modifiers Applied**: Article correction, pluralization, ordinals
- **Random Generation**: Each story is unique
- **Responsive Design**: Works on desktop and mobile
- **Statistics**: Real-time tracking of ending distributions

### Usage

1. Open `fantasy-kingdom-example.html` in a web browser
2. Click "Generate 12 Kingdoms" for a full batch
3. Click "Generate One Kingdom" for individual stories
4. View statistics showing the distribution of fates

### CDN Integration

The example loads Story Grammar from CDN:

```html
<script src="https://cdn.jsdelivr.net/gh/videlais/story-grammar@main/dist/story-grammar.bundle.js"></script>
```

*Note: Replace the CDN URL with your actual published location when deploying.*

### Grammar Structure Example

```javascript
### Grammar Structure Example\n\n```javascript\n// Kingdom characteristics\nparser.addRule('kingdom_names', ['Valdoria', 'Aethermoor', 'Drakmonia']);\nparser.addRule('ruler_titles', ['King', 'Queen', 'Emperor']);\n\n// Range rules for dynamic values\nparser.addRangeRule('reign_years', { min: 5, max: 50, type: 'integer' });\n\n// Story templates with references\nparser.addRule('kingdom_intro', [\n    'In the %kingdom_traits% kingdom of %kingdom_names%, %ruler_titles% %ruler_names% ruled for %reign_years% years.'\n]);\nparser.addRule('kingdom_continuation', [\n    'Later, %@ruler_titles% %@ruler_names% faced great challenges in %@kingdom_names%.'\n]);\n```
```

### Educational Value

This example demonstrates:

- Complex narrative generation
- Conditional story branching  
- Statistical story analysis
- Web integration patterns
- Interactive storytelling interfaces

Perfect for showcasing the library's capabilities in:\n\n- **Game Development**: Procedural storytelling\n- **Creative Writing**: Inspiration generation\n- **Educational Tools**: Interactive narratives\n- **Web Applications**: Dynamic content creation\n\n### 🔄 Recent Updates\n\n**API Changes** (Updated in all examples):\n- `addRangeRule()` now uses object syntax: `addRangeRule('name', { min: 1, max: 10, type: 'integer' })`\n- Reference system uses `%@variable%` syntax directly (no `addReferenceRule()` method needed)\n- All examples updated to use current API\n- Enhanced documentation with comprehensive JSDoc comments

## 🐉 D&D Encounter Generator

**File:** `dnd-encounter-generator.html`

A dynamic D&D encounter generator that fetches real monster data and creates procedural encounters using Story Grammar. This example showcases:

### D&D Features Showcased

- **External API Integration**: Fetches monster data from GitHub JSON API
- **Data Processing**: Filters and categorizes 1000+ D&D monsters by challenge rating
- **Advanced Grammar Rules**: Multi-layered encounter generation with contextual details
- **Real-time Statistics**: Tracks monster usage, encounter difficulty, and trends
- **Responsive Design**: Professional UI optimized for both desktop and mobile

### Encounter Elements

Each generated encounter includes:

- **Dynamic Locations**: 16 different atmospheric settings
- **Monster Selection**: Weighted selection across 4 difficulty tiers
- **Contextual Motivations**: Why monsters are encountered in specific situations
- **Environmental Complications**: 10 different encounter modifiers
- **Potential Rewards**: 12 types of treasure and magical items

### D&D Technical Implementation

- **Monster Database**: 1000+ monsters from official D&D sources
- **Smart Filtering**: Categorizes by Challenge Rating (Easy: 0-2, Medium: 3-6, Hard: 7-12, Deadly: 13+)
- **Grammar Complexity**: 7 interconnected rule sets with weighted probability
- **Statistics Engine**: Real-time tracking of encounters, monsters, and difficulty trends
- **Error Handling**: Graceful degradation if monster data unavailable

### D&D Usage

1. Open `dnd-encounter-generator.html` in a web browser
2. Click "Generate One Encounter" for a single encounter
3. Click "Generate 5 Encounters" for a batch of encounters  
4. View real-time statistics and monster usage tracking
5. Use "Clear All" to reset and start fresh

### Data Integration

The example demonstrates external data integration:

```javascript
// Fetch monster data from GitHub API
const response = await fetch('https://raw.githubusercontent.com/nick-aschenbach/dnd-data/refs/heads/main/data/monsters.json');
const monsters = await response.json();

// Process and categorize monsters by Challenge Rating
const easyMonsters = monsters.filter(m => getChallengeRatingValue(m.properties?.['Challenge Rating']) <= 2);
const mediumMonsters = monsters.filter(m => {
    const cr = getChallengeRatingValue(m.properties?.['Challenge Rating']);
    return cr >= 3 && cr <= 6;
});
```

### Advanced Grammar Example

```javascript
// Weighted monster selection favoring easier encounters
parser.addRule('selected_monster', [
    '%easy_monsters%', '%easy_monsters%', '%easy_monsters%', // 3/7 chance
    '%medium_monsters%', '%medium_monsters%',               // 2/7 chance  
    '%hard_monsters%',                                      // 1/7 chance
    '%deadly_monsters%'                                     // 1/7 chance
]);

// Complex encounter template with multiple variables
parser.addRule('encounter', [
    'In %locations%, the adventurers encounter a %selected_monster% %motivations%. %complications%. Victory might yield %rewards%.'
]);
```

### D&D Educational Value

This example demonstrates:

- **API Integration**: Fetching and processing external JSON data
- **Data-driven Generation**: Using real-world datasets for procedural content
- **Complex Grammar Logic**: Multi-variable templates with contextual relationships
- **Statistical Analysis**: Real-time data tracking and visualization
- **Professional UI/UX**: Game-quality interface design patterns

Perfect for showcasing:

- **Game Development**: Procedural encounter systems
- **RPG Tools**: Dynamic content generation for tabletop games
- **Data Integration**: Combining external APIs with grammar systems  
- **Educational Software**: Interactive learning tools for game masters

## Running the Examples

### Local Development

1. Build the project: `npm run build:all`
2. Serve the docs folder with any static server
3. Open the HTML files in your browser

### Using with CDN

The examples are designed to work with the published CDN version of Story Grammar, making them suitable for:

- Online demonstrations
- Educational resources
- Integration examples
- Quick prototyping

## Adding New Examples

When adding new examples to this folder:

1. Create descriptive HTML files with inline documentation
2. Include comprehensive grammar rules showcasing different features  
3. Add interactive elements for better demonstration
4. Update this README with example descriptions
5. Ensure examples work with both local builds and CDN versions
