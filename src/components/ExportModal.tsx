import React from 'react';
import { Trans } from 'react-i18next';
import '../assets/style/ExportModal.css';
import CloseIcon from '../assets/icon/close-icon';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fileType: string;
  fileIcon: React.ReactNode;
  title?: string;
  description?: string;
}

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  fileType,
  fileIcon,
  title = `Export as ${fileType}`,
  description = `Your content will be exported as a ${fileType} file.`
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="modal-close" onClick={onClose}>
          <CloseIcon />
        </button>

        <div className="modal-content">
          <div className="modal-icon">{fileIcon}</div>

          <h3 className="modal-title">{title}</h3>

          <p className="modal-description">{description}</p>

          <div className="modal-actions">
            <button className="modal-button cancel" onClick={onClose}>
              <Trans i18nKey="button.cancel" />
            </button>
            <button className="modal-button confirm" onClick={onConfirm}>
              <Trans i18nKey="button.export" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
