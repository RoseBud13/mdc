import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../assets/style/SettingsDrawer.css';
import CloseIcon from '../assets/icon/close-icon';
import { useTheme } from '../hooks/useTheme';
import mdcLogo from '../assets/image/mdc-logo.png';
import Modal from './Modal';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const drawerRef = useRef<HTMLDivElement>(null);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

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

  const openTermsModal = () => {
    setIsTermsModalOpen(true);
  };

  const closeTermsModal = () => {
    setIsTermsModalOpen(false);
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
                  i18n.resolvedLanguage === 'en' ? 'active' : ''
                }`}
                onClick={() => changeLanguage('en')}
              >
                English
              </button>
              <button
                className={`language-option ${
                  i18n.resolvedLanguage === 'zh' ? 'active' : ''
                }`}
                onClick={() => changeLanguage('zh')}
              >
                中文
              </button>
              {/* Add more language options as needed */}
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="settings-section">
            <h3>{t('settings.theme')}</h3>
            <div className="theme-toggle">
              <span>{t('settings.lightTheme')}</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={theme === 'dark'}
                  onChange={toggleTheme}
                />
                <span className="slider round"></span>
              </label>
              <span>{t('settings.darkTheme')}</span>
            </div>
          </div>

          {/* Additional settings sections can be added here */}

          {/* About and copyright */}
          <div className="settings-footer">
            <img src={mdcLogo} alt="PWA Logo" className="pwa-logo" />
            <div className="about-content">
              <p className="about-clickable" onClick={openTermsModal}>
                {t('settings.serviceAndPrivacy')}
              </p>
              <p>© 2025 MDC. All Rights Reserved.</p>
              <p>Version 1.0</p>
              <p>Made with ♡ by Rosebud</p>
            </div>
          </div>
        </div>
      </div>

      {/* Terms of Service Modal */}
      <Modal
        isOpen={isTermsModalOpen}
        onClose={closeTermsModal}
        title={t('settings.serviceAndPrivacy')}
        content={`${t('artical.termsOfServiceContent')}\n\n---\n\n${t(
          'artical.privacyPolicyContent'
        )}`}
      />
    </>
  );
};

export default SettingsDrawer;
