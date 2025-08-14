// DEBUG: verify at runtime which mock is loaded
if (process.env.DEBUG_LUCIDE === '1') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const lucide = require('lucide-react');
  // eslint-disable-next-line no-console
  console.log('lucide keys:', Object.keys(lucide));
  // should include: default, X, TrendingUp, Users, Package, Info, Crown, __esModule
}
