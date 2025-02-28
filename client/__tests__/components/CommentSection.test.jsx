import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import CommentsSection from '../../src/components/CommentSection.jsx';
import userEvent from '@testing-library/user-event';
import { toast } from 'react-toastify';
import { act } from 'react';

// Mock API URL
vi.mock('../../src/utils/getApiUrl.js', () => ({
  api_url: 'http://localhost:8000',
}));

// Mock Toast Notifications
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Comment Section', () => {
  let mockComments;

  beforeEach(() => {
    mockComments = [
      { _id: '1', content: 'Some comment', username: 'test user' },
      { _id: '2', content: 'Some other comment', username: 'other user' },
    ];
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should call API on render and fetch comments for postId, and render the page', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'successfully fetched', comments: [] }),
      })
    );

    await act(async () => {
      render(<CommentsSection postId={'1234'} userLoggedIn={true} />);
    });

    expect(fetch).toHaveBeenCalledWith('http://localhost:8000/comment/1234', {
      method: 'GET',
      credentials: 'include',
    });

    expect(screen.getByText(/No comments yet. Be the first to comment!/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Write a comment...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Post/i })).toBeInTheDocument();
  });

  it('should render ul element if comments are not empty', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'successfully fetched', comments: mockComments }),
      })
    );

    await act(async () => {
      render(<CommentsSection postId={'1'} userLoggedIn={true} />);
    });

    let commentList = await screen.findByLabelText('comments list');
    expect(commentList).toBeInTheDocument();

    const commentListItems = await screen.findAllByLabelText('list item');
    expect(commentListItems.length).toBe(mockComments.length);
  });

  it('should show an error toast if fetching comments fails', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Failed to fetch comments' }),
      })
    );

    await act(async () => {
      render(<CommentsSection postId={'1'} userLoggedIn={true} />);
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    expect(toast.error).toHaveBeenCalledWith('Failed to fetch comments');
  });

  it('should catch error and toast error on rejected fetch', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

    await act(async () => {
      render(<CommentsSection postId={'1'} userLoggedIn={true} />);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error');
    });
  });

  it('should call API and return a toast success on adding a comment', async () => {
    const mockComment = { _id: '1', content: 'Some comment', username: 'test user' };

    await act(async () => {
      render(<CommentsSection postId={'1'} userLoggedIn={true} />);
    });

    const input = screen.getByPlaceholderText('Write a comment...');
    await userEvent.clear(input);
    await userEvent.type(input, 'comment');

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'successfully fetched', comment: mockComment }), // Fix: Correct API response format
      })
    );

    fireEvent.submit(screen.getByLabelText('comment form'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/comment/1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'comment' }),
        credentials: 'include',
      });
    });

    expect(toast.success).toHaveBeenCalledWith('Successfully added comment');
  });

  it('should return an error toast on failed add comment', async () => {
    await act(async () => {
      render(<CommentsSection postId={'1'} userLoggedIn={true} />);
    });

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Could not add comment' }),
      })
    );

    const input = screen.getByPlaceholderText('Write a comment...');
    await userEvent.type(input, 'comment');

    fireEvent.submit(screen.getByLabelText('comment form'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    expect(toast.error).toHaveBeenCalledWith('Could not add comment');
  });

  it('should not call API and toast error when adding empty comment', async () => {
    render(<CommentsSection postId={'1'} userLoggedIn={true} />);

    // Calls fetch in useEffect on render
    expect(fetch).toHaveBeenCalledTimes(1);

    fireEvent.submit(screen.getByLabelText('comment form'));

    // Should call an additional fetch
    expect(fetch).toHaveBeenCalledTimes(1);

    expect(toast.error).toHaveBeenCalledWith('Comment cannot be empty.');
  });
  it('should catch error and toast error on rejected fetch', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'successfully fetched', comments: mockComments }),
      })
    );

    await act(async () => {
      render(<CommentsSection postId={'1'} userLoggedIn={true} />);
    });

    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

    const input = screen.getByPlaceholderText('Write a comment...');
    await userEvent.type(input, 'comment');

    fireEvent.submit(screen.getByLabelText('comment form'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error');
    });
  });

  it('should call api and success toast on deleting comment', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'successfully fetched', comments: mockComments }),
      })
    );

    await act(async () => {
      render(<CommentsSection postId={'1'} userLoggedIn={true} />);
    });

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Successfully deleted' }),
      })
    );

    // should now show two comments

    let listItems = await screen.findAllByLabelText('list item');

    expect(listItems.length).toBe(2);

    const deleteCommentButtons = await screen.findAllByLabelText('delete comment button');
    const deleteCommentButton = deleteCommentButtons[0];

    fireEvent.click(deleteCommentButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/comment/delete/1', {
        method: 'DELETE',
        credentials: 'include',
      });
    });

    expect(toast.success).toHaveBeenCalledWith('Comment deleted');

    listItems = await screen.findAllByLabelText('list item');

    // Should now be 1
    expect(listItems.length).toBe(1);
  });

  it('should return error toast when failed to delete comment', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'successfully fetched', comments: mockComments }),
      })
    );

    await act(async () => {
      render(<CommentsSection postId={'1'} userLoggedIn={true} />);
    });

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Failed to delete comment' }),
      })
    );

    const deleteCommentButtons = await screen.findAllByLabelText('delete comment button');
    const deleteCommentButton = deleteCommentButtons[0];

    fireEvent.click(deleteCommentButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    expect(toast.error).toHaveBeenCalledWith('Failed to delete comment');
  });
  it('should catch error and toast error on rejected fetch', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'successfully fetched', comments: mockComments }),
      })
    );

    await act(async () => {
      render(<CommentsSection postId={'1'} userLoggedIn={true} />);
    });

    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

    const deleteCommentButtons = await screen.findAllByLabelText('delete comment button');
    const deleteCommentButton = deleteCommentButtons[0];

    fireEvent.click(deleteCommentButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error');
    });
  });
});
