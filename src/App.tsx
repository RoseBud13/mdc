import { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';
import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';
import markdownDocx, { Packer } from 'markdown-docx';
import { useTranslation } from 'react-i18next';
import './App.css';
import { useUserAgent } from './utils/browser';
import PasteIcon from './assets/icon/paste-icon';
import CloseSquareIcon from './assets/icon/close-square-icon';
import CloseIcon from './assets/icon/close-icon';
import ImageIcon from './assets/icon/image-icon';
import PdfIcon from './assets/icon/pdf-icon';
import HtmlIcon from './assets/icon/html-icon';
import SettingsFillIcon from './assets/icon/settings-fill-icon';
import TextIcon from './assets/icon/text-icon';
import DocIcon from './assets/icon/doc-icon';
import Toast from './components/Toast';
import ExportModal from './components/ExportModal';
import SettingsDrawer from './components/SettingsDrawer';

function App() {
  const { t, i18n } = useTranslation();

  const [markdown, setMarkdown] = useState(t('description') as string);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Toast state
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success' as 'success' | 'error'
  });

  // Modal state
  const [modal, setModal] = useState({
    isOpen: false,
    fileType: '',
    exportFunction: () => {},
    fileIcon: (<></>) as React.ReactElement
  });

  // Settings drawer state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const { getDeviceType } = useUserAgent();
  const deviceType = getDeviceType();
  const isIOS = deviceType === 'ios';

  // Update HTML content when markdown changes
  useEffect(() => {
    const result = marked.parse(markdown);
    if (typeof result === 'string') {
      setHtmlContent(result);
    }
  }, [markdown]);

  // Update the markdown content when language changes
  useEffect(() => {
    // Only update if the markdown content is equal to the translated description
    // This prevents overwriting user-entered content
    const currentDescription = t('description') as string;
    if (
      markdown ===
      t('description', { lng: i18n.language === 'en' ? 'zh' : 'en' })
    ) {
      setMarkdown(currentDescription);
    }
  }, [i18n.language, t, markdown]);

  // Toast helpers
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({
      isVisible: true,
      message,
      type
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  // Modal helpers
  const showExportModal = (
    fileType: string,
    exportFunction: () => void,
    fileIcon: React.ReactElement
  ) => {
    setModal({
      isOpen: true,
      fileType,
      exportFunction,
      fileIcon
    });
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const confirmExport = async () => {
    closeModal();
    try {
      modal.exportFunction();
      showToast(
        t('export.exportSuccess', {
          fileType: modal.fileType
        }),
        'success'
      );
    } catch (error) {
      console.error(`Failed to export ${modal.fileType}:`, error);
      showToast(
        t('export.exportFailed', { fileType: modal.fileType }),
        'error'
      );
    }
  };

  // Handle markdown input changes
  const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
  };

  // Paste clipboard content function
  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setMarkdown(clipboardText);
      showToast(t('toast.pasted'), 'success');
    } catch (error) {
      console.error('Failed to paste from clipboard:', error);
      showToast(t('toast.pasteError'), 'error');
    }
  };

  // Handel clear markdown textarea content
  const handleClear = () => {
    setMarkdown('');
    showToast(t('toast.contentCleared'), 'success');
  };

  // Toggle fullscreen preview
  const toggleFullscreen = () => {
    if (isFullscreen) {
      setIsAnimating(false);
      setTimeout(() => {
        setIsFullscreen(false);
      }, 300); // Match transition duration
    } else {
      setIsFullscreen(true);
      setTimeout(() => {
        setIsAnimating(true);
      }, 50);
    }
  };

  // Export functions
  const exportHTML = async () => {
    try {
      // Create blob with HTML content
      const blob = new Blob([htmlContent], { type: 'text/html' });

      if (isIOS && navigator.share) {
        // Use share API for iOS
        try {
          const file = new File([blob], 'exported.html', { type: 'text/html' });
          await navigator.share({
            files: [file],
            title: 'Export HTML'
          });
        } catch (shareError) {
          console.error('Error sharing HTML:', shareError);
          // Fallback to direct download if sharing fails
          downloadHtmlFile(blob);
        }
      } else {
        // Regular download for other platforms
        downloadHtmlFile(blob);
      }
    } catch (error) {
      console.error('Failed to export HTML:', error);
      alert('An error occurred while creating the HTML file.');
    }
  };

  // Helper function to handle the HTML download
  const downloadHtmlFile = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exported.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportDocx = async () => {
    try {
      // Convert to docx
      const doc = await markdownDocx(markdown);

      // Generate blob for download
      const blob = await Packer.toBlob(doc);

      if (isIOS && navigator.share) {
        // Use share API for iOS
        try {
          const file = new File([blob], 'exported.docx', {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          });

          await navigator.share({
            files: [file],
            title: 'Export DOCX'
          });
        } catch (shareError) {
          console.error('Error sharing DOCX:', shareError);
          // Fallback to direct download if sharing fails
          downloadDocxFile(blob);
        }
      } else {
        // Regular download for other platforms
        downloadDocxFile(blob);
      }
    } catch (error) {
      console.error('Failed to export DOCX:', error);
      alert('An error occurred while creating the DOCX file.');
    }
  };

  // Helper function to handle the DOCX download
  const downloadDocxFile = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exported.docx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportPDF = async () => {
    if (previewRef.current) {
      try {
        if (isIOS) {
          // iOS share method for PDF
          const options = {
            margin: 10,
            filename: 'exported.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
          };

          const pdf = await html2pdf()
            .from(previewRef.current)
            .set(options)
            .outputPdf();

          const blob = new Blob([pdf], { type: 'application/pdf' });

          // Use navigator.share API for iOS
          if (navigator.share) {
            try {
              await navigator.share({
                files: [
                  new File([blob], 'exported.pdf', {
                    type: 'application/pdf'
                  })
                ],
                title: 'Export PDF'
              });
            } catch (error) {
              console.error('Error sharing PDF:', error);
              // Fallback if share fails
              const url = URL.createObjectURL(blob);
              window.open(url, '_blank');
            }
          } else {
            // Fallback for older iOS versions
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
          }
        } else {
          // Regular PDF download for non-iOS
          const options = {
            margin: 10,
            filename: 'exported.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
          };

          await html2pdf().from(previewRef.current).set(options).save();
        }
      } catch (error) {
        console.error('Failed to export PDF:', error);
        alert('An error occurred while creating the PDF file.');
      }
    }
  };

  const exportImage = async () => {
    if (previewRef.current) {
      try {
        // Save original styles to restore later
        const originalOverflow = previewRef.current.style.overflow;
        const originalHeight = previewRef.current.style.height;
        const originalMaxHeight = previewRef.current.style.maxHeight;

        // Temporarily modify the styles to capture entire content
        previewRef.current.style.overflow = 'visible';
        previewRef.current.style.height = 'auto';
        previewRef.current.style.maxHeight = 'none';

        const canvas = await html2canvas(previewRef.current, {
          scale: 2,
          height: previewRef.current.scrollHeight,
          windowHeight: previewRef.current.scrollHeight,
          scrollY: 0,
          useCORS: true,
          allowTaint: true
        });

        // Restore original styles
        if (previewRef.current) {
          previewRef.current.style.overflow = originalOverflow;
          previewRef.current.style.height = originalHeight;
          previewRef.current.style.maxHeight = originalMaxHeight;
        }

        const img = canvas.toDataURL('image/png');

        if (isIOS) {
          // Convert data URL to blob for iOS sharing
          const blob = await (await fetch(img)).blob();

          if (navigator.share) {
            try {
              await navigator.share({
                files: [
                  new File([blob], 'exported.png', { type: 'image/png' })
                ],
                title: 'Export Image'
              });
            } catch (error) {
              console.error('Error sharing image:', error);
              // Fallback if share fails
              const a = document.createElement('a');
              a.href = img;
              a.download = 'exported.png';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }
          } else {
            // Fallback for older iOS versions
            const a = document.createElement('a');
            a.href = img;
            a.download = 'exported.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        } else {
          // Regular download for non-iOS
          const a = document.createElement('a');
          a.href = img;
          a.download = 'exported.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      } catch (error) {
        console.error('Failed to export image:', error);
        alert('An error occurred while creating the image file.');
      }
    }
  };

  const exportPlainText = async () => {
    try {
      // Create a temporary element to parse markdown to HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;

      // Extract text content (removes HTML tags)
      const plainText = tempDiv.textContent || tempDiv.innerText || '';

      // Copy to clipboard
      await navigator.clipboard.writeText(plainText);
      showToast(t('export.exportPlainTextSuccess'), 'success');
    } catch (error) {
      console.error('Error processing text:', error);
      showToast(t('export.exportPlainTextFailed'), 'error');
    }
  };

  // Handle export button clicks
  const handleExportHTML = () => {
    showExportModal(t('export.fileType.html'), exportHTML, <HtmlIcon />);
  };

  const handleExportDocx = () => {
    showExportModal(t('export.fileType.docx'), exportDocx, <DocIcon />);
  };

  const handleExportPDF = () => {
    showExportModal(t('export.fileType.pdf'), exportPDF, <PdfIcon />);
  };

  const handleExportImage = () => {
    showExportModal(t('export.fileType.png'), exportImage, <ImageIcon />);
  };

  return (
    <>
      <div className="app-container">
        <div className="app-header">
          <div className="app-logo">
            <h1># </h1>
            <h1 style={{ color: '#03a7dd' }}>MDC</h1>
            <h2>onverter</h2>
            <pre>{t('slogan')}</pre>
          </div>
          <div className="app-settings">
            <button onClick={toggleSettings}>
              <SettingsFillIcon />
            </button>
          </div>
        </div>
        <div className="app-body">
          <div className="app-content">
            <div className="markdown-area">
              <div className="markdown-area-actions">
                <button onClick={handlePaste}>
                  <PasteIcon />
                </button>
                <button onClick={handleClear}>
                  <CloseSquareIcon />
                </button>
              </div>
              <textarea
                value={markdown}
                onChange={handleMarkdownChange}
                placeholder={t('placeholder.markdownTextarea')}
                key={`textarea-${i18n.language}`} // Add a key that changes with language
              />
            </div>
            <div className="preview-area">
              <div className="preview-area-actions">
                <button onClick={handleExportHTML}>
                  <HtmlIcon />
                </button>
                <button onClick={handleExportDocx}>
                  <DocIcon />
                </button>
                <button onClick={handleExportPDF}>
                  <PdfIcon />
                </button>
                <button onClick={handleExportImage}>
                  <ImageIcon />
                </button>
                <button onClick={exportPlainText}>
                  <TextIcon />
                </button>
              </div>
              <div
                ref={previewRef}
                className="preview-content notion-theme"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
                onClick={toggleFullscreen}
              />
            </div>
          </div>
        </div>
      </div>

      {isFullscreen && (
        <div className={`fullscreen-overlay ${isAnimating ? 'visible' : ''}`}>
          <button
            className={`fullscreen-close ${isAnimating ? 'visible' : ''}`}
            onClick={toggleFullscreen}
          >
            <CloseIcon />
          </button>
          <div
            className={`fullscreen-content notion-theme ${
              isAnimating ? 'visible' : ''
            }`}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      )}

      {/* Toast component */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      {/* Export Modal component */}
      <ExportModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        onConfirm={confirmExport}
        fileType={modal.fileType}
        fileIcon={modal.fileIcon}
        title={t('modal.export.title', {
          fileType: modal.fileType
        })}
        description={t('modal.export.description', {
          fileType: modal.fileType.split(' ')[0]
        })}
      />

      {/* Settings Drawer component */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}

export default App;
