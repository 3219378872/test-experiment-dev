import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import boundaries from 'eslint-plugin-boundaries';
import eslintReact from '@eslint-react/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

const srcFiles = [
  'app/**/*.{ts,tsx}',
  'pages/**/*.{ts,tsx}',
  'features/**/*.{ts,tsx}',
  'shared/**/*.{ts,tsx}',
];

export default tseslint.config(
  { ignores: ['prototype/**', 'node_modules/**', 'dist/**', 'coverage/**', 'playwright-report/**', 'test-results/**'] },
  js.configs.recommended,
  // 类型感知检查：no-floating-promises / no-misused-promises / await-thenable 等
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  // js/mjs 不在 tsconfig 范围内，关闭类型感知规则（含本配置文件自身）
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    ...tseslint.configs.disableTypeChecked,
  },
  // React 常见错误（缺 key、重复 props、不稳定嵌套组件定义等）
  {
    files: srcFiles,
    ...eslintReact.configs['recommended-type-checked'],
  },
  // Hooks 规则：调用位置 + 依赖数组（官方实现，关闭 @eslint-react 的重复移植版）
  {
    files: srcFiles,
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@eslint-react/rules-of-hooks': 'off',
      '@eslint-react/exhaustive-deps': 'off',
    },
  },
  {
    files: srcFiles,
    languageOptions: { globals: globals.browser },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': 'warn',
    },
  },
  {
    files: [
      'app/**/*.{ts,tsx,js,jsx}',
      'pages/**/*.{ts,tsx,js,jsx}',
      'features/**/*.{ts,tsx,js,jsx}',
      'shared/**/*.{ts,tsx,js,jsx}',
    ],
    plugins: { boundaries },
    settings: {
      'import/resolver': { typescript: {} },
      'boundaries/elements': [
        { type: 'app', pattern: 'app' },
        { type: 'pages', pattern: 'pages/*', capture: ['page'] },
        { type: 'features', pattern: 'features/*', capture: ['feature'] },
        { type: 'shared', pattern: 'shared' },
      ],
    },
    rules: {
      // 依赖方向 app → pages → features → shared，跨 feature / 跨 page 引用被 default: 'disallow' 拦截
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          message:
            '${file.type} 不允许引用 ${dependency.type}（依赖方向：app → pages → features → shared）',
          rules: [
            { from: { type: 'app' }, allow: { to: { type: ['pages', 'features', 'shared'] } } },
            { from: { type: 'pages' }, allow: { to: { type: ['features', 'shared'] } } },
            { from: { type: 'features' }, allow: { to: { type: 'shared' } } },
            { from: { type: 'shared' }, allow: { to: { type: 'shared' } } },
          ],
        },
      ],
    },
  },
);
