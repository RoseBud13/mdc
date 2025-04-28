import { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';
import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';
import './App.css';
import { useUserAgent } from './utils/browser';
import PasteIcon from './assets/icon/paste-icon';
import CloseIcon from './assets/icon/close-square-icon';

function App() {
  const [markdown, setMarkdown] = useState(
    '# Hi there 🔥\n\nThis is **MDC**, a simple markdown converter for making your AIGC content easier to share.🚀'
  );
  const [htmlContent, setHtmlContent] = useState<string>('');
  const previewRef = useRef<HTMLDivElement>(null);

  const { getDeviceType } = useUserAgent();
  const deviceType = getDeviceType();
  const isIOS = deviceType === 'ios';
  const isPC = deviceType === 'PC';

  // Update HTML content when markdown changes
  useEffect(() => {
    const result = marked.parse(markdown);
    if (typeof result === 'string') {
      setHtmlContent(result);
    }
  }, [markdown]);

  // Handle markdown input changes
  const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
  };

  // Paste clipboard content function
  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setMarkdown(clipboardText);
    } catch (error) {
      console.error('Failed to paste from clipboard:', error);
      alert(
        'Unable to access clipboard. Please check your browser permissions.'
      );
    }
  };

  // Handel clear markdown textarea content
  const handleClear = () => {
    setMarkdown('');
  };

  // Export functions
  const exportHTML = () => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exported.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    if (previewRef.current) {
      if (isIOS) {
        // iOS share method for PDF
        const options = {
          margin: 10,
          filename: 'exported.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf()
          .from(previewRef.current)
          .set(options)
          .outputPdf()
          .then((pdf: Uint8Array | ArrayBuffer) => {
            const blob = new Blob([pdf], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            // Use navigator.share API for iOS
            if (navigator.share) {
              navigator
                .share({
                  files: [
                    new File([blob], 'exported.pdf', {
                      type: 'application/pdf'
                    })
                  ],
                  title: 'Export PDF'
                })
                .catch(error => {
                  console.error('Error sharing PDF:', error);
                  // Fallback if share fails
                  window.open(url, '_blank');
                });
            } else {
              // Fallback for older iOS versions
              window.open(url, '_blank');
            }
          });
      } else {
        // Regular PDF download for non-iOS
        const options = {
          margin: 10,
          filename: 'exported.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().from(previewRef.current).set(options).save();
      }
    }
  };

  const exportImage = () => {
    if (previewRef.current) {
      html2canvas(previewRef.current, { scale: 2 }).then(canvas => {
        const img = canvas.toDataURL('image/png');

        if (isIOS) {
          // Convert data URL to blob for iOS sharing
          fetch(img)
            .then(res => res.blob())
            .then(blob => {
              if (navigator.share) {
                navigator
                  .share({
                    files: [
                      new File([blob], 'exported.png', { type: 'image/png' })
                    ],
                    title: 'Export Image'
                  })
                  .catch(error => {
                    console.error('Error sharing image:', error);
                    // Fallback if share fails
                    const a = document.createElement('a');
                    a.href = img;
                    a.download = 'exported.png';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  });
              } else {
                // Fallback for older iOS versions
                const a = document.createElement('a');
                a.href = img;
                a.download = 'exported.png';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }
            });
        } else {
          // Regular download for non-iOS
          const a = document.createElement('a');
          a.href = img;
          a.download = 'exported.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      });
    }
  };

  return (
    <>
      <div className="app-container">
        <div className="app-header">
          <h1># </h1>
          <h1 style={{ color: '#03a7dd' }}>MDC</h1>
          <h2>onverter</h2>
          <pre> mark'em down to earth</pre>
        </div>
        <div className="app-body">
          <div className="app-content">
            <div className="markdown-area">
              <div className="markdown-area-actions">
                <button onClick={handlePaste}>
                  <PasteIcon />
                </button>
                <button onClick={handleClear}>
                  <CloseIcon />
                </button>
              </div>
              <textarea
                value={markdown}
                onChange={handleMarkdownChange}
                placeholder="Write your markdown here..."
              />
            </div>
            <div className="preview-area">
              <div className="preview-area-actions">
                {isPC && <button onClick={exportHTML}>HTML</button>}
                <button onClick={exportPDF}>PDF</button>
                <button onClick={exportImage}>Image</button>
              </div>
              <div
                ref={previewRef}
                className="preview-content notion-theme"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
