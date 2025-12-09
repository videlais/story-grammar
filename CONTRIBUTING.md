# Contributing to Story Grammar

Thank you for your interest in contributing to Story Grammar! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm (comes with Node.js)
- Git

### Setting Up Your Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/story-grammar.git
   cd story-grammar
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/videlais/story-grammar.git
   ```
4. Install dependencies:
   ```bash
   npm install
   ```

## Development Workflow

### Building the Project

```bash
npm run build        # Compile TypeScript
npm run build:all    # Compile TypeScript and Webpack bundle
```

### Running Tests

```bash
npm test            # Run tests with coverage
npm run test:watch  # Run tests in watch mode
```

### Linting

```bash
npm run lint        # Check for linting issues
npm run lint:fix    # Automatically fix linting issues
```

### Running Everything

```bash
npm run all         # Lint, test, and build everything
```

## Making Changes

1. **Create a new branch** for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
   Or for bug fixes:
   ```bash
   git checkout -b fix/issue-description
   ```

2. **Make your changes** following the code style guidelines below

3. **Write or update tests** to cover your changes

4. **Run the test suite** to ensure everything passes:
   ```bash
   npm run all
   ```

5. **Commit your changes** with a clear, descriptive commit message:
   ```bash
   git commit -m "Add feature: description of what you added"
   ```

## Code Style Guidelines

- **TypeScript**: Use TypeScript for all code
- **Strict mode**: Enable TypeScript strict mode compliance
- **ESLint**: Follow the project's ESLint configuration
- **Naming conventions**:
  - Use `PascalCase` for classes and types
  - Use `camelCase` for functions and variables
  - Use `UPPER_CASE` for constants
- **Documentation**: Add JSDoc comments for public APIs
- **Modular design**: Follow the existing modular architecture pattern

## Testing Guidelines

- Write unit tests for all new functionality
- Maintain or improve code coverage
- Use descriptive test names that explain what is being tested
- Follow the existing test structure and patterns
- Test edge cases and error conditions

## Submitting Changes

1. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** on GitHub with:
   - A clear title describing the change
   - A detailed description of what changed and why
   - Reference to any related issues (e.g., "Fixes #123")
   - Screenshots or examples if applicable

3. **Respond to feedback** from code reviews promptly

4. **Ensure CI passes** - all tests and checks must pass before merging

## Reporting Issues

When reporting issues, please include:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Your environment (Node.js version, OS, etc.)
- Any relevant code samples or error messages

## Feature Requests

We welcome feature requests! Please:

- Check if the feature has already been requested
- Provide a clear use case for the feature
- Explain how it fits with the project's goals
- Consider submitting a PR if you can implement it

## Project Structure

```
story-grammar/
├── src/                    # Source code
│   ├── modifiers/         # Modifier functions
│   │   └── english/       # English language modifiers
│   ├── Parser.ts          # Main parser class
│   ├── ParserCore.ts      # Core parser logic
│   └── types.ts           # TypeScript type definitions
├── test/                  # Test files
├── docs/                  # Documentation and examples
├── dist/                  # Compiled JavaScript (generated)
└── types/                 # Type definitions (generated)
```

## License

By contributing to Story Grammar, you agree that your contributions will be licensed under the MIT License.

## Questions?

If you have questions about contributing, feel free to:
- Open an issue with your question
- Start a discussion in the GitHub Discussions tab

Thank you for contributing to Story Grammar! 🎉
