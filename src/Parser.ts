/**
 * Parser for combinatorial grammar with variable expansion
 * 
 * This file re-exports the core Parser class and all types for backward compatibility.
 * The actual implementation has been moved to separate files for better modularity.
 */

// Re-export all types and interfaces
export * from './types';

// Re-export the core Parser class
export { Parser } from './ParserCore';