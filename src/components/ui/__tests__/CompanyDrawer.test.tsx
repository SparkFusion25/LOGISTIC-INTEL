import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CompanyDrawer from '@/components/ui/CompanyDrawer'

jest.mock('@/lib/auth-helpers', () => ({
  getAuthUser: async () => null,
  canAccessFeature: () => false,
  getFeatureGateMessage: (feature: string) => `Upgrade required: ${feature}`,
}))

describe('CompanyDrawer', () => {
  it('renders upsell when feature is gated', async () => {
    render(
      <CompanyDrawer
        open={true}
        onClose={() => {}}
        company={{ id: '1', name: 'Acme Inc.' }}
      />
    )

    expect(await screen.findByText('Acme Inc.')).toBeInTheDocument()

    await userEvent.click(screen.getByText('Trends'))

    expect(await screen.findByRole('link', { name: /Upgrade/ })).toBeInTheDocument()
  })
})