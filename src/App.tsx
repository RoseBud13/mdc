import './App.css';

function App() {
  return (
    <>
      <div className="app-container">
        <div className="app-header">
          <h1># </h1>
          <h1 style={{ color: '#03a7dd' }}>MDC</h1>
          <h2>onverter</h2>
          <pre> markdown to everything</pre>
        </div>
        <div className="app-content">
          <div className="markdown-area"></div>
          <div className="preview-area"></div>
        </div>
      </div>
    </>
  );
}

export default App;
