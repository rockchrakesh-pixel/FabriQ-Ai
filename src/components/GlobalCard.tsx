import React from 'react';

export interface GlobalCardProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'elevated' | 'accent' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  as?: 'div' | 'section' | 'article';
  highlight?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  role?: string;
  tabIndex?: number;
  'aria-label'?: string;
}

/**
 * GlobalCard: Canonical luxury card component for FabriQ.
 * Standardizes Deep Navy surfaces, Metallic Gold borders (#C29C6D/40, #D4AF37),
 * overflow-safe layouts (w-full min-w-0), and consistent padding.
 */
export const GlobalCard: React.FC<GlobalCardProps> = ({
  children,
  variant = 'primary',
  padding = 'md',
  className = '',
  onClick,
  as: Component = 'div',
  highlight = false,
  header,
  footer,
  role,
  tabIndex,
  'aria-label': ariaLabel,
}) => {
  const baseStyles = 'w-full min-w-0 rounded-3xl transition-all duration-300 relative text-[#FAF9F6]';

  const variantStyles = {
    primary:
      'bg-[#0B1528] border-2 border-[#C29C6D]/40 shadow-xl',
    secondary:
      'bg-[#070F1E] border border-[#C29C6D]/30 shadow-md',
    elevated:
      'bg-[#0E1A33] border-2 border-[#D4AF37]/50 shadow-2xl',
    accent:
      'bg-gradient-to-br from-[#0B1528] via-[#0E1A33] to-[#121E36] border-2 border-[#E5C07B]/60 shadow-[0_8px_30px_rgba(212,175,55,0.15)]',
    interactive:
      'bg-[#0B1528] border-2 border-[#C29C6D]/40 shadow-lg hover:border-[#D4AF37] hover:shadow-[0_10px_35px_rgba(212,175,55,0.2)] hover:-translate-y-0.5 cursor-pointer active:scale-[0.99]',
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  const highlightBorder = highlight ? 'ring-2 ring-[#D4AF37]/60 border-[#D4AF37]' : '';
  const interactiveRole = onClick ? (role || 'button') : role;
  const interactiveTabIndex = onClick ? (tabIndex ?? 0) : tabIndex;

  return (
    <Component
      onClick={onClick}
      role={interactiveRole}
      tabIndex={interactiveTabIndex}
      aria-label={ariaLabel}
      onKeyDown={
        onClick
          ? (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${highlightBorder} ${className}`}
    >
      {header && <div className="mb-4 border-b border-[#C29C6D]/20 pb-3">{header}</div>}
      <div className="w-full min-w-0">{children}</div>
      {footer && <div className="mt-4 border-t border-[#C29C6D]/20 pt-3">{footer}</div>}
    </Component>
  );
};
