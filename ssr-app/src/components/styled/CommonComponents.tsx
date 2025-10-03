import styled, { css } from 'styled-components';
import { theme } from '../../styles/theme';

// Container Components
export const Container = styled.div<{ maxWidth?: string; padding?: string }>`
  max-width: ${props => props.maxWidth || theme.breakpoints.wide};
  margin: 0 auto;
  padding: ${props => props.padding || theme.spacing.md};
`;

export const FlexContainer = styled.div<{
  direction?: 'row' | 'column';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  gap?: string;
  wrap?: boolean;
}>`
  display: flex;
  flex-direction: ${props => props.direction || 'row'};
  justify-content: ${props => props.justify || 'flex-start'};
  align-items: ${props => props.align || 'stretch'};
  gap: ${props => props.gap || theme.spacing.md};
  ${props => props.wrap && css`flex-wrap: wrap;`}
`;

export const GridContainer = styled.div<{
  columns?: string;
  gap?: string;
  minItemWidth?: string;
}>`
  display: grid;
  grid-template-columns: ${props => 
    props.columns || `repeat(auto-fit, minmax(${props.minItemWidth || '300px'}, 1fr))`
  };
  gap: ${props => props.gap || theme.spacing.md};
`;

// Card Components
export const Card = styled.div<{
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: string;
  borderRadius?: string;
}>`
  background: ${theme.colors.background};
  border-radius: ${props => props.borderRadius || theme.borderRadius.md};
  padding: ${props => props.padding || theme.spacing.lg};
  transition: ${theme.transitions.normal};

  ${props => props.variant === 'outlined' && css`
    border: 1px solid ${theme.colors.border};
  `}

  ${props => props.variant === 'elevated' && css`
    box-shadow: ${theme.shadows.md};
    
    &:hover {
      box-shadow: ${theme.shadows.lg};
      transform: translateY(-2px);
    }
  `}

  ${props => props.variant === 'default' && css`
    box-shadow: ${theme.shadows.sm};
  `}
`;

