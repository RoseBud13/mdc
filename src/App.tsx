import { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';
import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';
import './App.css';

function App() {
  const [markdown, setMarkdown] = useState('# Hello\n\nThis is **markdown**.');
  const [htmlContent, setHtmlContent] = useState<string>('');
  const previewRef = useRef<HTMLDivElement>(null);

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
      const options = {
        margin: 10,
        filename: 'exported.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      html2pdf().from(previewRef.current).set(options).save();
    }
  };

  const exportImage = () => {
    if (previewRef.current) {
      html2canvas(previewRef.current, { scale: 2 }).then(canvas => {
        const img = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = img;
        a.download = 'exported.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
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
          <pre> markdown to everything</pre>
        </div>
        <div className="app-body">
          <div className="export-buttons">
            <button onClick={exportHTML}>Export HTML</button>
            <button onClick={exportPDF}>Export PDF</button>
            <button onClick={exportImage}>Export Image</button>
          </div>
          <div className="app-content">
            <div className="markdown-area">
              <textarea
                value={markdown}
                onChange={handleMarkdownChange}
                placeholder="Write your markdown here..."
              />
            </div>
            <div className="preview-area">
              <div
                ref={previewRef}
                className="preview-content"
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
