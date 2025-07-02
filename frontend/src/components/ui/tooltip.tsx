import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';

interface TooltipProps {
  children: React.ReactNode;
  content: string | React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
  disabled?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  side = 'top',
  className,
  disabled = false
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const tooltipRef = React.useRef<HTMLDivElement>(null);

  const calculatePosition = React.useCallback(() => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const scrollX = window.pageXOffset;
    const scrollY = window.pageYOffset;

    let x = 0;
    let y = 0;

    switch (side) {
      case 'top':
        x = triggerRect.left + scrollX + triggerRect.width / 2;
        y = triggerRect.top + scrollY - 8;
        break;
      case 'bottom':
        x = triggerRect.left + scrollX + triggerRect.width / 2;
        y = triggerRect.bottom + scrollY + 8;
        break;
      case 'left':
        x = triggerRect.left + scrollX - 8;
        y = triggerRect.top + scrollY + triggerRect.height / 2;
        break;
      case 'right':
        x = triggerRect.right + scrollX + 8;
        y = triggerRect.top + scrollY + triggerRect.height / 2;
        break;
    }

    setPosition({ x, y });
  }, [side]);

  const handleMouseEnter = () => {
    if (disabled) return;
    setIsVisible(true);
    calculatePosition();
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  React.useEffect(() => {
    if (isVisible) {
      const handleScroll = () => {
        calculatePosition();
      };
      const handleResize = () => {
        calculatePosition();
      };

      window.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isVisible, calculatePosition]);

  const getTooltipStyle = () => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: position.x,
      top: position.y,
      zIndex: 9999,
    };

    switch (side) {
      case 'top':
        return {
          ...baseStyle,
          transform: 'translateX(-50%) translateY(-100%)',
        };
      case 'bottom':
        return {
          ...baseStyle,
          transform: 'translateX(-50%)',
        };
      case 'left':
        return {
          ...baseStyle,
          transform: 'translateX(-100%) translateY(-50%)',
        };
      case 'right':
        return {
          ...baseStyle,
          transform: 'translateY(-50%)',
        };
      default:
        return baseStyle;
    }
  };

  const getArrowClasses = () => {
    const baseClasses = 'absolute w-2 h-2 bg-gray-900 transform rotate-45';
    
    switch (side) {
      case 'top':
        return `${baseClasses} top-full left-1/2 -translate-x-1/2 -translate-y-1/2`;
      case 'bottom':
        return `${baseClasses} bottom-full left-1/2 -translate-x-1/2 translate-y-1/2`;
      case 'left':
        return `${baseClasses} left-full top-1/2 -translate-x-1/2 -translate-y-1/2`;
      case 'right':
        return `${baseClasses} right-full top-1/2 translate-x-1/2 -translate-y-1/2`;
      default:
        return baseClasses;
    }
  };

  if (!content) return <>{children}</>;

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>
      
      {isVisible && typeof document !== 'undefined' && createPortal(
        <div
          ref={tooltipRef}
          style={getTooltipStyle()}
          className={cn(
            'animate-in fade-in-0 zoom-in-95 duration-200',
            'relative px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg max-w-xs break-words',
            className
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className={getArrowClasses()} />
          {content}
        </div>,
        document.body
      )}
    </>
  );
}; 