import React, { useState, useRef } from 'react';
import { useUserAgent } from '../utils/browser';
import '../assets/style/Tooltip.css';

interface TooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
  delay?: number;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  children,
  delay = 300
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const { getDeviceType } = useUserAgent();
  const timeoutRef = useRef<number | null>(null);

  // Only show tooltips on PC devices
  const isPC = getDeviceType() === 'PC';

  const handleMouseEnter = () => {
    if (!isPC) return; // Don't show tooltips on mobile devices

    // Clear any existing timeout
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    // Set timeout for showing tooltip with delay to prevent flickering
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  return (
    <div
      className="tooltip-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div className={`tooltip tooltip-${position}`}>{content}</div>
      )}
    </div>
  );
};

export default Tooltip;
