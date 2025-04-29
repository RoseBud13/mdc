import React, { useEffect } from 'react';
import '../assets/style/Toast.css';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type,
  isVisible,
  onClose,
  duration = 3000
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  return isVisible ? (
    <div className={`toast-container ${type} ${isVisible ? 'visible' : ''}`}>
      <div className="toast-content">
        <span className="toast-icon">{type === 'success' ? '✓' : '✗'}</span>
        <span className="toast-message">{message}</span>
      </div>
    </div>
  ) : null;
};

export default Toast;
