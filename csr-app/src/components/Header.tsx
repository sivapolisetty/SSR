import React from 'react';

const Header: React.FC = () => {
  return (
    <header style={{
      backgroundColor: '#1f2937',
      color: 'white',
      padding: '1rem 2rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
          CSR App with SSR Components
        </h1>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <a href="#home" style={{ color: 'white', textDecoration: 'none' }}>Home</a>
          <a href="#products" style={{ color: 'white', textDecoration: 'none' }}>Products</a>
          <a href="#users" style={{ color: 'white', textDecoration: 'none' }}>Users</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;