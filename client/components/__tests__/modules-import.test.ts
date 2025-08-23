// Import-only tests to ensure modules exist and are compatible with Jest

describe('ui module imports', () => {
  const entries = [
    () => require('../ui/button'),
    () => require('../ui/card'),
    () => require('../ui/input'),
    () => require('../ui/form'),
    () => require('../ui/textarea'),
    () => require('../ui/checkbox'),
    () => require('../ui/select'),
    () => require('../ui/dialog'),
    () => require('../ui/tabs'),
    () => require('../ui/table'),
    () => require('../ui/tooltip'),
  ]

  it('imports ui modules', () => {
    for (const load of entries) {
      expect(() => load()).not.toThrow()
    }
  })
})
