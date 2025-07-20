function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Iris - Bitcoin Payment System</h1>
      <p>Welcome to Iris! Generate QR codes for Bitcoin payments.</p>
      
      <div style={{ marginTop: '20px' }}>
        <button style={{ 
          padding: '10px 20px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer'
        }}>
          Get Started
        </button>
      </div>
    </div>
  );
}

export default App;