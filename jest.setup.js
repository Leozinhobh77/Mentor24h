// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Remove Next.js Request validation errors in jsdom
if (typeof window !== 'undefined' && typeof window.Request !== 'undefined') {
  global.Request = window.Request;
  global.Response = window.Response;
  global.Headers = window.Headers;
}
