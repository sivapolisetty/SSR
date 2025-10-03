import React from 'react';
import styled from 'styled-components';
import { Container, FlexContainer, Title } from './styled/CommonComponents';

const HeaderWrapper = styled.header`
  background-color: #1f2937;
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Nav = styled.nav`
  display: flex;
  gap: 1rem;
`;

const NavLink = styled.a`
  color: white;
  text-decoration: none;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 0.8;
  }
`;

const Header: React.FC = () => {
  return (
    <HeaderWrapper>
      <Container maxWidth="1200px" padding="0">
        <FlexContainer justify="space-between" align="center">
          <Title size="sm" color="white">
            CSR App with SSR Components
          </Title>
          <Nav>
            <NavLink href="#home">Home</NavLink>
            <NavLink href="#products">Products</NavLink>
            <NavLink href="#users">Users</NavLink>
          </Nav>
        </FlexContainer>
      </Container>
    </HeaderWrapper>
  );
};

export default Header;