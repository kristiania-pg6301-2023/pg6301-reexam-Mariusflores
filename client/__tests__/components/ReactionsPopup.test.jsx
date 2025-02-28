import { afterEach, beforeEach, describe, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ReactionsPopup from '../../src/components/ReactionsPopup'; // Adjust the import path if necessary

// Mock the fetch API
global.fetch = vi.fn();

describe('ReactionsPopup Component', () => {
  const mockOnClose = vi.fn();
  const mockPostId = '123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state initially', () => {
    fetch.mockResolvedValueOnce(new Response(JSON.stringify({ reactions: [] })));

    render(<ReactionsPopup postId={mockPostId} onClose={mockOnClose} />);
    expect(screen.getByText('Loading reactions...')).toBeInTheDocument();
  });

  it('renders reactions when API response is successful', async () => {
    fetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ reactions: [{ username: 'John', reaction: '❤️' }] }))
    );

    render(<ReactionsPopup postId={mockPostId} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('John (❤️)')).toBeInTheDocument();
    });
  });

  it('renders "No reactions yet." when API response is empty', async () => {
    fetch.mockResolvedValueOnce(new Response(JSON.stringify({ reactions: [] })));

    render(<ReactionsPopup postId={mockPostId} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('No reactions yet.')).toBeInTheDocument();
    });
  });

  it('renders "No reactions yet." when API request fails', async () => {
    fetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<ReactionsPopup postId={mockPostId} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('No reactions yet.')).toBeInTheDocument();
    });
  });
});
