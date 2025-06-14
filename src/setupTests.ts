import '@testing-library/jest-dom';

// Mock import.meta for Vite environment variables
(global as any).importMeta = {
  env: {
    VITE_SUPABASE_URL: 'https://test.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'test-anon-key',
    VITE_OPENAI_API_KEY: '',
    VITE_ANTHROPIC_API_KEY: '',
    VITE_GOOGLE_API_KEY: '',
    VITE_HUGGINGFACE_API_KEY: '',
    VITE_MISTRAL_API_KEY: ''
  }
};

// Replace import.meta with our mock
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: (global as any).importMeta
  }
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock as any;

// Mock window.location
delete (window as any).location;
window.location = {
  ...window.location,
  protocol: 'https:',
  hostname: 'localhost',
  href: 'https://localhost:3000',
  reload: jest.fn(),
  assign: jest.fn(),
  replace: jest.fn(),
} as any;

// Mock window.alert and confirm
global.alert = jest.fn();
global.confirm = jest.fn(() => true);

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
    readText: jest.fn(() => Promise.resolve('')),
  },
});

// Mock environment variables
process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';

// Silence console.warn and console.error in tests unless needed
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});