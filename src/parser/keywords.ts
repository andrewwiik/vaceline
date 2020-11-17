export const topLevelKeywords = new Set([
  'include',
  'import',
  'sub',
  'acl',
  'backend',
  'table',
  'probe',
])

export const keywords = new Set([
  // statement directives
  'call',
  'declare',
  'local',
  'declare',
  'local',
  'add',
  'set',
  'unset',
  'return',
  'error',
  'restart',
  'synthetic',
  'log',
  'new',
  'if',
  'else',
  ...topLevelKeywords,
])

// https://book.varnish-software.com/4.0/chapters/VCL_Basics.html#legal-return-actions
export const returnActions = new Set([
  'deliver',
  'fetch',
  'restart',
  'hash',
  'pass',
  'pipe',
  'synth',
  'purge',
  'lookup',
  'miss',
  'ok',

  // Fastly
  'deliver_stale',
])
