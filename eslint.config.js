import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
			globals: {
				...globals.node,
				...globals.es2022,
			},
		},
		rules: {
			'@typescript-eslint/no-unused-vars': ['error', { 
				argsIgnorePattern: '^_',
				varsIgnorePattern: '^_' 
			}],
			'no-console': 'off',
			'prefer-const': 'error',
		},
	},
	{
		ignores: ['dist/**', 'node_modules/**', '*.config.*'],
	}
)