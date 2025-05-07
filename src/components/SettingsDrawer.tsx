import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import '../assets/style/SettingsDrawer.css';
import CloseIcon from '../assets/icon/close-icon';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close drawer
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node) &&
        isOpen
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevent body scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Handle language change
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <>
      <div
        className={`settings-drawer-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
      ></div>
      <div
        ref={drawerRef}
        className={`settings-drawer ${isOpen ? 'open' : ''}`}
      >
        <div className="settings-drawer-header">
          <h2>{t('settings.title')}</h2>
          <button className="close-button" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <div className="settings-drawer-content">
          {/* Language Selection */}
          <div className="settings-section">
            <h3>{t('settings.language')}</h3>
            <div className="language-options">
              <button
                className={`language-option ${
                  i18n.language === 'en' ? 'active' : ''
                }`}
                onClick={() => changeLanguage('en')}
              >
                English
              </button>
              <button
                className={`language-option ${
                  i18n.language === 'zh' ? 'active' : ''
                }`}
                onClick={() => changeLanguage('zh')}
              >
                中文
              </button>
              {/* Add more language options as needed */}
            </div>
          </div>

          {/* Theme Toggle - Placeholder for future implementation */}
          <div className="settings-section">
            <h3>{t('settings.theme')}</h3>
            <div className="theme-toggle">
              <span>{t('settings.lightTheme')}</span>
              <label className="switch">
                <input type="checkbox" />
                <span className="slider round"></span>
              </label>
              <span>{t('settings.darkTheme')}</span>
            </div>
          </div>

          {/* Additional settings sections can be added here */}
        </div>
      </div>
    </>
  );
};

export default SettingsDrawer;
