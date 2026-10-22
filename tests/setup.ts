import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock server-only so server domain modules can be tested in jsdom runner
vi.mock('server-only', () => ({}));
