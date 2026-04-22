// tests/integration/_helper.js
const path = require('path');

const MINIPROGRAM = path.resolve(__dirname, '../../miniprogram');

function pagePath(name) {
  return path.join(MINIPROGRAM, 'pages', name, 'index.js');
}

function utilsPath(name) {
  return path.join(MINIPROGRAM, 'utils', `${name}.js`);
}

function loadPage(name) {
  const p = pagePath(name);
  delete require.cache[p];
  require(p);
  return globalThis.__lastPage;
}

function seed() {
  const mock = require(utilsPath('mock'));
  mock.ensureMockSeed();
  return mock;
}

function auth() {
  return require(utilsPath('auth'));
}

function api() {
  return require(utilsPath('api'));
}

module.exports = { loadPage, seed, auth, api, MINIPROGRAM, utilsPath, pagePath };
