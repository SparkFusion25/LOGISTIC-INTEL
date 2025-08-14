jest.unmock('lucide-react');

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CompanyDrawer from '../CompanyDrawer';

jest.unmock('lucide-react');
jest.mock('@/lib/auth-helpers', () => ({
  canAccessFeature: jest.fn((user, feature) => (feature === 'trend_analysis' ? false : true)),
  getAuthUser: jest.fn(async () => ({ id: 'user1', name: 'Test User' })),
  getFeatureGateMessage: jest.fn((feature) => `Feature ${feature} is gated`),
}));

describe('CompanyDrawer', () => {
  it('renders upsell when feature is gated', async () => {
    const u = userEvent.setup();
    render(
      <CompanyDrawer
        open={true}
        onClose={() => {}}
        company={{ id: '1', name: 'Acme Inc.' }}
      />
    );

    expect(await screen.findByText('Acme Inc.')).toBeInTheDocument();

    await u.click(screen.getByText('Trends'));

    expect(await screen.findByRole('link', { name: /Upgrade/ })).toBeInTheDocument();
  });
});
