import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import boundaries from 'eslint-plugin-boundaries';

export default tseslint.config(
  { ignores: ['prototype/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
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
