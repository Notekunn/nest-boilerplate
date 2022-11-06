module.exports = {
  './src/**/*.{js,jsx,ts,tsx,json,css,scss,md}': ['yarn format:write'],
  './src/**/*.+(js|json|ts|tsx)': ['yarn lint:fix'],
}
