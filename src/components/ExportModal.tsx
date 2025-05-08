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
    <div
      className="export-modal-overlay"
      onClick={e => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div className="export-modal-container">
        <button className="export-modal-close" onClick={onClose}>
          <CloseIcon />
        </button>

        <div className="export-modal-content">
          <div className="export-modal-icon">{fileIcon}</div>

          <h3 className="export-modal-title">{title}</h3>

          <p className="export-modal-description">{description}</p>

          <div className="export-modal-actions">
            <button className="export-modal-button cancel" onClick={onClose}>
              <Trans i18nKey="button.cancel" />
            </button>
            <button className="export-modal-button confirm" onClick={onConfirm}>
              <Trans i18nKey="button.export" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
