import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { ProfilePage } from '../../src/pages/ProfilePage.jsx';
import { act } from 'react';
import { toast } from 'react-toastify';

afterEach(cleanup);

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

describe('Profile Page', () => {
  let mockUser;
  let mockSetUser;

  let mockAbortController;
  beforeEach(() => {
    mockSetUser = vi.fn();
    mockUser = { id: '1', username: 'Test user', verified: true };

    //  Mock AbortController
    mockAbortController = {
      signal: {},
      abort: vi.fn(),
    };
    global.AbortController = vi.fn(() => mockAbortController);

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Fetched posts successfully' }),
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render empty Dom Element and redirect to login if user not logged in', () => {
    const mockNavigate = vi.fn();
    useNavigate.mockReturnValue(mockNavigate);
    mockUser = null;

    const { container } = render(
      <MemoryRouter>
        <ProfilePage user={mockUser} setUser={mockSetUser} />
      </MemoryRouter>
    );

    expect(container).toBeEmptyDOMElement();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should render page if user logged in and show verified icon if verified', async () => {
    await act(() => {
      render(
        <MemoryRouter>
          <ProfilePage user={mockUser} setUser={mockSetUser} />
        </MemoryRouter>
      );
    });

    expect(screen.getByLabelText('profile header')).toBeInTheDocument();

    expect(screen.getByLabelText('verified icon')).toBeInTheDocument();

    expect(screen.getByTestId('settings-button')).toBeInTheDocument();
    // check for rendering of element in SettingsButton.jsx
    const settingsButton = await screen.getByLabelText('settings-button');
    expect(settingsButton).toBeInTheDocument();
    expect(screen.getByTestId('post-list')).toBeInTheDocument();
    // check for rendering of element in PostList.jsx
    const postContainer = await screen.getByLabelText('post-container');
    expect(postContainer).toBeInTheDocument();
  });

  it('should not show verified icon if user not verified', async () => {
    mockUser.verified = false;

    await act(() => {
      render(
        <MemoryRouter>
          <ProfilePage user={mockUser} setUser={mockSetUser} />
        </MemoryRouter>
      );
    });

    expect(screen.queryByLabelText('verified icon')).not.toBeInTheDocument();
  });

  it('should call API if user is defined', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Fetched posts successfully' }),
      })
    );

    render(
      <MemoryRouter>
        <ProfilePage user={mockUser} setUser={mockSetUser} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/post/user/posts/1', {
        credentials: 'include',
        signal: expect.any(Object),
      });
    });
  });

  it('should catch and toast error message if fetch rejected on fetching posts', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

    render(
      <MemoryRouter>
        <ProfilePage user={mockUser} setUser={mockSetUser} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error');
    });
  });
});
