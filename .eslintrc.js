module.exports = {
  'env': {
    'commonjs': true,
    'es6': true,
    'node': true,
    'mocha': true,
  },
  'extends': [
    'google',
  ],
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly',
  },
  'parserOptions': {
    'ecmaVersion': 2018,
  },
  'rules': {
    "linebreak-style": 0,
    "object-curly-spacing": 0
  },
};
