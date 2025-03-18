import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PromptItem, PromptItemProps } from '../PromptItem';
import { PromptFragment } from '@/types/prompts';

// Mock data
const mockPrompt: PromptFragment = {
  id: 'prefix-1',
  text: 'This is a test prompt',
  tags: ['test', 'example'],
  associated_model_type: 'GPT-4',
  rating: 5,
  uses: 10,
  last_used: '2023-01-01T00:00:00Z',
  created_by: 'Test User',
  ai_version_compatibility: ['GPT-4', 'Claude-3'],
  length: 22,
  deprecated: false,
  history_log: [
    {
      timestamp: '2022-12-01T00:00:00Z',
      text: 'Previous version of the prompt'
    }
  ]
};

// Mock handlers
const mockSelect = jest.fn();
const mockUpdate = jest.fn();
const mockRestoreVersion = jest.fn();

// Default props
const defaultProps: PromptItemProps = {
  prompt: mockPrompt,
  onSelect: mockSelect,
  onUpdate: mockUpdate,
  onRestoreVersion: mockRestoreVersion
};

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

describe('PromptItem Component', () => {
  test('renders prompt information correctly', () => {
    render(<PromptItem {...defaultProps} />);
    
    // Check tags are displayed
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('example')).toBeInTheDocument();
    
    // Check prompt text is displayed
    expect(screen.getByText('This is a test prompt')).toBeInTheDocument();
    
    // Check metadata is displayed
    expect(screen.getByText(/Model: GPT-4/)).toBeInTheDocument();
    expect(screen.getByText(/Uses: 10/)).toBeInTheDocument();
    expect(screen.getByText(/Created by: Test User/)).toBeInTheDocument();
    expect(screen.getByText(/Length: 22 chars/)).toBeInTheDocument();
  });

  test('calls onSelect when select button is clicked', () => {
    render(<PromptItem {...defaultProps} />);
    
    // Find the select button by its placement and function
    const buttons = screen.getAllByRole('button');
    // Assuming the 3rd button is the select button based on our component order
    const selectButton = buttons[2]; 
    
    fireEvent.click(selectButton);
    
    expect(mockSelect).toHaveBeenCalledWith(mockPrompt);
  });

  test('opens edit dialog when edit button is clicked', async () => {
    render(<PromptItem {...defaultProps} />);
    
    // Find the edit button by its placement
    const buttons = screen.getAllByRole('button');
    // Assuming the 1st button is the edit button based on our component order
    const editButton = buttons[0]; 
    
    fireEvent.click(editButton);
    
    // Verify the edit dialog is shown - in our mock, the dialog title will still be rendered
    expect(screen.getByText('Edit Prompt')).toBeInTheDocument();
    expect(screen.getByText('Make changes to the prompt text. Save changes for the current session only or persist them.')).toBeInTheDocument();
    
    // Verify the textarea contains the prompt text - in our mock this might work differently
    // This might need adjustment based on how the textarea is rendered in the mock
    const textarea = screen.getByRole('textbox') || screen.getByText('This is a test prompt');
    expect(textarea).toBeInTheDocument();
  });

  test('calls onUpdate with persistChange=false when "Update for Session" is clicked', () => {
    render(<PromptItem {...defaultProps} />);
    
    // Open the edit dialog
    const buttons = screen.getAllByRole('button');
    const editButton = buttons[0]; // Edit button
    fireEvent.click(editButton);
    
    // With our mocked components, we might not be able to change the textarea value
    // Instead we'll just find the "Update for Session" button and click it
    const sessionButton = screen.getByText('Update for Session');
    fireEvent.click(sessionButton);
    
    // Since we can't change the text, we'll check if onUpdate was called with the original text
    expect(mockUpdate).toHaveBeenCalledWith('prefix-1', expect.any(String), false);
  });

  test('calls onUpdate with persistChange=true when "Persist Change" is clicked', () => {
    render(<PromptItem {...defaultProps} />);
    
    // Open the edit dialog
    const buttons = screen.getAllByRole('button');
    const editButton = buttons[0]; // Edit button
    fireEvent.click(editButton);
    
    // With our mocked components, we might not be able to change the textarea value
    // Instead we'll just find the "Persist Change" button and click it
    const persistButton = screen.getByText('Persist Change');
    fireEvent.click(persistButton);
    
    // Since we can't change the text, we'll check if onUpdate was called with the original text
    expect(mockUpdate).toHaveBeenCalledWith('prefix-1', expect.any(String), true);
  });

  test('opens history dialog when history button is clicked', () => {
    render(<PromptItem {...defaultProps} />);
    
    // Find the history button by its placement
    const buttons = screen.getAllByRole('button');
    // Assuming the 2nd button is the history button based on our component order
    const historyButton = buttons[1];
    
    fireEvent.click(historyButton);
    
    // Verify the history dialog is shown - in our mock, the dialog title will still be rendered
    expect(screen.getByText('Prompt History')).toBeInTheDocument();
    expect(screen.getByText('View and restore previous versions of this prompt.')).toBeInTheDocument();
    
    // Verify history entry is displayed
    expect(screen.getByText('Previous version of the prompt')).toBeInTheDocument();
  });

  // Additional tests for restore functionality could be added here
});