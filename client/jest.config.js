const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured for you based on your tsconfig.json paths)
    '^@/(.*)$': '<rootDir>/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'hooks/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'pages/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/coverage/**',
  ],
  testMatch: ['**/__tests__/**/*.{ts,tsx}', '**/?(*.)+(spec|test).{ts,tsx}'],
  testPathIgnorePatterns: ['/node_modules/', '/e2e/', '/playwright-report/', '/test-results/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  // Use Next.js jest presets (babel-jest) instead of ts-jest
  transform: {},
  testTimeout: 10000,
  coverageThreshold: {
    'components/ui/Section.tsx': {
      branches: 50,
      functions: 60,
      lines: 60,
      statements: 60,
    },
    'components/ui/GradientCard.tsx': {
      branches: 50,
      functions: 60,
      lines: 60,
      statements: 60,
    },
    'components/ui/SocialIconLink.tsx': {
      branches: 50,
      functions: 60,
      lines: 60,
      statements: 60,
    },
    'components/ui/Marquee.tsx': {
      branches: 50,
      functions: 60,
      lines: 60,
      statements: 60,
    },
    'components/ui/AnimatedHeading.tsx': {
      branches: 50,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
