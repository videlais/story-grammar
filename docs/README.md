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
// Kingdom characteristics
parser.addRule('kingdom_names', ['Valdoria', 'Aethermoor', 'Drakmonia']);
parser.addRule('ruler_titles', ['King', 'Queen', 'Emperor']);

// Story templates  
parser.addRule('kingdom_intro', [
    'In the %kingdom_traits% kingdom of %kingdom_names%, %ruler_titles% %ruler_names% ruled for %reign_years% years.'
]);
```
