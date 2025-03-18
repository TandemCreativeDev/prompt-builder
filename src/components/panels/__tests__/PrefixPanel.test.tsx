import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PrefixPanel, PrefixPanelProps } from '../PrefixPanel';
import { PrefixesData, PromptFragment, HistoryLogEntry } from '@/types/prompts';

// Mock data
const mockPrefixes: PrefixesData = {
  prefixes: [
    {
      id: 'prefix-1',
      text: 'Standard prefix for general use',
      tags: ['general', 'standard'],
      associated_model_type: 'GPT-4',
      rating: 5,
      uses: 20,
      last_used: '2023-01-05T00:00:00Z',
      created_by: 'Test User',
      ai_version_compatibility: ['GPT-4', 'Claude-3'],
      length: 30,
      deprecated: false,
      history_log: []
    },
    {
      id: 'prefix-2',
      text: 'Technical prefix for code-related tasks',
      tags: ['technical', 'code'],
      associated_model_type: 'GPT-4',
      rating: 4,
      uses: 10,
      last_used: '2023-01-01T00:00:00Z',
      created_by: 'Developer',
      ai_version_compatibility: ['GPT-4', 'Claude-3'],
      length: 36,
      deprecated: false,
      history_log: []
    },
    {
      id: 'prefix-3',
      text: 'Creative prefix for marketing content',
      tags: ['creative', 'marketing'],
      associated_model_type: 'Claude-3',
      rating: 3,
      uses: 5,
      last_used: '2022-12-25T00:00:00Z',
      created_by: 'Marketer',
      ai_version_compatibility: ['GPT-4', 'Claude-3'],
      length: 36,
      deprecated: false,
      history_log: []
    }
  ]
};

// Mock handlers
const mockSelectPrefix = jest.fn();
const mockUpdatePrefix = jest.fn();
const mockRestoreVersion = jest.fn();

// Default props
const defaultProps: PrefixPanelProps = {
  prefixes: mockPrefixes,
  onSelectPrefix: mockSelectPrefix,
  onUpdatePrefix: mockUpdatePrefix,
  onRestoreVersion: mockRestoreVersion
};

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

describe('PrefixPanel Component', () => {
  test('renders prefix panel with heading', () => {
    render(<PrefixPanel {...defaultProps} />);
    
    expect(screen.getByText('Prefix Prompts')).toBeInTheDocument();
  });

  test('displays all prefixes initially', () => {
    render(<PrefixPanel {...defaultProps} />);
    
    // Check that all prefixes are displayed
    expect(screen.getByText('Standard prefix for general use')).toBeInTheDocument();
    expect(screen.getByText('Technical prefix for code-related tasks')).toBeInTheDocument();
    expect(screen.getByText('Creative prefix for marketing content')).toBeInTheDocument();
  });

  test('displays tags for filtering', () => {
    render(<PrefixPanel {...defaultProps} />);
    
    // Check that all unique tags are displayed
    expect(screen.getByText('general')).toBeInTheDocument();
    expect(screen.getByText('standard')).toBeInTheDocument();
    expect(screen.getByText('technical')).toBeInTheDocument();
    expect(screen.getByText('code')).toBeInTheDocument();
    expect(screen.getByText('creative')).toBeInTheDocument();
    expect(screen.getByText('marketing')).toBeInTheDocument();
  });

  test('filters prefixes by search term', () => {
    render(<PrefixPanel {...defaultProps} />);
    
    // Search for "technical"
    const searchInput = screen.getByPlaceholderText('Search prefixes...');
    fireEvent.change(searchInput, { target: { value: 'technical' } });
    
    // Only the technical prefix should be displayed
    expect(screen.getByText('Technical prefix for code-related tasks')).toBeInTheDocument();
    expect(screen.queryByText('Standard prefix for general use')).not.toBeInTheDocument();
    expect(screen.queryByText('Creative prefix for marketing content')).not.toBeInTheDocument();
  });

  test('filters prefixes by tag selection', () => {
    render(<PrefixPanel {...defaultProps} />);
    
    // Click on the "marketing" tag button
    const marketingTagButton = screen.getAllByRole('button').find(
      button => button.textContent === 'marketing'
    );
    fireEvent.click(marketingTagButton!);
    
    // Only the marketing prefix should be displayed
    expect(screen.getByText('Creative prefix for marketing content')).toBeInTheDocument();
    expect(screen.queryByText('Standard prefix for general use')).not.toBeInTheDocument();
    expect(screen.queryByText('Technical prefix for code-related tasks')).not.toBeInTheDocument();
  });

  test('combines search and tag filtering', () => {
    render(<PrefixPanel {...defaultProps} />);
    
    // Click on the "technical" tag button
    const technicalTagButton = screen.getAllByRole('button').find(
      button => button.textContent === 'technical'
    );
    fireEvent.click(technicalTagButton!);
    
    // Search for "code"
    const searchInput = screen.getByPlaceholderText('Search prefixes...');
    fireEvent.change(searchInput, { target: { value: 'code' } });
    
    // Only the technical prefix should be displayed
    expect(screen.getByText('Technical prefix for code-related tasks')).toBeInTheDocument();
    expect(screen.queryByText('Standard prefix for general use')).not.toBeInTheDocument();
    expect(screen.queryByText('Creative prefix for marketing content')).not.toBeInTheDocument();
  });

  test('toggles tags on click', () => {
    render(<PrefixPanel {...defaultProps} />);
    
    // Initial state - all prefixes displayed
    expect(screen.getByText('Standard prefix for general use')).toBeInTheDocument();
    expect(screen.getByText('Technical prefix for code-related tasks')).toBeInTheDocument();
    expect(screen.getByText('Creative prefix for marketing content')).toBeInTheDocument();
    
    // Click on the "technical" tag button
    const technicalTagButton = screen.getAllByRole('button').find(
      button => button.textContent === 'technical'
    );
    fireEvent.click(technicalTagButton!);
    
    // Only technical prefix should be displayed
    expect(screen.queryByText('Standard prefix for general use')).not.toBeInTheDocument();
    expect(screen.getByText('Technical prefix for code-related tasks')).toBeInTheDocument();
    expect(screen.queryByText('Creative prefix for marketing content')).not.toBeInTheDocument();
    
    // Click on the "technical" tag again to remove filter
    fireEvent.click(technicalTagButton!);
    
    // All prefixes should be displayed again
    expect(screen.getByText('Standard prefix for general use')).toBeInTheDocument();
    expect(screen.getByText('Technical prefix for code-related tasks')).toBeInTheDocument();
    expect(screen.getByText('Creative prefix for marketing content')).toBeInTheDocument();
  });

  // Additional tests for multiple tag selection and other interactions could be added here
});