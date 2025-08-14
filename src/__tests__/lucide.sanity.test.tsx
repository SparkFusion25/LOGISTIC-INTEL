import React from 'react';
import { render } from '@testing-library/react';
import { X, Crown } from 'lucide-react';

test('lucide named icons are components', () => {
  const { container: a } = render(<X data-testid="x" />);
  const { container: b } = render(<Crown data-testid="c" />);
  expect(a.querySelector('svg')).toBeTruthy();
  expect(b.querySelector('svg')).toBeTruthy();
});
