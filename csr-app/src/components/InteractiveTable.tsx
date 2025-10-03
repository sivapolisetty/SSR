import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Card, Subtitle, Text, Table, TableHeader, TableRow, TableHeaderCell, TableCell, Badge } from './styled/CommonComponents';
import { theme } from '../styles/theme';

const TableWrapper = styled(Card)`
  border: 3px solid ${theme.colors.primary};
  background-color: ${theme.colors.primaryLight};
  margin: ${theme.spacing.lg};
`;

const StatusSection = styled.div`
  background-color: ${theme.colors.primaryLight};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.md};
`;

const TableContainer = styled.div`
  background-color: ${theme.colors.surface};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.md};
`;

const StyledTableRow = styled(TableRow)<{ $isSelected: boolean }>`
  background-color: ${props => props.$isSelected ? theme.colors.accentLight : theme.colors.background};
  
  &:hover {
    background-color: ${props => props.$isSelected ? theme.colors.accentLight : theme.colors.surface};
  }
`;

const StockCell = styled(TableCell)<{ $stock: number }>`
  color: ${props => props.$stock > 10 ? theme.colors.secondary : props.$stock > 5 ? theme.colors.accent : theme.colors.error};
  font-weight: ${theme.typography.fontWeight.bold};
`;

const FooterNote = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textLight};
  font-style: italic;
  background-color: ${theme.colors.surface};
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
`;

const SelectedText = styled.span<{ $hasSelection: boolean }>`
  color: ${props => props.$hasSelection ? theme.colors.secondary : theme.colors.accent};
  font-weight: ${theme.typography.fontWeight.bold};
`;

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

interface InteractiveTableProps {
  data?: Product[];
  initialSelectedId?: number | null;
  onSelectionChange?: (id: number) => void;
  isSSR?: boolean;
}

const InteractiveTable: React.FC<InteractiveTableProps> = ({ 
  data = [], 
  initialSelectedId = null, 
  onSelectionChange = () => {}, 
  isSSR = false 
}) => {
  const [selectedId, setSelectedId] = useState<number | null>(initialSelectedId);

  useEffect(() => {
    if (onSelectionChange && selectedId !== null) {
      onSelectionChange(selectedId);
    }
  }, [selectedId, onSelectionChange]);

  const handleRowClick = (rowId: number) => {
    setSelectedId(rowId);
    
    if (typeof window !== 'undefined' && window.parent) {
      window.parent.postMessage({
        type: 'ROW_SELECTED',
        rowId: rowId,
        source: 'interactive-table',
        timestamp: Date.now()
      }, '*');
    }
    
    console.log('Row selected:', rowId);
  };

  return (
    <TableWrapper>
      <Subtitle color={theme.colors.primaryDark}>
        🔄 Interactive Product Table {isSSR ? '(SSR)' : '(CSR)'}
      </Subtitle>
      <Text size="md" weight="bold" color={theme.colors.primaryDark}>
        Generated at: {new Date().toISOString()}
      </Text>
      
      <StatusSection>
        <Text size="lg" weight="semibold" color={theme.colors.primaryDark}>
          Currently Selected: <SelectedText $hasSelection={!!selectedId}>
            {selectedId ? `Row ${selectedId} - ${data.find(item => item.id === selectedId)?.name || 'Unknown'}` : 'None'}
          </SelectedText>
        </Text>
        <Text size="sm">
          Click any row below to select it. State will sync with parent component!
        </Text>
      </StatusSection>
      
      <TableContainer>
        <Table>
          <TableHeader>
            <tr>
              <TableHeaderCell>ID</TableHeaderCell>
              <TableHeaderCell>Product</TableHeaderCell>
              <TableHeaderCell>Price</TableHeaderCell>
              <TableHeaderCell>Stock</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
            </tr>
          </TableHeader>
          <tbody>
            {data.map(item => (
              <StyledTableRow 
                key={item.id}
                onClick={() => handleRowClick(item.id)}
                clickable
                $isSelected={selectedId === item.id}
              >
                <TableCell>{item.id}</TableCell>
                <TableCell>
                  <Text weight="bold">{item.name}</Text>
                </TableCell>
                <TableCell>${item.price}</TableCell>
                <StockCell $stock={item.stock}>
                  {item.stock}
                </StockCell>
                <TableCell>
                  <Badge variant={item.stock > 5 ? 'success' : 'error'} size="sm">
                    {item.stock > 5 ? 'In Stock' : 'Low Stock'}
                  </Badge>
                </TableCell>
              </StyledTableRow>
            ))}
          </tbody>
        </Table>
      </TableContainer>
      
      <FooterNote>
        ✨ <strong>{isSSR ? 'SSR' : 'CSR'} Component:</strong> This is a proper React component 
        {isSSR ? ' that can be server-side rendered and then hydrated' : ' rendered entirely on the client side'}.
        Selection state: <strong>{selectedId || 'None'}</strong>
      </FooterNote>
    </TableWrapper>
  );
};

export default InteractiveTable;