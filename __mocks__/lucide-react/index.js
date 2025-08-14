console.log('lucide-react mock loaded');

const React = require('react');
const make = (n) => (p) => React.createElement('svg', { role: 'img', 'data-icon': n, ...p });

const api = {
  X: make('X'),
  TrendingUp: make('TrendingUp'),
  Users: make('Users'),
  Package: make('Package'),
  Info: make('Info'),
  Crown: make('Crown'),
};

api.__esModule = true;
module.exports = api;
module.exports.default = api;
Object.assign(module.exports, api);

