import React, { useState } from 'react';
import styled from 'styled-components';
import { Container, FlexContainer } from './styled/CommonComponents';
import { theme } from '../styles/theme';

const TabWrapper = styled.div`
  border-bottom: 2px solid ${theme.colors.border};
  background-color: ${theme.colors.background};
`;

const TabButton = styled.button<{ $isActive: boolean }>`
  padding: 1rem 2rem;
  border: none;
  background-color: transparent;
  cursor: pointer;
  border-bottom: 3px solid ${props => props.$isActive ? theme.colors.primary : 'transparent'};
  color: ${props => props.$isActive ? theme.colors.primary : theme.colors.textLight};
  font-weight: ${props => props.$isActive ? theme.typography.fontWeight.bold : theme.typography.fontWeight.normal};
  font-size: ${theme.typography.fontSize.md};
  transition: ${theme.transitions.fast};
  
  &:hover {
    color: ${theme.colors.primary};
    background-color: ${theme.colors.surface};
  }
`;

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
    { id: 'styled-components', label: '🎨 Styled Components' },
    { id: 'products', label: 'SSR Products' },
    { id: 'users', label: 'SSR User Profiles' },
    { id: 'mixed', label: 'Mixed Components' }
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange(tabId);
  };

  return (
    <TabWrapper>
      <Container maxWidth="1200px" padding="0">
        <FlexContainer gap="0">
          {tabs.map(tab => (
            <TabButton
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              $isActive={activeTab === tab.id}
            >
              {tab.label}
            </TabButton>
          ))}
        </FlexContainer>
      </Container>
    </TabWrapper>
  );
};

export default TabMenu;