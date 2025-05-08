import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserAgent } from '../utils/browser';
import CloseIcon from '../assets/icon/close-icon';
import IosShareIcon from '../assets/icon/ios-share-icon';
import AddSquareIcon from '../assets/icon/add-square-icon';
import pwaTipImage from '../assets/image/mdc-pwa-tip.png';
import '../assets/style/PwaTipModal.css';

const PWA_TIP_DISMISSED_COUNT_KEY = 'pwa-tip-dismissed-count';
const MAX_DISMISS_COUNT = 3;

const PwaTipModal: React.FC = () => {
  const { t } = useTranslation();
  const { getDeviceType, isPwa } = useUserAgent();
  const [isVisible, setIsVisible] = useState(false);
  const [hasShownInSession, setHasShownInSession] = useState(false);

  useEffect(() => {
    // Only show the modal if:
    // 1. The user is on iOS
    // 2. The app is not running in PWA mode
    // 3. The user hasn't dismissed the modal more than MAX_DISMISS_COUNT times
    // 4. The modal hasn't been shown in this session already
    const currentDismissCount = Number(
      localStorage.getItem(PWA_TIP_DISMISSED_COUNT_KEY) || '0'
    );
    const reachedMaxDismissals = currentDismissCount >= MAX_DISMISS_COUNT;
    const shouldShow =
      getDeviceType() === 'ios' &&
      !isPwa() &&
      !reachedMaxDismissals &&
      !hasShownInSession;

    if (shouldShow) {
      // Add a small delay to avoid immediate pop-up when page loads
      const timer = setTimeout(() => {
        setIsVisible(true);
        setHasShownInSession(true); // Mark that we've shown the modal in this session
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [getDeviceType, isPwa, hasShownInSession]);

  const closeModal = () => {
    setIsVisible(false);

    // Increment the dismiss count
    const currentDismissCount = Number(
      localStorage.getItem(PWA_TIP_DISMISSED_COUNT_KEY) || '0'
    );
    const newDismissCount = currentDismissCount + 1;
    localStorage.setItem(
      PWA_TIP_DISMISSED_COUNT_KEY,
      newDismissCount.toString()
    );
  };

  if (!isVisible) return null;

  return (
    <div className="pwa-tip-modal-container">
      <div className="pwa-tip-modal-backdrop" onClick={closeModal}></div>
      <div className="pwa-tip-modal">
        <button className="pwa-tip-modal-close" onClick={closeModal}>
          <CloseIcon />
        </button>

        <h2>{t('pwa.install.title')}</h2>

        <div className="pwa-tip-modal-content">
          <div className="pwa-tip-modal-image">
            <img src={pwaTipImage} alt="MDC PWA on iPhone home screen" />
          </div>

          <div className="pwa-tip-modal-description">
            <p>{t('pwa.install.description')}</p>
          </div>

          <div className="pwa-tip-modal-steps">
            <div className="pwa-tip-modal-step">
              <div className="pwa-tip-modal-step-icon">
                <div className="pwa-tip-modal-step-number">1</div>
                <IosShareIcon />
              </div>
              <p>{t('pwa.install.step1')}</p>
            </div>

            <div className="pwa-tip-modal-step">
              <div className="pwa-tip-modal-step-icon">
                <div className="pwa-tip-modal-step-number">2</div>
                <AddSquareIcon />
              </div>
              <p>{t('pwa.install.step2')}</p>
            </div>
          </div>
        </div>

        <div className="pwa-tip-modal-tail"></div>
      </div>
    </div>
  );
};

export default PwaTipModal;
