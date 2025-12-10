// Global test setup and utilities

// Mock API base URL for tests
process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:3500/api'

// Suppress console errors in tests (optional)
// const originalError = console.error
// beforeAll(() => {
//   console.error = (...args: any[]) => {
//     if (
//       typeof args[0] === 'string' &&
//       args[0].includes('Warning: ReactDOM.render')
//     ) {
//       return
//     }
//     originalError.call(console, ...args)
//   }
// })

// afterAll(() => {
//   console.error = originalError
// })

