import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { vi } from 'vitest';
import { act } from 'react';
import App, { RedirectToLogin } from '../src/App.jsx';

vi.mock('../src/utils/getApiUrl.js', () => ({
  api_url: 'http://localhost:8000',
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe('App.jsx', () => {
  let mockUser;

  beforeEach(() => {
    mockUser = { id: '1', username: 'Test User', verified: true };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should redirect to login when user is not authenticated', async () => {
    const mockNavigate = vi.fn(); // ✅ Create a mock function

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve(null), // Simulate unauthenticated state
      })
    );

    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/profile']}>
          <RedirectToLogin navigate={mockNavigate} /> {/* ✅ Now we can pass mockNavigate */}
        </MemoryRouter>
      );
    });

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true }));
  });

  it('should call api for fetching user data and render user data if on /profile', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUser),
      })
    );

    render(
      <MemoryRouter initialEntries={['/profile']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/auth/me', {
        credentials: 'include',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });

  it('should call API and Logout when user logged in and NavBar button logout is clicked', async () => {
    const mockNavigate = vi.fn();
    useNavigate.mockReturnValue(mockNavigate);

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUser),
      })
    );

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/auth/me', {
        credentials: 'include',
      });
    });
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Successful logout' }),
      })
    );

    const logOutButton = await screen.findByLabelText('logout');
    fireEvent.click(logOutButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
