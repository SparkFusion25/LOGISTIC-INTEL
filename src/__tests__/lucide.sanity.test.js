const React = require('react');
const { render } = require('@testing-library/react');
const { X, Crown } = require('lucide-react');

test('lucide named icons are components', () => {
  const { container: a } = render(React.createElement(X, { 'data-testid': 'x' }));
  const { container: b } = render(React.createElement(Crown, { 'data-testid': 'c' }));
  expect(a.querySelector('svg')).toBeTruthy();
  expect(b.querySelector('svg')).toBeTruthy();
});
