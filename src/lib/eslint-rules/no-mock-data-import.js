/**
 * ESLint rule to disallow importing mock data unless USE_MOCK_DATA is true
 * 
 * This rule checks imports for mock data patterns and ensures they are only
 * imported when the USE_MOCK_DATA configuration is set to true.
 */

// Rule definition
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow importing mock data unless USE_MOCK_DATA is true',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [], // no options
    messages: {
      noMockDataImport: 'Mock data should only be imported when USE_MOCK_DATA is true. Check DEV_CONFIG in src/lib/config/env.ts',
    },
  },

  create(context) {
    // Helper function to check if a string contains mock data patterns
    const containsMockDataPattern = (str) => {
      const mockPatterns = [
        /mock/i,
        /fake/i,
        /dummy/i,
        /test[-_]?data/i,
        /sample[-_]?data/i,
      ];
      return mockPatterns.some(pattern => pattern.test(str));
    };

    return {
      ImportDeclaration(node) {
        const importSource = node.source.value;
        
        // Skip checking node_modules imports
        if (importSource.startsWith('@') || !importSource.includes('/')) {
          return;
        }

        // Check if this is a mock data import
        if (containsMockDataPattern(importSource)) {
          // Check if there's a conditional import with USE_MOCK_DATA
          let hasConditionalCheck = false;
          
          // Get the parent function or block
          let parent = node.parent;
          while (parent && parent.type !== 'Program') {
            // Check if we're inside an if statement that checks USE_MOCK_DATA
            if (parent.type === 'IfStatement') {
              const condition = context.getSourceCode().getText(parent.test);
              if (condition.includes('USE_MOCK_DATA') || 
                  condition.includes('shouldUseMockData') || 
                  condition.includes('DEV_CONFIG.DATABASE')) {
                hasConditionalCheck = true;
                break;
              }
            }
            parent = parent.parent;
          }

          // If no conditional check is found, report the error
          if (!hasConditionalCheck) {
            context.report({
              node,
              messageId: 'noMockDataImport',
            });
          }
        }
      },
    };
  },
};
