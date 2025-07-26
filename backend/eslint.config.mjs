// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended, // ESLint 原生推荐规则（基础）
  ...tseslint.configs.recommendedTypeChecked, // TypeScript 类型检查推荐规则
  eslintPluginPrettierRecommended, // Prettier 推荐规则
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      // === 放宽限制 ===
      '@typescript-eslint/no-explicit-any': 'off', // 允许使用 any
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/restrict-template-expressions': 'warn',

      // === 兼容常见语法 ===
      'no-useless-escape': 'warn',
      'no-control-regex': 'off', // 允许使用控制字符正则（如清洗字符）

      // === 你也可以添加一些额外的容忍性配置（可选） ===
      // 'no-console': 'off', // 允许 console.log
      // 'no-unused-vars': 'warn',
    },
  },
);
