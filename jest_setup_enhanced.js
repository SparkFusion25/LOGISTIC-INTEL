// Enhanced Jest setup for lucide-react debug
if (process.env.DEBUG_LUCIDE === '1') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const lucide = require('lucide-react');
  // eslint-disable-next-line no-console
  console.log('lucide keys:', Object.keys(lucide));
}
