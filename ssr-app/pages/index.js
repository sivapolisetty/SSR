import ProductCard from '../src/components/ProductCard';
import UserProfile from '../src/components/UserProfile';

export default function Home() {
  return (
    <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
        SSR App - Federated Components
      </h1>
      
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        justifyContent: 'center',
        marginBottom: '30px'
      }}>
        <a 
          href="/ssr-demo" 
          style={{ 
            padding: '10px 20px',
            backgroundColor: '#4caf50',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
            fontWeight: 'bold'
          }}
        >
          🟢 SSR Demo - View Pre-rendered HTML
        </a>
        <a 
          href="http://localhost:3003" 
          target="_blank"
          style={{ 
            padding: '10px 20px',
            backgroundColor: '#f44336',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
            fontWeight: 'bold'
          }}
        >
          🔴 CSR Demo - JavaScript Rendering (Port 3003)
        </a>
      </div>
      
      <div style={{ marginBottom: '30px' }}>
        <h2>Product Cards (SSR Components)</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          <ProductCard productId={1} />
          <ProductCard productId={2} />
        </div>
      </div>

      <div>
        <h2>User Profiles (SSR Components)</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          <UserProfile userId={1} />
          <UserProfile userId={2} />
        </div>
      </div>

      <div style={{ 
        marginTop: '40px', 
        padding: '20px', 
        background: '#f0f9ff', 
        borderRadius: '8px',
        border: '1px solid #0ea5e9'
      }}>
        <h3>Module Federation Info</h3>
        <p>This Next.js app exposes the following federated components:</p>
        <ul>
          <li><code>./ProductCard</code> - Server-rendered product component</li>
          <li><code>./UserProfile</code> - Server-rendered user profile component</li>
        </ul>
        <p>These components can be imported by the CSR app while maintaining SSR benefits!</p>
      </div>
    </main>
  );
}