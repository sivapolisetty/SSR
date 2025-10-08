import React, { useState } from 'react';
import { 
  Container, 
  FlexContainer, 
  GridContainer,
  Card, 
  Button, 
  Title, 
  Subtitle, 
  Text, 
  Badge,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableCell,
  Spinner
} from './styled/CommonComponents';

const StyledComponentsExample: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<'default' | 'outlined' | 'elevated'>('default');

  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const sampleData = [
    { id: 1, name: 'Product A', price: 29.99, category: 'Electronics' },
    { id: 2, name: 'Product B', price: 49.99, category: 'Clothing' },
    { id: 3, name: 'Product C', price: 19.99, category: 'Books' },
  ];

  return (
    <Container>
      <Title size="lg" align="center">Styled Components Library Demo</Title>
      <Text size="lg" align="center" color="#666">
        Showcasing reusable styled components with consistent theming
      </Text>

      {/* Button Variants */}
      <Card variant="outlined" padding="2rem">
        <Subtitle>Button Variants</Subtitle>
        <FlexContainer gap="1rem" wrap>
          <Button variant="primary" onClick={handleLoadingDemo}>
            {isLoading ? <Spinner size="16px" color="white" /> : 'Primary'}
          </Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="secondary">Secondary Alt</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="lg">Large</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </FlexContainer>
      </Card>

      {/* Card Variants */}
      <Card variant="outlined" padding="2rem">
        <Subtitle>Card Variants</Subtitle>
        <FlexContainer direction="column" gap="1rem">
          <FlexContainer gap="0.5rem" align="center">
            <Text>Selected variant:</Text>
            <Button 
              variant={selectedVariant === 'default' ? 'primary' : 'ghost'} 
              size="sm"
              onClick={() => setSelectedVariant('default')}
            >
              Default
            </Button>
            <Button 
              variant={selectedVariant === 'outlined' ? 'primary' : 'ghost'} 
              size="sm"
              onClick={() => setSelectedVariant('outlined')}
            >
              Outlined
            </Button>
            <Button 
              variant={selectedVariant === 'elevated' ? 'primary' : 'ghost'} 
              size="sm"
              onClick={() => setSelectedVariant('elevated')}
            >
              Elevated
            </Button>
          </FlexContainer>
          
          <GridContainer columns="repeat(3, 1fr)" gap="1rem">
            <Card variant={selectedVariant}>
              <Subtitle size="sm">Card Title</Subtitle>
              <Text>This is a sample card with {selectedVariant} variant.</Text>
            </Card>
            <Card variant={selectedVariant}>
              <Subtitle size="sm">Another Card</Subtitle>
              <Text>Cards adapt to the selected variant automatically.</Text>
            </Card>
            <Card variant={selectedVariant}>
              <Subtitle size="sm">Third Card</Subtitle>
              <Text>Consistent styling across all components.</Text>
            </Card>
          </GridContainer>
        </FlexContainer>
      </Card>

      {/* Typography Showcase */}
      <Card variant="elevated" padding="2rem">
        <Subtitle>Typography System</Subtitle>
        <FlexContainer direction="column" gap="1rem">
          <Title size="xl">Extra Large Title</Title>
          <Title size="lg">Large Title</Title>
          <Title size="md">Medium Title (Default)</Title>
          <Title size="sm">Small Title</Title>
          
          <Subtitle size="lg">Large Subtitle</Subtitle>
          <Subtitle size="md">Medium Subtitle (Default)</Subtitle>
          <Subtitle size="sm">Small Subtitle</Subtitle>
          
          <Text size="lg">Large body text</Text>
          <Text size="md">Medium body text (Default)</Text>
          <Text size="sm">Small body text</Text>
          <Text size="xs">Extra small body text</Text>
          
          <Text weight="bold">Bold text</Text>
          <Text weight="semibold">Semibold text</Text>
          <Text weight="medium">Medium weight text</Text>
          <Text weight="normal">Normal weight text</Text>
        </FlexContainer>
      </Card>

      {/* Badge Examples */}
      <Card variant="outlined" padding="2rem">
        <Subtitle>Status Badges</Subtitle>
        <FlexContainer gap="1rem" wrap>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
          <Badge variant="info">Info</Badge>
        </FlexContainer>
        
        <Text size="sm" color="#666">Different sizes:</Text>
        <FlexContainer gap="1rem" align="center">
          <Badge variant="primary" size="sm">Small</Badge>
          <Badge variant="primary" size="md">Medium</Badge>
          <Badge variant="primary" size="lg">Large</Badge>
        </FlexContainer>
      </Card>

      {/* Table Example */}
      <Card variant="elevated" padding="2rem">
        <Subtitle>Styled Table</Subtitle>
        <Table>
          <TableHeader>
            <tr>
              <TableHeaderCell>ID</TableHeaderCell>
              <TableHeaderCell>Product</TableHeaderCell>
              <TableHeaderCell align="right">Price</TableHeaderCell>
              <TableHeaderCell>Category</TableHeaderCell>
            </tr>
          </TableHeader>
          <tbody>
            {sampleData.map(item => (
              <TableRow key={item.id} clickable>
                <TableCell>{item.id}</TableCell>
                <TableCell>
                  <Text weight="bold">{item.name}</Text>
                </TableCell>
                <TableCell align="right">${item.price}</TableCell>
                <TableCell>
                  <Badge variant="secondary" size="sm">{item.category}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </Card>

      {/* Layout Examples */}
      <Card variant="outlined" padding="2rem">
        <Subtitle>Layout Components</Subtitle>
        
        <Text weight="semibold">Flex Layout:</Text>
        <FlexContainer justify="space-between" align="center" gap="1rem">
          <Badge variant="info">Left</Badge>
          <Badge variant="warning">Center</Badge>
          <Badge variant="success">Right</Badge>
        </FlexContainer>
        
        <Text weight="semibold">Grid Layout:</Text>
        <GridContainer columns="repeat(4, 1fr)" gap="0.5rem">
          <Badge variant="primary">1</Badge>
          <Badge variant="secondary">2</Badge>
          <Badge variant="warning">3</Badge>
          <Badge variant="info">4</Badge>
        </GridContainer>
      </Card>
    </Container>
  );
};

export default StyledComponentsExample;