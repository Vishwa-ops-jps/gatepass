// Check if running directly in Node.js server environment (e.g. Render, Railway, cloud hosts)
if (typeof process !== 'undefined' && process.release && process.release.name === 'node' && require.main === module) {
  require('./server/index.js');
} else {
  // Expo mobile runtime
  const { registerRootComponent } = require('expo');
  const App = require('./App').default || require('./App');
  registerRootComponent(App);
}
