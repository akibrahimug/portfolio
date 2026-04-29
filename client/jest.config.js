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
  // The CRUD test runner is invoked manually via `yarn test:crud`, not by Jest
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/__tests__/test-runner.ts', '<rootDir>/__tests__/factories/'],
  // Allow Jest to transform ESM packages (Clerk ships .mjs); next/jest's default ignores most node_modules.
  transformIgnorePatterns: ['/node_modules/(?!(@clerk|jose|jwt-decode|@phosphor-icons|tw-animate-css)/)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  // Use Next.js jest presets (babel-jest) instead of ts-jest
  transform: {},
  testTimeout: 10000,
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
