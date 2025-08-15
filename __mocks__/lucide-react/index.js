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
  Search: make('Search'),
  Ship: make('Ship'),
  Plane: make('Plane'),
  MapPin: make('MapPin'),
  Building2: make('Building2'),
  DollarSign: make('DollarSign'),
};

api.__esModule = true;
module.exports = api;
module.exports.default = api;
Object.assign(module.exports, api);

