module.exports = {
  './src/**/*.{json,css,scss,md}': ['pnpm format:write'],
  './src/**/*.+(ts|tsx)': ['pnpm lint:fix'],
}
