const path = require('path');

module.exports = function (request, options) {
  if (process.env.DEBUG_LUCIDE === '1' && request === 'lucide-react') {
    console.log('jest.resolver: lucide-react requested');
  }
  return options.defaultResolver(request, options);
};
