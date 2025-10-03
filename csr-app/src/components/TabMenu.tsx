import React, { useState } from 'react';

interface TabMenuProps {
  onTabChange: (tab: string) => void;
}

const TabMenu: React.FC<TabMenuProps> = ({ onTabChange }) => {
  const [activeTab, setActiveTab] = useState('csr-demo');

  const tabs = [
    { id: 'csr-demo', label: '🔴 CSR Demo' },
    { id: 'ssr-html', label: '🟢 SSR HTML in CSR' },
    { id: 'hydrated', label: '🔄 SSR + Hydration (OLD)' },
    { id: 'proper-hydration', label: '⚡ Proper React Hydration' },
    { id: 'products', label: 'SSR Products' },
    { id: 'users', label: 'SSR User Profiles' },
    { id: 'mixed', label: 'Mixed Components' }
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange(tabId);
  };

  return (
    <div style={{
      borderBottom: '2px solid #e5e7eb',
      backgroundColor: 'white'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            style={{
              padding: '1rem 2rem',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              borderBottom: activeTab === tab.id ? '3px solid #2563eb' : '3px solid transparent',
              color: activeTab === tab.id ? '#2563eb' : '#6b7280',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              fontSize: '1rem'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabMenu;