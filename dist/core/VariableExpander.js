export class VariableExpander {
    constructor(ruleManager, random) {
        this.ruleManager = ruleManager;
        this.random = random;
        this.variablePattern = /%([^%]+)%/g;
        this.referenceValues = new Map();
        this.currentContext = {};
        this.maxDepth = 100;
    }
    /**
     * Set maximum recursion depth
     */
    setMaxDepth(depth) {
        if (typeof depth !== 'number' || !Number.isFinite(depth) || depth < 1) {
            throw new Error('Max depth must be at least 1');
        }
        this.maxDepth = depth;
    }
    /**
     * Get maximum recursion depth
     */
    getMaxDepth() {
        return this.maxDepth;
    }
    /**
     * Clear context and reference values
     */
    clearContext() {
        this.currentContext = {};
        this.referenceValues.clear();
    }
    /**
     * Get current context
     */
    getContext() {
        return { ...this.currentContext };
    }
    /**
     * Clear reference values and context
     */
    clearReferences() {
        this.referenceValues.clear();
        this.currentContext = {};
    }
    /**
     * Expand variables in text with recursive processing
     * @param text - Text containing %variable% placeholders
     * @param preserveContext - Whether to maintain context from previous expansions
     * @returns Fully expanded text
     */
    expandVariables(text, preserveContext = false) {
        if (!preserveContext) {
            this.clearContext();
        }
        return this.expandVariablesRecursive(text, 0);
    }
    /**
     * Recursively expand variables with depth protection
     * @private
     */
    expandVariablesRecursive(text, depth) {
        if (depth >= this.maxDepth) {
            throw new Error(`Maximum recursion depth of ${this.maxDepth} exceeded. This may indicate circular references in your grammar rules.`);
        }
        // Reset the regex lastIndex to ensure proper matching
        this.variablePattern.lastIndex = 0;
        return text.replace(this.variablePattern, (match, key) => {
            // Handle reference variables (@variable syntax)
            if (key.startsWith('@')) {
                const refKey = key.substring(1);
                const refValue = this.referenceValues.get(refKey);
                if (refValue !== undefined) {
                    return refValue;
                }
                // If reference doesn't exist, fall through to generate new value
                key = refKey;
            }
            // Try to generate value from rule manager
            const value = this.ruleManager.generateValue(key, this.currentContext, this.random);
            if (value === null) {
                // Rule not found - return original placeholder
                return match;
            }
            // Store in context and references
            this.currentContext[key] = value;
            this.referenceValues.set(key, value);
            // Recursively expand the generated value
            return this.expandVariablesRecursive(value, depth + 1);
        });
    }
    /**
     * Find all variable names in text
     * @param text - Text to analyze
     * @returns Array of unique variable names
     */
    findVariables(text) {
        const variables = new Set();
        const regex = new RegExp(this.variablePattern.source, 'g');
        let match;
        while ((match = regex.exec(text)) !== null) {
            variables.add(match[1]);
        }
        return Array.from(variables);
    }
    /**
     * Validate that all variables in text have corresponding rules
     * @param text - Text to validate
     * @returns Array of missing variable names
     */
    findMissingVariables(text) {
        const variables = this.findVariables(text);
        const missing = [];
        for (const variable of variables) {
            // Skip reference variables
            if (variable.startsWith('@')) {
                continue;
            }
            if (!this.ruleManager.hasRule(variable)) {
                missing.push(variable);
            }
        }
        return missing;
    }
    /**
     * Check for circular references in grammar rules
     * @param startRule - Rule to start checking from
     * @param visited - Set of already visited rules
     * @returns Array of circular reference chains found
     */
    findCircularReferences(startRule, visited = new Set()) {
        const allKeys = this.ruleManager.getAllKeys();
        const graph = new Map();
        const reverseGraph = new Map();
        for (const key of allKeys) {
            reverseGraph.set(key, []);
        }
        for (const key of allKeys) {
            const dependencies = new Set();
            for (const value of this.ruleManager.getPossibleValues(key)) {
                for (const variable of this.findVariables(value)) {
                    if (!variable.startsWith('@') && this.ruleManager.hasRule(variable)) {
                        dependencies.add(variable);
                    }
                }
            }
            const edges = Array.from(dependencies);
            graph.set(key, edges);
            for (const dependency of edges) {
                reverseGraph.get(dependency)?.push(key);
            }
        }
        // Keep the legacy parameter for callers; SCC detection derives cycles from the graph.
        void visited;
        const roots = startRule ? [startRule] : allKeys;
        const reachable = new Set();
        const order = [];
        for (const root of roots) {
            if (reachable.has(root)) {
                continue;
            }
            reachable.add(root);
            const stack = [{ rule: root, nextDependency: 0 }];
            while (stack.length > 0) {
                const current = stack[stack.length - 1];
                const dependencies = graph.get(current.rule) ?? [];
                if (current.nextDependency < dependencies.length) {
                    const dependency = dependencies[current.nextDependency++];
                    if (!reachable.has(dependency)) {
                        reachable.add(dependency);
                        stack.push({ rule: dependency, nextDependency: 0 });
                    }
                }
                else {
                    order.push(current.rule);
                    stack.pop();
                }
            }
        }
        const assigned = new Set();
        const circular = [];
        for (let index = order.length - 1; index >= 0; index--) {
            const root = order[index];
            if (assigned.has(root)) {
                continue;
            }
            const component = [];
            const stack = [root];
            assigned.add(root);
            while (stack.length > 0) {
                const rule = stack.pop();
                component.push(rule);
                for (const dependency of reverseGraph.get(rule) ?? []) {
                    if (reachable.has(dependency) && !assigned.has(dependency)) {
                        assigned.add(dependency);
                        stack.push(dependency);
                    }
                }
            }
            if (component.length > 1 || (graph.get(root) ?? []).includes(root)) {
                circular.push(...component);
            }
        }
        return circular;
    }
}
//# sourceMappingURL=VariableExpander.js.map