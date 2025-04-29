import { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';
import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';
import markdownDocx, { Packer } from 'markdown-docx';
import './App.css';
import { useUserAgent } from './utils/browser';
import PasteIcon from './assets/icon/paste-icon';
import CloseSquareIcon from './assets/icon/close-square-icon';
import CloseIcon from './assets/icon/close-icon';
import ImageIcon from './assets/icon/image-icon';
import PdfIcon from './assets/icon/pdf-icon';
import HtmlIcon from './assets/icon/code-icon';
import SettingsFillIcon from './assets/icon/settings-fill-icon';
import TextIcon from './assets/icon/text-icon';
import DocIcon from './assets/icon/doc-icon';

function App() {
  const [markdown, setMarkdown] = useState(
    '# Hi there 🔥\n\nThis is **MDC**, a simple markdown converter for making your AIGC content easier to share.🚀'
  );
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

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
      // Show processing indicator
      const button = document.querySelector(
        'button:has(HtmlIcon)'
      ) as HTMLButtonElement;
      if (button) {
        button.style.opacity = '0.7';
        button.disabled = true;
      }

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
    } finally {
      // Reset button state
      const button = document.querySelector(
        'button:has(HtmlIcon)'
      ) as HTMLButtonElement;
      if (button) {
        button.style.opacity = '1';
        button.disabled = false;
      }
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

    // Visual feedback
    const button = document.querySelector(
      'button:has(HtmlIcon)'
    ) as HTMLElement;
    if (button) {
      const originalBg = button.style.backgroundColor;
      button.style.backgroundColor = '#4caf50';
      setTimeout(() => {
        button.style.backgroundColor = originalBg;
      }, 500);
    }
  };

  const exportDocx = async () => {
    try {
      // Show processing indicator
      const button = document.querySelector(
        'button:has(DocIcon)'
      ) as HTMLButtonElement;
      if (button) {
        button.style.opacity = '0.7';
        button.disabled = true;
      }

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
    } finally {
      // Reset button state
      const button = document.querySelector(
        'button:has(DocIcon)'
      ) as HTMLButtonElement;
      if (button) {
        button.style.opacity = '1';
        button.disabled = false;
      }
    }
  };

  // Helper function to handle the download
  const downloadDocxFile = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exported.docx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Visual feedback
    const button = document.querySelector('button:has(DocIcon)') as HTMLElement;
    if (button) {
      const originalBg = button.style.backgroundColor;
      button.style.backgroundColor = '#4caf50';
      setTimeout(() => {
        button.style.backgroundColor = originalBg;
      }, 500);
    }
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
      // Save original styles to restore later
      const originalOverflow = previewRef.current.style.overflow;
      const originalHeight = previewRef.current.style.height;
      const originalMaxHeight = previewRef.current.style.maxHeight;

      // Temporarily modify the styles to capture entire content
      previewRef.current.style.overflow = 'visible';
      previewRef.current.style.height = 'auto';
      previewRef.current.style.maxHeight = 'none';

      html2canvas(previewRef.current, {
        scale: 2,
        height: previewRef.current.scrollHeight,
        windowHeight: previewRef.current.scrollHeight,
        scrollY: 0,
        useCORS: true,
        allowTaint: true
      }).then(canvas => {
        // Restore original styles
        if (previewRef.current) {
          previewRef.current.style.overflow = originalOverflow;
          previewRef.current.style.height = originalHeight;
          previewRef.current.style.maxHeight = originalMaxHeight;
        }

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

  const exportPlainText = () => {
    try {
      // Create a temporary element to parse markdown to HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;

      // Extract text content (removes HTML tags)
      const plainText = tempDiv.textContent || tempDiv.innerText || '';

      // Copy to clipboard
      navigator.clipboard
        .writeText(plainText)
        .then(() => {
          // Optional: show success feedback
          const button = document.querySelector(
            'button:has(TextIcon)'
          ) as HTMLElement;
          if (button) {
            const originalBg = button.style.backgroundColor;
            button.style.backgroundColor = '#4caf50';
            setTimeout(() => {
              button.style.backgroundColor = originalBg;
            }, 500);
          }
        })
        .catch(err => {
          console.error('Failed to copy text to clipboard:', err);
          alert(
            'Unable to copy to clipboard. Please check browser permissions.'
          );
        });
    } catch (error) {
      console.error('Error processing text:', error);
      alert('An error occurred while processing the text.');
    }
  };

  return (
    <>
      <div className="app-container">
        <div className="app-header">
          <div className="app-logo">
            <h1># </h1>
            <h1 style={{ color: '#03a7dd' }}>MDC</h1>
            <h2>onverter</h2>
            <pre> mark'em down to earth</pre>
          </div>
          <div className="app-settings">
            <button>
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
                placeholder="Write your markdown here..."
              />
            </div>
            <div className="preview-area">
              <div className="preview-area-actions">
                <button onClick={exportHTML}>
                  <HtmlIcon />
                </button>
                <button onClick={exportDocx}>
                  <DocIcon />
                </button>
                <button onClick={exportPDF}>
                  <PdfIcon />
                </button>
                <button onClick={exportImage}>
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
    </>
  );
}

export default App;
