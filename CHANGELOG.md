# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.8] - 20 November 2026

### Added

- `RuleManager.getPossibleValues()` for retrieving all known output values of a rule.
- `SeededRandom.withPreservedState()` for running operations without disturbing generator state.

### Changed

- Refactored `VariableExpander` and `RuleManager` interfaces; circular-reference checking moved out of `VariableExpander` into graph-based validation.
- Updated dependencies (`jest`, `ts-jest`, `eslint`, `@typescript-eslint`, `webpack`, `js-yaml`, `brace-expansion`).

### Fixed

- Parser state is now preserved across validation and parsing operations (#106).
- Numeric rules are validated for proper bounds, preventing range overflows (#106, #107).
- Circular-reference validation is now graph-based and template-aware, reporting complete cycles and constraining scoped cycle analysis (#107).
- `safeParse` failures are preserved when diagnostics throw (#107).
- Template analysis and weighted-rule fallback are now bounded (#107).

### Security

- Resolved 18 moderate `npm audit` advisories in transitive dev dependencies (`glob` GHSA-3g3m-2fjr-6pw4, `minimatch` GHSA-g3hv-75wg-m249) by adding overrides for `glob@^14.0.2` and `minimatch@^11.0.1`, avoiding the suggested Jest downgrade.

## [1.2.7] - 25 August 2026

### Added

- Dependabot auto-merge workflow with a CI job that checks the full test matrix result before merging.

### Changed

- Raised minimum Node.js version to 20.19.0 to align with lint tooling.
- Updated dependencies (`eslint`, `@typescript-eslint`, `ts-jest`, `webpack`, `webpack-cli`) and CI actions (`actions/checkout`, `actions/setup-node`, `codecov-action`, `codeql-action`, `dependabot/fetch-metadata`).

### Security

- Updated `brace-expansion` (pinned via overrides) and related dependencies to resolve reported security issues.

## [1.2.6] - 28 June 2026

### Changed

- Updated development dependencies (`@typescript-eslint`, `eslint`, `ts-jest`, `ts-loader`, `webpack`, `webpack-cli`).
- Published the "A History of Combinatorial Grammars" documentation series pages and docs index updates to the documentation site.

## [1.2.5] - 28 June 2026

### Added

- Documentation example links for the compatibility test page.
- New "A History of Combinatorial Grammars" docs series (1850–2026) with era pages and academic references.

### Changed

- Updated dependencies (`@typescript-eslint`, `eslint`, `ts-loader`, `webpack`, `webpack-cli`).

### Fixed

- Resolved clean-URL routing for docs history pages via folder-based structure.

### Security

- Resolved all reported `npm audit` vulnerabilities, including pinning `js-yaml` via overrides.

## [1.2.4] - 27 March 2026

### Changed

- Large push to update documentation across files and common classes.
- Updated dependencies.

## [1.2.3] - 1 Feb 2026

### Changed

- Updated dependencies.

### Added

- Added a CDN example (docs/cdn-example.html).

## [1.2.2] - 9 Dec 2025

### Added

- CHANGELOG.md.
- CONTRIBUTING.md.
- SECURITY.md
- Issue and pull requests templates.

## [1.2.1] - 1 Nov 2025

### Changed

- Refactored EnglishModifiers to re-export from modular implementations
- Reduced code duplication in modifier implementations
- Modular English modifier architecture
- Individual modifier exports for better tree-shaking
- Comprehensive modifier functions alongside modular ones

### Fixed

- Improved code maintainability through modular architecture

### Changed

- Split English modifiers into separate modules under `src/modifiers/english/`
- Updated exports to support both comprehensive and modular usage

## [1.0.1] - 5 Oct 2025

### Added

- Core Parser functionality
- English modifiers
- TypeScript type definitions
- Comprehensive documentation
- Jest test suite
- Webpack bundling
- GitHub Pages documentation site

## Release Categories

### Added

For new features.

### Changed

For changes in existing functionality.

### Deprecated

For soon-to-be removed features.

### Removed

For now removed features.

### Fixed

For any bug fixes.

### Security

In case of vulnerabilities.
