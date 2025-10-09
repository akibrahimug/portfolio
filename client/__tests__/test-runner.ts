/**
 * Test runner script for CRUD operations
 * Run with: npm run test:crud
 */

import { execSync } from 'child_process'
import path from 'path'

interface TestSuite {
  name: string
  path: string
  description: string
  priority: 'high' | 'medium' | 'low'
}

const testSuites: TestSuite[] = [
  {
    name: 'HTTP Client Tests',
    path: 'lib/__tests__/http-client-complete.test.ts',
    description: 'Tests all HTTP client CRUD methods, error handling, and API responses',
    priority: 'high'
  },
  {
    name: 'Hooks Unit Tests',
    path: 'hooks/__tests__/useHttpApi-complete.test.ts',
    description: 'Tests all React hooks for CRUD operations with proper mocking',
    priority: 'high'
  },
  {
    name: 'Integration Tests',
    path: '__tests__/integration/crud-operations.integration.test.tsx',
    description: 'End-to-end tests for complete CRUD workflows',
    priority: 'high'
  },
  {
    name: 'Authentication Tests',
    path: '__tests__/auth/authentication-flow.test.ts',
    description: 'Tests token handling, refresh scenarios, and auth edge cases',
    priority: 'high'
  },
  {
    name: 'Original Hook Tests',
    path: 'hooks/__tests__/useHttpApi.test.ts',
    description: 'Original project-focused hook tests',
    priority: 'medium'
  },
  {
    name: 'Auth Hook Tests',
    path: 'hooks/__tests__/useClerkAuth.test.ts',
    description: 'Clerk authentication hook tests',
    priority: 'medium'
  }
]

function runTestSuite(suite: TestSuite, verbose: boolean = false) {
  const relativePath = path.relative(process.cwd(), suite.path)
  console.log(`\n🧪 Running: ${suite.name}`)
  console.log(`📁 Path: ${relativePath}`)
  console.log(`📋 Description: ${suite.description}`)
  console.log(`⚡ Priority: ${suite.priority.toUpperCase()}`)
  console.log('─'.repeat(80))

  try {
    const command = `npm test -- ${suite.path}${verbose ? ' --verbose' : ''}`
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: verbose ? 'inherit' : 'pipe'
    })

    if (!verbose) {
      console.log(output)
    }

    console.log('✅ PASSED\n')
    return true
  } catch (error) {
    console.log('❌ FAILED')
    if (error instanceof Error && 'stdout' in error) {
      console.log((error as any).stdout)
    }
    console.log(`Error: ${error}\n`)
    return false
  }
}

function runAllTests() {
  console.log('🚀 Running Complete CRUD Operations Test Suite')
  console.log('=' .repeat(80))

  const results = testSuites.map(suite => ({
    suite,
    passed: runTestSuite(suite, false)
  }))

  console.log('\n📊 Test Results Summary')
  console.log('=' .repeat(80))

  const highPriorityResults = results.filter(r => r.suite.priority === 'high')
  const mediumPriorityResults = results.filter(r => r.suite.priority === 'medium')

  console.log('\n🔥 High Priority Tests:')
  highPriorityResults.forEach(({ suite, passed }) => {
    console.log(`${passed ? '✅' : '❌'} ${suite.name}`)
  })

  console.log('\n⚡ Medium Priority Tests:')
  mediumPriorityResults.forEach(({ suite, passed }) => {
    console.log(`${passed ? '✅' : '❌'} ${suite.name}`)
  })

  const totalTests = results.length
  const passedTests = results.filter(r => r.passed).length
  const highPriorityPassed = highPriorityResults.filter(r => r.passed).length

  console.log('\n📈 Statistics:')
  console.log(`Total Test Suites: ${totalTests}`)
  console.log(`Passed: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`)
  console.log(`High Priority Passed: ${highPriorityPassed}/${highPriorityResults.length}`)

  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! CRUD operations are working correctly.')
  } else {
    console.log('\n⚠️  Some tests failed. Check the output above for details.')
    process.exit(1)
  }
}

// Command line interface
const args = process.argv.slice(2)

if (args.length === 0) {
  runAllTests()
} else if (args[0] === '--help' || args[0] === '-h') {
  console.log('CRUD Operations Test Runner')
  console.log('Usage:')
  console.log('  npm run test:crud                 # Run all test suites')
  console.log('  npm run test:crud -- --list       # List available test suites')
  console.log('  npm run test:crud -- --suite <name> # Run specific test suite')
  console.log('  npm run test:crud -- --verbose    # Run with verbose output')
} else if (args[0] === '--list') {
  console.log('Available Test Suites:')
  testSuites.forEach((suite, index) => {
    console.log(`${index + 1}. ${suite.name} (${suite.priority})`)
    console.log(`   ${suite.description}`)
    console.log(`   📁 ${suite.path}\n`)
  })
} else if (args[0] === '--suite' && args[1]) {
  const suiteName = args[1]
  const suite = testSuites.find(s =>
    s.name.toLowerCase().includes(suiteName.toLowerCase())
  )

  if (suite) {
    const verbose = args.includes('--verbose')
    runTestSuite(suite, verbose)
  } else {
    console.error(`Test suite "${suiteName}" not found.`)
    console.log('Use --list to see available test suites.')
    process.exit(1)
  }
} else {
  runAllTests()
}