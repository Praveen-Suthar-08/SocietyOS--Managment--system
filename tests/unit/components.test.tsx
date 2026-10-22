import * as React from 'react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { cn } from '@/lib/utils';

describe('UI Primitives & Accessibility Standards', () => {
  it('renders Button with primary variant and text content', () => {
    render(<Button variant="primary">Submit Report</Button>);
    const btn = screen.getByRole('button', { name: /Submit Report/i });
    expect(btn).toBeInTheDocument();
    expect(btn.className).toMatch(/bg-brand|bg-\[#276749\]/);
  });

  it('renders Emergency Button with accessible alert styling', () => {
    render(<Button variant="emergency">SOS Emergency</Button>);
    const btn = screen.getByRole('button', { name: /SOS Emergency/i });
    expect(btn).toBeInTheDocument();
    expect(btn.className).toMatch(/bg-emergency|bg-\[#B42318\]/);
  });

  it('ensures StatusBadge contains visible text and does not rely on color alone', () => {
    render(<StatusBadge status="UNCONFIGURED" />);
    expect(screen.getByText(/Not configured/i)).toBeInTheDocument();
  });

  it('correctly merges Tailwind class names using cn()', () => {
    const merged = cn('px-4 py-2', 'px-6', { 'text-red-500': true, 'text-blue-500': false });
    expect(merged).toContain('px-6');
    expect(merged).not.toContain('px-4');
    expect(merged).toContain('text-red-500');
  });
});
