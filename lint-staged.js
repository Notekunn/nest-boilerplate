module.exports = {
  './src/**/*.{json,css,scss,md}': ['yarn format:write'],
  './src/**/*.+(ts|tsx)': ['yarn lint:fix'],
}
