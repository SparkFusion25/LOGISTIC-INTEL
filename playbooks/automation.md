# Automation Playbook

## Common Tasks

- Run full build and tests:
  - `npm install`
  - `npm run lint`
  - `npm run build`
  - `npm test`

- Env setup:
  - Copy `.env.example` to `.env.local` and fill values.

- Release checklist:
  - Update CHANGELOG
  - Ensure CI green
  - Create GitHub release