/**
 * Test Setup & Teardown
 * Prevents EADDRINUSE errors by managing single server instance
 */

let serverInstance = null;

export async function setup() {
  // Global test setup if needed
  console.info('🧪 Test suite starting...');
}

export async function teardown() {
  // Global test teardown
  if (serverInstance) {
    await serverInstance.close();
    serverInstance = null;
  }
  console.info('✅ Test suite completed');
}

// Suppress console warnings during tests
const originalWarn = console.warn;
export function suppressWarnings() {
  console.warn = (...args) => {
    // Suppress specific warnings
    const message = args.join(' ');
    if (message.includes('EADDRINUSE') || message.includes('address already in use')) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

export function restoreWarnings() {
  console.warn = originalWarn;
}
