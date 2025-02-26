import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import PostList from '../../src/components/PostList.jsx';
import { vi } from 'vitest';
import { toast } from 'react-toastify';
import userEvent from '@testing-library/user-event';

vi.mock('../../src/utils/getApiUrl.js', () => ({
  api_url: 'http://localhost:8000',
}));

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('PostList Component', () => {
  let mockSetPosts;
  let mockPosts;

  beforeEach(() => {
    mockSetPosts = vi.fn();
    mockPosts = [
      {
        _id: '1',
        username: 'Ola Nordmann',
        content: 'This is the first post',
        timestamp: '2024-02-25T12:00:00Z',
        reactions: [{ userId: '1', reaction: '👍' }],
      },
      {
        _id: '2',
        username: 'Kari Nordmann',
        content: 'This is the second test post',
        timestamp: '2024-02-26T12:00:00Z',
        reactions: [{ userId: '2', reaction: '❤️' }],
      },
    ];
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should display posts when provided an array of posts', async () => {
    render(<PostList userLoggedIn={true} posts={mockPosts} setPosts={mockSetPosts} />);

    // Await each `findByText` call properly
    const firstPost = await screen.findByText(/This is the first post/i);
    const secondPost = await screen.findByText(/This is the second test post/i);
    const firstUser = await screen.findByText(/Ola Nordmann/i);
    const secondUser = await screen.findByText(/Kari Nordmann/i);

    // Now make the assertions
    expect(firstPost).toBeInTheDocument();
    expect(secondPost).toBeInTheDocument();
    expect(firstUser).toBeInTheDocument();
    expect(secondUser).toBeInTheDocument();
  });

  it('should ensure posts is always an array', () => {
    render(<PostList userLoggedIn={true} posts={null} setPosts={vi.fn()} />);

    expect(screen.getByText('No posts available.')).toBeInTheDocument();
  });

  it('should call API and update state when deleting a post', async () => {
    // Mock fetch API
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Post deleted successfully!' }),
      })
    );

    const mockPosts = [
      {
        _id: '123',
        username: 'Test User',
        content: 'Post to be deleted',
        timestamp: '2024-02-25T12:00:00Z',
        reactions: [],
      },
    ];

    render(<PostList userLoggedIn={true} posts={mockPosts} setPosts={mockSetPosts} />);

    const optionsButton = await screen.findByLabelText('More options');

    fireEvent.click(optionsButton);
    // Ensure the delete button exists
    const deleteButton = await screen.findByLabelText('delete-post-button');

    // Click the delete button
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(`http://localhost:8000/post/delete/123`, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      expect(mockSetPosts).toHaveBeenCalledWith([]); // Expect updated posts array
    });
  });

  it('should show an error toast if API delete fails', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Failed to delete post' }),
      })
    );
    const mockSetPosts = vi.fn();

    const mockPosts = [
      {
        _id: '123',
        username: 'Test User',
        content: 'Post to be deleted',
        timestamp: '2024-02-25T12:00:00Z',
        reactions: [],
      },
    ];

    render(<PostList userLoggedIn={true} posts={mockPosts} setPosts={mockSetPosts} />);

    const optionsButton = await screen.findByLabelText('More options');

    fireEvent.click(optionsButton);
    // Ensure the delete button exists
    const deleteButton = await screen.findByLabelText('delete-post-button');

    // Click the delete button
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
      expect(mockSetPosts).not.toHaveBeenCalled();
    });

    expect(toast.error).toHaveBeenCalledWith('Failed to delete post');
  });

  it('should call API and update state when editing a post', async () => {
    // Mock fetch API
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Post edited successfully!' }),
      })
    );

    const mockSetPosts = vi.fn(); // Mock state setter function
    const mockPosts = [
      {
        _id: '123',
        username: 'Test User',
        content: 'Post to be edited',
        timestamp: '2024-02-25T12:00:00Z',
        reactions: [],
      },
    ];

    render(<PostList userLoggedIn={true} posts={mockPosts} setPosts={mockSetPosts} />);

    const optionsButton = await screen.findByLabelText('More options');

    fireEvent.click(optionsButton);
    // Ensure the delete button exists
    const editButton = await screen.findByLabelText('edit-post-button');

    // Click the edit button
    fireEvent.click(editButton);

    const input = screen.getByLabelText('edit textarea');
    expect(input).toBeInTheDocument();

    await userEvent.clear(input);
    await userEvent.type(input, 'Updated post content');

    expect(input).toHaveValue('Updated post content');

    const saveEditButton = await screen.findByLabelText('save edit button');
    fireEvent.click(saveEditButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(`http://localhost:8000/post/edit/123`, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newContent: input.value }),
      });

      expect(mockSetPosts).toHaveBeenCalledWith([
        {
          _id: '123',
          username: 'Test User',
          content: 'Updated post content',
          timestamp: '2024-02-25T12:00:00Z',
          reactions: [],
        },
      ]);
    });
  });

  it('should call a toast error if content is empty', async () => {
    const mockPosts = [
      {
        _id: '123',
        username: 'Test User',
        content: 'Post to be edited',
        timestamp: '2024-02-25T12:00:00Z',
        reactions: [],
      },
    ];

    render(<PostList userLoggedIn={true} posts={mockPosts} setPosts={mockSetPosts} />);

    const optionsButton = await screen.findByLabelText('More options');

    fireEvent.click(optionsButton);
    // Ensure the delete button exists
    const editButton = await screen.findByLabelText('edit-post-button');

    // Click the edit button
    fireEvent.click(editButton);

    const input = screen.getByLabelText('edit textarea');
    expect(input).toBeInTheDocument();

    await userEvent.clear(input);

    expect(input).toHaveValue('');

    const saveEditButton = await screen.findByLabelText('save edit button');
    fireEvent.click(saveEditButton);

    expect(toast.error).toHaveBeenCalledWith('Content required.');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should show an error toast if API edit fails', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Failed to edit post' }),
      })
    );
    const mockSetPosts = vi.fn();

    const mockPosts = [
      {
        _id: '123',
        username: 'Test User',
        content: 'Post to be deleted',
        timestamp: '2024-02-25T12:00:00Z',
        reactions: [],
      },
    ];
    render(<PostList userLoggedIn={true} posts={mockPosts} setPosts={mockSetPosts} />);

    const optionsButton = await screen.findByLabelText('More options');

    fireEvent.click(optionsButton);
    // Ensure the delete button exists
    const editButton = await screen.findByLabelText('edit-post-button');

    // Click the edit button
    fireEvent.click(editButton);

    const input = screen.getByLabelText('edit textarea');
    expect(input).toBeInTheDocument();

    await userEvent.clear(input);
    await userEvent.type(input, 'Updated post content');

    expect(input).toHaveValue('Updated post content');

    const saveEditButton = await screen.findByLabelText('save edit button');
    fireEvent.click(saveEditButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
      expect(mockSetPosts).not.toHaveBeenCalled();
    });

    expect(toast.error).toHaveBeenCalledWith('Failed to edit post');
  });

  it('should handle API calls and update state when reacting', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Reaction updated!', userId: '1' }),
      })
    );

    render(<PostList userLoggedIn={true} posts={mockPosts} setPosts={mockSetPosts} />);

    const laughButtons = await screen.findAllByRole('button', { name: /😂 0/i });

    // Sorts by latest post so laughButtons[0] -> post 2
    const laughButtonFirstPost = laughButtons[0];

    fireEvent.click(laughButtonFirstPost);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/post/react/1', {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction: '😂' }),
      });

      expect(mockSetPosts).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Reaction updated!');
    });
  });
});
