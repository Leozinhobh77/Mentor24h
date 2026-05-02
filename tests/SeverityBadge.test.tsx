import React from 'react';
import { render, screen } from '@testing-library/react';
import { SeverityBadge } from '@/components/SeverityBadge';

describe('SeverityBadge Component', () => {
  describe('Rendering Variants', () => {
    it('should render critical severity badge', () => {
      render(<SeverityBadge severity="critical" />);
      const badge = screen.getByRole('status');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-red-500/20', 'border-red-500/50');
    });

    it('should render high severity badge', () => {
      render(<SeverityBadge severity="high" />);
      const badge = screen.getByRole('status');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-orange-500/20', 'border-orange-500/50');
    });

    it('should render medium severity badge', () => {
      render(<SeverityBadge severity="medium" />);
      const badge = screen.getByRole('status');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-yellow-500/20', 'border-yellow-500/50');
    });

    it('should render none severity badge', () => {
      render(<SeverityBadge severity="none" />);
      const badge = screen.getByRole('status');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-gray-500/10', 'border-gray-500/30');
    });
  });

  describe('Numeric Severity Levels', () => {
    it('should render critical for severity >= 9', () => {
      render(<SeverityBadge severity={9.5} />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('bg-red-500/20');
    });

    it('should render high for severity >= 7 and < 9', () => {
      render(<SeverityBadge severity={7.8} />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('bg-orange-500/20');
    });

    it('should render medium for severity > 0 and < 7', () => {
      render(<SeverityBadge severity={3.2} />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('bg-yellow-500/20');
    });

    it('should render none for severity == 0', () => {
      render(<SeverityBadge severity={0} />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('bg-gray-500/10');
    });
  });

  describe('Accessibility (ARIA)', () => {
    it('should have proper ARIA role', () => {
      render(<SeverityBadge severity="critical" />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveAttribute('role', 'status');
    });

    it('should have descriptive ARIA label', () => {
      render(<SeverityBadge severity="critical" />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveAttribute('aria-label', expect.stringContaining('Crítica'));
    });

    it('should include severity value in ARIA label', () => {
      render(<SeverityBadge severity={9.5} />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveAttribute('aria-label', expect.stringContaining('9.5 em 10'));
    });

    it('should have unique ARIA labels for different severities', () => {
      const { rerender } = render(<SeverityBadge severity="critical" />);
      let badge = screen.getByRole('status');
      const criticalLabel = badge.getAttribute('aria-label');

      rerender(<SeverityBadge severity="high" />);
      badge = screen.getByRole('status');
      const highLabel = badge.getAttribute('aria-label');

      expect(criticalLabel).not.toEqual(highLabel);
    });
  });

  describe('Size Props', () => {
    it('should render small size', () => {
      render(<SeverityBadge severity="critical" size="sm" />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('px-2', 'py-1', 'text-xs');
    });

    it('should render medium size by default', () => {
      render(<SeverityBadge severity="critical" />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('px-3', 'py-1.5', 'text-sm');
    });

    it('should render large size', () => {
      render(<SeverityBadge severity="critical" size="lg" />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('px-4', 'py-2', 'text-base');
    });
  });

  describe('Label Display', () => {
    it('should show label by default', () => {
      render(<SeverityBadge severity="critical" />);
      expect(screen.getByText('Crítica')).toBeInTheDocument();
    });

    it('should hide label when showLabel is false', () => {
      const { container } = render(<SeverityBadge severity="critical" showLabel={false} />);
      expect(screen.queryByText('Crítica')).not.toBeInTheDocument();
      expect(container.textContent).toBeTruthy();
    });

    it('should display numeric severity when provided', () => {
      render(<SeverityBadge severity={7.5} />);
      expect(screen.getByText('7.5/10')).toBeInTheDocument();
    });

    it('should format numeric severity to 1 decimal place', () => {
      render(<SeverityBadge severity={9.123456} />);
      expect(screen.getByText('9.1/10')).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('should render critical icon', () => {
      render(<SeverityBadge severity="critical" />);
      const badge = screen.getByRole('status');
      expect(badge.textContent).toContain('🚨');
    });

    it('should render high icon', () => {
      render(<SeverityBadge severity="high" />);
      const badge = screen.getByRole('status');
      expect(badge.textContent).toContain('⚠️');
    });

    it('should render medium icon', () => {
      render(<SeverityBadge severity="medium" />);
      const badge = screen.getByRole('status');
      expect(badge.textContent).toContain('⚡');
    });

    it('should render none icon', () => {
      render(<SeverityBadge severity="none" />);
      const badge = screen.getByRole('status');
      expect(badge.textContent).toContain('✓');
    });

    it('should accept custom icon', () => {
      render(<SeverityBadge severity="critical" icon="💀" />);
      const badge = screen.getByRole('status');
      expect(badge.textContent).toContain('💀');
    });
  });

  describe('Responsive Design', () => {
    it('should be responsive with different sizes', () => {
      const { rerender } = render(<SeverityBadge severity="critical" size="sm" />);
      let badge = screen.getByRole('status');
      expect(badge).toHaveClass('text-xs');

      rerender(<SeverityBadge severity="critical" size="md" />);
      badge = screen.getByRole('status');
      expect(badge).toHaveClass('text-sm');

      rerender(<SeverityBadge severity="critical" size="lg" />);
      badge = screen.getByRole('status');
      expect(badge).toHaveClass('text-base');
    });

    it('should maintain visibility at all sizes', () => {
      ['sm', 'md', 'lg'].forEach((size) => {
        const { container } = render(
          <SeverityBadge severity="critical" size={size as any} />
        );
        const badge = container.querySelector('[role="status"]');
        expect(badge).toBeVisible();
      });
    });
  });

  describe('CSS Classes', () => {
    it('should apply custom className', () => {
      render(<SeverityBadge severity="critical" className="custom-class" />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('custom-class');
    });

    it('should combine variant colors with size styles', () => {
      render(<SeverityBadge severity="high" size="lg" />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('bg-orange-500/20', 'px-4', 'py-2');
    });

    it('should have transition classes for interaction', () => {
      render(<SeverityBadge severity="critical" />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('transition-all', 'duration-200');
    });
  });

  describe('Integration with Crisis Detector', () => {
    it('should correctly display severity from detectCrisis result', () => {
      const mockResult = {
        severity: 9.5,
        recommendedResponse: 'critical',
      };

      render(
        <SeverityBadge
          severity={mockResult.severity}
          showLabel={true}
        />
      );

      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('bg-red-500/20');
      expect(screen.getByText('Crítica')).toBeInTheDocument();
      expect(screen.getByText('9.5/10')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very high severity values', () => {
      render(<SeverityBadge severity={10} />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('bg-red-500/20');
    });

    it('should handle very low severity values', () => {
      render(<SeverityBadge severity={0.1} />);
      const badge = screen.getByRole('status');
      expect(badge).toHaveClass('bg-yellow-500/20');
    });

    it('should handle string severity properly', () => {
      render(<SeverityBadge severity="critical" />);
      expect(screen.getByText('Crítica')).toBeInTheDocument();
    });
  });
});
