module.exports = {
    root: true,
    env: {
      es6: true,
      node: true,
      browser: true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
    },
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:vue/vue3-recommended',
      'plugin:prettier/recommended',
      'prettier',
    ],
    plugins: ['vue', '@typescript-eslint', 'prettier'],
    rules: {
      // 你的自定义规则
    },
  };