import React from 'react';

const ProductCard = ({ productId = 1 }) => {
  // Static server-side rendered data with deterministic pricing
  const product = {
    id: productId,
    name: `Product ${productId}`,
    price: 20 + (productId * 5), // Deterministic price based on productId
    description: 'This is a server-side rendered product card component',
    image: `https://picsum.photos/200/150?random=${productId}`
  };

  return (
    <div className="product-card" style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '20px',
      margin: '10px',
      background: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      maxWidth: '300px'
    }}>
      <img 
        src={product.image} 
        alt={product.name}
        style={{
          width: '100%',
          height: '150px',
          objectFit: 'cover',
          borderRadius: '4px',
          marginBottom: '10px'
        }}
      />
      <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{product.name}</h3>
      <p style={{ color: '#666', fontSize: '14px', margin: '0 0 10px 0' }}>
        {product.description}
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#2563eb' }}>
          ${product.price}
        </span>
        <button style={{
          background: '#2563eb',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Add to Cart
        </button>
      </div>
      <small style={{ color: '#888', fontSize: '12px', marginTop: '10px', display: 'block' }}>
        🟢 SSR Component
      </small>
    </div>
  );
};

export default ProductCard;