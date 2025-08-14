const React = require('react');
const Package = (p) => React.createElement('svg', { 'data-icon': 'Package', role: 'img', ...p });
module.exports = { Package };
module.exports.default = Package;
module.exports.__esModule = true;
