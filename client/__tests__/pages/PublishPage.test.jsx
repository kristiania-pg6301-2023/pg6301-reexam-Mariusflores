import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PublishPage } from '../../src/pages/PublishPage.jsx';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { toast } from 'react-toastify';

vi.mock('../../src/utils/getApiUrl.js', () => ({
  api_url: 'http://localhost:8000',
}));

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});
describe('Publish Page', () => {
  let postContent;
  let postTitle;
  beforeEach(() => {
    postContent = 'This is some kind of content';
    postTitle = 'This is a post';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render page', () => {
    render(
      <MemoryRouter>
        <PublishPage />
      </MemoryRouter>
    );

    expect(screen.getByLabelText('publish post form')).toBeInTheDocument();

    expect(screen.getByText('Whats on your mind?')).toBeInTheDocument();

    expect(screen.getByLabelText('post title')).toBeInTheDocument();
    expect(screen.getByLabelText('post content')).toBeInTheDocument();

    expect(screen.getByRole('button', /Post/i)).toBeInTheDocument();
  });

  it('should call api on submitting a post and redirect /home', async () => {
    const mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Post published successfully' }),
      })
    );

    render(
      <MemoryRouter>
        <PublishPage />
      </MemoryRouter>
    );

    const titleInput = screen.getByLabelText('post title');
    const contentInput = screen.getByLabelText('post content');

    await userEvent.clear(contentInput);
    await userEvent.type(contentInput, postContent);

    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, postTitle);

    fireEvent.submit(screen.getByLabelText('publish post form'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/post/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: postTitle, content: contentInput.value }),
        credentials: 'include',
      });
    });
    expect(toast.success).toHaveBeenCalledWith('Successfully Posted👉');
    expect(mockNavigate).toHaveBeenCalledWith('/home');
  });

  it('should call API and send error toast on failed fetch', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Failed to publish post' }),
      })
    );

    render(
      <MemoryRouter>
        <PublishPage />
      </MemoryRouter>
    );

    const titleInput = screen.getByLabelText('post title');
    const contentInput = screen.getByLabelText('post content');

    await userEvent.clear(contentInput);
    await userEvent.type(contentInput, postContent);
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, postTitle);

    fireEvent.submit(screen.getByLabelText('publish post form'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
    expect(toast.error).toHaveBeenCalledWith('Failed to publish post');
  });

  it('should send error toast and not call API on empty content', () => {
    render(
      <MemoryRouter>
        <PublishPage />
      </MemoryRouter>
    );

    fireEvent.submit(screen.getByLabelText('publish post form'));

    expect(fetch).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Content and title required');
  });
});
