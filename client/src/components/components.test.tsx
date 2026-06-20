import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Logo } from './ui/Logo';

describe('UI Components Tests', () => {
  describe('Logo Component', () => {
    it('renders the EcoPulse logo text correctly', () => {
      render(<Logo />);
      expect(screen.getByText('EcoPulse')).toBeInTheDocument();
    });

    it('applies custom className props correctly', () => {
      const { container } = render(<Logo className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});
