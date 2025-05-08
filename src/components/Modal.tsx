import React from 'react';
import '../assets/style/Modal.css';
import CloseIcon from '../assets/icon/close-icon';
import ReactMarkdown from 'react-markdown';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  content?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null;

  // Stop click propagation to prevent closing the drawer
  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="modal-overlay"
      onClick={e => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div className="modal-container" onClick={handleContainerClick}>
        <button
          className="modal-close"
          onClick={e => {
            e.stopPropagation();
            onClose();
          }}
        >
          <CloseIcon />
        </button>
        <div className="modal-content-container">
          <h3 className="modal-title">{title}</h3>
          <div className="modal-content">
            <ReactMarkdown>{content || ''}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