// Button Components
export const Button = styled.button<{
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  border: none;
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  font-family: ${theme.typography.fontFamily.primary};
  font-weight: ${theme.typography.fontWeight.medium};
  text-decoration: none;
  transition: ${theme.transitions.normal};
  white-space: nowrap;
  user-select: none;

  ${props => props.fullWidth && css`width: 100%;`}

  /* Size variants */
  ${props => props.size === 'sm' && css`
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    font-size: ${theme.typography.fontSize.sm};
  `}

  ${props => props.size === 'lg' && css`
    padding: ${theme.spacing.lg} ${theme.spacing.xl};
    font-size: ${theme.typography.fontSize.lg};
  `}

  ${props => (!props.size || props.size === 'md') && css`
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    font-size: ${theme.typography.fontSize.md};
  `}

  /* Color variants */
  ${props => (!props.variant || props.variant === 'primary') && css`
    background: ${theme.colors.primary};
    color: white;
    
    &:hover:not(:disabled) {
      background: ${theme.colors.primaryDark};
      transform: translateY(-1px);
    }
  `}

  ${props => props.variant === 'secondary' && css`
    background: ${theme.colors.secondary};
    color: white;
    
    &:hover:not(:disabled) {
      background: ${theme.colors.secondaryDark};
      transform: translateY(-1px);
    }
  `}

  ${props => props.variant === 'accent' && css`
    background: ${theme.colors.accent};
    color: white;
    
    &:hover:not(:disabled) {
      background: ${theme.colors.accentDark};
      transform: translateY(-1px);
    }
  `}

  ${props => props.variant === 'danger' && css`
    background: ${theme.colors.error};
    color: white;
    
    &:hover:not(:disabled) {
      background: ${theme.colors.errorDark};
      transform: translateY(-1px);
    }
  `}

  ${props => props.variant === 'ghost' && css`
    background: transparent;
    color: ${theme.colors.primary};
    border: 2px solid ${theme.colors.primary};
    
    &:hover:not(:disabled) {
      background: ${theme.colors.primaryLight};
      transform: translateY(-1px);
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
`;

// Text Components
export const Title = styled.h1<{
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  align?: 'left' | 'center' | 'right';
  weight?: keyof typeof theme.typography.fontWeight;
}>`
  font-family: ${theme.typography.fontFamily.primary};
  color: ${props => props.color || theme.colors.text};
  text-align: ${props => props.align || 'left'};
  font-weight: ${props => props.weight ? theme.typography.fontWeight[props.weight] : theme.typography.fontWeight.bold};
  line-height: ${theme.typography.lineHeight.tight};
  margin: 0;

  ${props => props.size === 'sm' && css`font-size: ${theme.typography.fontSize.xl};`}
  ${props => (!props.size || props.size === 'md') && css`font-size: ${theme.typography.fontSize.xxl};`}
  ${props => props.size === 'lg' && css`font-size: ${theme.typography.fontSize.xxxl};`}
  ${props => props.size === 'xl' && css`font-size: 40px;`}
`;

export const Subtitle = styled.h2<{
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  align?: 'left' | 'center' | 'right';
  weight?: keyof typeof theme.typography.fontWeight;
}>`
  font-family: ${theme.typography.fontFamily.primary};
  color: ${props => props.color || theme.colors.text};
  text-align: ${props => props.align || 'left'};
  font-weight: ${props => props.weight ? theme.typography.fontWeight[props.weight] : theme.typography.fontWeight.semibold};
  line-height: ${theme.typography.lineHeight.tight};
  margin: 0;

  ${props => props.size === 'sm' && css`font-size: ${theme.typography.fontSize.lg};`}
  ${props => (!props.size || props.size === 'md') && css`font-size: ${theme.typography.fontSize.xl};`}
  ${props => props.size === 'lg' && css`font-size: ${theme.typography.fontSize.xxl};`}
`;

export const Text = styled.p<{
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: string;
  align?: 'left' | 'center' | 'right';
  weight?: keyof typeof theme.typography.fontWeight;
}>`
  font-family: ${theme.typography.fontFamily.primary};
  color: ${props => props.color || theme.colors.text};
  text-align: ${props => props.align || 'left'};
  font-weight: ${props => props.weight ? theme.typography.fontWeight[props.weight] : theme.typography.fontWeight.normal};
  line-height: ${theme.typography.lineHeight.normal};
  margin: 0;

  ${props => props.size === 'xs' && css`font-size: ${theme.typography.fontSize.xs};`}
  ${props => props.size === 'sm' && css`font-size: ${theme.typography.fontSize.sm};`}
  ${props => (!props.size || props.size === 'md') && css`font-size: ${theme.typography.fontSize.md};`}
  ${props => props.size === 'lg' && css`font-size: ${theme.typography.fontSize.lg};`}
`;

// Status/Badge Components
export const Badge = styled.span<{
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${theme.borderRadius.lg};
  font-family: ${theme.typography.fontFamily.primary};
  font-weight: ${theme.typography.fontWeight.medium};
  white-space: nowrap;

  ${props => props.size === 'sm' && css`
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    font-size: ${theme.typography.fontSize.xs};
  `}

  ${props => (!props.size || props.size === 'md') && css`
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    font-size: ${theme.typography.fontSize.sm};
  `}

  ${props => props.size === 'lg' && css`
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    font-size: ${theme.typography.fontSize.md};
  `}

  /* Color variants */
  ${props => (!props.variant || props.variant === 'primary') && css`
    background: ${theme.colors.primaryLight};
    color: ${theme.colors.primaryDark};
  `}

  ${props => props.variant === 'secondary' && css`
    background: ${theme.colors.secondaryLight};
    color: ${theme.colors.secondaryDark};
  `}

  ${props => props.variant === 'success' && css`
    background: ${theme.colors.secondaryLight};
    color: ${theme.colors.secondaryDark};
  `}

  ${props => props.variant === 'warning' && css`
    background: ${theme.colors.accentLight};
    color: ${theme.colors.accentDark};
  `}

  ${props => props.variant === 'error' && css`
    background: ${theme.colors.errorLight};
    color: ${theme.colors.errorDark};
  `}

  ${props => props.variant === 'info' && css`
    background: ${theme.colors.primaryLight};
    color: ${theme.colors.primaryDark};
  `}
`;

// Loading Spinner
export const Spinner = styled.div<{ size?: string; color?: string }>`
  width: ${props => props.size || '24px'};
  height: ${props => props.size || '24px'};
  border: 2px solid ${theme.colors.border};
  border-top: 2px solid ${props => props.color || theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Table Components
export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.md};
  overflow: hidden;
  box-shadow: ${theme.shadows.sm};
`;

export const TableHeader = styled.thead`
  background: ${theme.colors.primaryLight};
`;

export const TableRow = styled.tr<{ clickable?: boolean; selected?: boolean }>`
  transition: ${theme.transitions.fast};

  ${props => props.clickable && css`
    cursor: pointer;
    
    &:hover {
      background: ${theme.colors.surface};
    }
  `}

  ${props => props.selected && css`
    background: ${theme.colors.accentLight} !important;
  `}
`;

export const TableCell = styled.td<{ align?: 'left' | 'center' | 'right'; width?: string }>`
  padding: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border};
  text-align: ${props => props.align || 'left'};
  width: ${props => props.width || 'auto'};
  font-size: ${theme.typography.fontSize.sm};
  line-height: ${theme.typography.lineHeight.normal};
`;

export const TableHeaderCell = styled.th<{ align?: 'left' | 'center' | 'right'; width?: string }>`
  padding: ${theme.spacing.md};
  text-align: ${props => props.align || 'left'};
  width: ${props => props.width || 'auto'};
  font-weight: ${theme.typography.fontWeight.semibold};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.primaryDark};
`;