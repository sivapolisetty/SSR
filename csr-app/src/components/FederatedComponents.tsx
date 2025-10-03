import React, { Suspense } from 'react';

// Lazy load federated components
const FederatedProductCard = React.lazy(() => import('ssr_app/ProductCard'));
const FederatedUserProfile = React.lazy(() => import('ssr_app/UserProfile'));

interface ProductsSectionProps {
  visible: boolean;
}

interface UsersSectionProps {
  visible: boolean;
}

interface MixedSectionProps {
  visible: boolean;
}

const LoadingComponent = ({ message }: { message: string }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    margin: '10px'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '1.2em', marginBottom: '0.5rem' }}>🔄</div>
      <p>{message}</p>
    </div>
  </div>
);

export const ProductsSection: React.FC<ProductsSectionProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <div>
      <h2 style={{ margin: '2rem 0 1rem 0' }}>SSR Product Cards (Federated)</h2>
      <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
        These components are loaded from the Next.js SSR app via Module Federation
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        <Suspense fallback={<LoadingComponent message="Loading SSR Product Card 1..." />}>
          <FederatedProductCard productId={1} />
        </Suspense>
        <Suspense fallback={<LoadingComponent message="Loading SSR Product Card 2..." />}>
          <FederatedProductCard productId={2} />
        </Suspense>
        <Suspense fallback={<LoadingComponent message="Loading SSR Product Card 3..." />}>
          <FederatedProductCard productId={3} />
        </Suspense>
      </div>
    </div>
  );
};

export const UsersSection: React.FC<UsersSectionProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <div>
      <h2 style={{ margin: '2rem 0 1rem 0' }}>SSR User Profiles (Federated)</h2>
      <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
        These components are loaded from the Next.js SSR app via Module Federation
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        <Suspense fallback={<LoadingComponent message="Loading SSR User Profile 1..." />}>
          <FederatedUserProfile userId={1} />
        </Suspense>
        <Suspense fallback={<LoadingComponent message="Loading SSR User Profile 2..." />}>
          <FederatedUserProfile userId={2} />
        </Suspense>
      </div>
    </div>
  );
};

export const MixedSection: React.FC<MixedSectionProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <div>
      <h2 style={{ margin: '2rem 0 1rem 0' }}>Mixed SSR + CSR Components</h2>
      <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
        Combining federated SSR components with local CSR components
      </p>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '20px' 
      }}>
        <div>
          <h3>CSR Component</h3>
          <div style={{
            padding: '20px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: '#fef3c7'
          }}>
            <p>This is a local CSR component rendered client-side only.</p>
            <p>🟡 Client Side Rendered</p>
            <p>Interactive: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
        
        <Suspense fallback={<LoadingComponent message="Loading SSR Product..." />}>
          <div>
            <h3>SSR Component (Federated)</h3>
            <FederatedProductCard productId={4} />
          </div>
        </Suspense>
        
        <Suspense fallback={<LoadingComponent message="Loading SSR User..." />}>
          <div>
            <h3>SSR Component (Federated)</h3>
            <FederatedUserProfile userId={3} />
          </div>
        </Suspense>
      </div>
    </div>
  );
};