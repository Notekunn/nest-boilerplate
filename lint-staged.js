module.exports = {
  './src/**/*.{json,css,scss,md}': ['npm run format:write'],
  './src/**/*.+(ts|tsx)': ['npm run lint:fix'],
}
