/**
 * Custom ESLint plugin for Parlay Golf Ventures
 * 
 * This plugin contains custom rules specific to the Parlay Golf Ventures platform.
 */

import noMockDataImport from './no-mock-data-import.js';

export default {
  rules: {
    'no-mock-data-import': noMockDataImport,
  },
};
