import React from 'react';

// Static component for SSR
const ShoppingCartSSR = ({ 
  hydrationStrategy = 'priority',
  priority = 'high',
  initialItems = [] 
}) => {
  // Default cart state for SSR
  const cartState = { 
    items: initialItems.length > 0 ? initialItems : [
      { id: 1, name: 'Wireless Headphones', price: 99.99, image: '🎧', quantity: 1 }
    ]
  };

  const isOpen = false;
  const isHydrated = false;

  // Sample products
  const sampleProducts = [
    { id: 1, name: 'Wireless Headphones', price: 99.99, image: '🎧' },
    { id: 2, name: 'Smart Watch', price: 199.99, image: '⌚' },
    { id: 3, name: 'Laptop Stand', price: 49.99, image: '💻' },
    { id: 4, name: 'Coffee Mug', price: 12.99, image: '☕' },
    { id: 5, name: 'Phone Case', price: 24.99, image: '📱' }
  ];

  const getTotalItems = () => {
    return cartState.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartState.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <div style={{
      border: '2px solid #9c27b0',
      borderRadius: '8px',
      padding: '20px',
      margin: '20px',
      backgroundColor: '#f8f9fa',
      position: 'relative'
    }}>
      {/* Island Status Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px',
        padding: '10px',
        backgroundColor: isHydrated ? '#e8f5e9' : '#fff3e0',
        borderRadius: '5px',
        border: `2px solid ${isHydrated ? '#4caf50' : '#ff9800'}`
      }}>
        <h3 style={{ margin: 0, color: '#9c27b0' }}>
          🏝️ Shopping Cart Island
        </h3>
        <div style={{
          fontSize: '12px',
          color: isHydrated ? '#2e7d32' : '#ef6c00',
          fontWeight: 'bold'
        }}>
          {isHydrated ? '✅ HYDRATED' : '⏳ HYDRATING...'}
          <br />
          Strategy: {hydrationStrategy} | Priority: {priority}
        </div>
      </div>

      {/* Cart Summary */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '15px',
          backgroundColor: 'white',
          borderRadius: '6px',
          cursor: 'default',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '15px',
          border: '1px solid #e0e0e0'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '24px', marginRight: '10px' }}>🛒</span>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
              {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''}
            </div>
            <div style={{ color: '#666', fontSize: '14px' }}>
              Total: ${getTotalPrice().toFixed(2)}
            </div>
          </div>
        </div>
        <div style={{ 
          fontSize: '12px', 
          color: '#9c27b0',
          fontWeight: 'bold'
        }}>
          {isOpen ? '🔽 Hide' : '🔼 Show'} Cart
        </div>
      </div>

      {/* Cart Items (Expanded) */}
      {isOpen && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '6px',
          padding: '15px',
          marginBottom: '15px',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px',
            borderBottom: '1px solid #eee',
            paddingBottom: '10px'
          }}>
            <h4 style={{ margin: 0, color: '#333' }}>Cart Items</h4>
            {cartState.items.length > 0 && (
              <button
                style={{
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'default'
                }}
              >
                Clear All
              </button>
            )}
          </div>

          {cartState.items.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: '#666',
              padding: '20px',
              fontStyle: 'italic'
            }}>
              Your cart is empty
            </div>
          ) : (
            cartState.items.map(item => (
              <div key={item.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: '1px solid #f0f0f0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: '20px', marginRight: '10px' }}>
                    {item.image}
                  </span>
                  <div>
                    <div style={{ fontWeight: '500', fontSize: '14px' }}>
                      {item.name}
                    </div>
                    <div style={{ color: '#666', fontSize: '12px' }}>
                      ${item.price} each
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <button
                      style={{
                        background: '#ddd',
                        border: 'none',
                        borderRadius: '3px',
                        width: '25px',
                        height: '25px',
                        cursor: 'default',
                        fontSize: '14px'
                      }}
                    >
                      -
                    </button>
                    <span style={{ 
                      minWidth: '30px', 
                      textAlign: 'center',
                      fontWeight: 'bold'
                    }}>
                      {item.quantity}
                    </span>
                    <button
                      style={{
                        background: '#ddd',
                        border: 'none',
                        borderRadius: '3px',
                        width: '25px',
                        height: '25px',
                        cursor: 'default',
                        fontSize: '14px'
                      }}
                    >
                      +
                    </button>
                  </div>
                  
                  <div style={{ 
                    fontWeight: 'bold',
                    minWidth: '60px',
                    textAlign: 'right'
                  }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                  
                  <button
                    style={{
                      background: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      width: '25px',
                      height: '25px',
                      cursor: 'default',
                      fontSize: '12px'
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Product Suggestions */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '6px',
        padding: '15px',
        border: '1px solid #e0e0e0'
      }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>
          🛍️ Add Products
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '10px'
        }}>
          {sampleProducts.map(product => (
            <div
              key={product.id}
              style={{
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                textAlign: 'center',
                cursor: 'default',
                transition: 'transform 0.2s',
                backgroundColor: '#fafafa'
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '5px' }}>
                {product.image}
              </div>
              <div style={{ 
                fontSize: '12px', 
                fontWeight: '500',
                marginBottom: '3px'
              }}>
                {product.name}
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#9c27b0',
                fontWeight: 'bold'
              }}>
                ${product.price}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Island Performance Info */}
      <div style={{
        marginTop: '15px',
        padding: '10px',
        backgroundColor: '#e3f2fd',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#1976d2'
      }}>
        <strong>🚀 Island State:</strong> Complex state management with useReducer. 
        Hydration: {hydrationStrategy} | Priority: {priority} | 
        Cart Items: {getTotalItems()} | Total: ${getTotalPrice().toFixed(2)}
      </div>

      <style>
        {`
          @keyframes bounce {
            0%, 20%, 60%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-10px);
            }
            80% {
              transform: translateY(-5px);
            }
          }
        `}
      </style>
    </div>
  );
};

// Main component that decides which version to use
const ShoppingCart = (props) => {
  // For SSR, always use the SSR component
  if (typeof window === 'undefined') {
    return <ShoppingCartSSR {...props} />;
  }
  
  // On client, use the SSR component initially
  return <ShoppingCartSSR {...props} />;
};

export default ShoppingCart;