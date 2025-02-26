import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { LoginPage } from '../../src/pages/LoginPage.jsx';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
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

describe('LoginPage', () => {
  let mockSetUser;

  beforeEach(() => {
    mockSetUser = vi.fn();
    global.fetch = vi.fn(); // Resets fetch
    delete window.location;
    window.location = { href: vi.fn() };
  });

  afterEach(() => {
    vi.restoreAllMocks(); // Resets all mocks
  });

  it('should render login page successfully', () => {
    render(
      <MemoryRouter>
        <LoginPage setUser={mockSetUser} />
      </MemoryRouter>
    );

    expect(screen.getByLabelText('login form')).toBeInTheDocument();

    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();

    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();

    expect(screen.getByLabelText('login button')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Log in with Google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Log in with GitHub/i })).toBeInTheDocument();

    expect(screen.getByText(/Register/i)).toBeInTheDocument();
  });

  it('should call API on login and update state', async () => {
    const mockNavigate = vi.fn();
    useNavigate.mockReturnValue(mockNavigate);

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Login Successful' }),
      })
    );

    render(
      <MemoryRouter>
        <LoginPage setUser={mockSetUser} />
      </MemoryRouter>
    );

    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');

    await userEvent.clear(usernameInput);
    await userEvent.clear(passwordInput);

    await userEvent.type(usernameInput, 'Test User');
    await userEvent.type(passwordInput, 'Test Password');

    fireEvent.click(screen.getByLabelText('login button'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput.value, password: passwordInput.value }),
        credentials: 'include',
      });
    });
    expect(mockSetUser).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/home');
  });

  it('should call a toast error when failing to log in', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Failed to log in' }),
      })
    );

    render(
      <MemoryRouter>
        <LoginPage setUser={mockSetUser} />
      </MemoryRouter>
    );

    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');

    await userEvent.clear(usernameInput);
    await userEvent.clear(passwordInput);

    await userEvent.type(usernameInput, 'Test User');
    await userEvent.type(passwordInput, 'Test Password');

    fireEvent.click(screen.getByLabelText('login button'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
    expect(toast.error).toHaveBeenCalledWith('Failed to log in');
    expect(mockSetUser).not.toHaveBeenCalled();
  });

  it('should not call api when username and password not filled out', async () => {
    render(
      <MemoryRouter>
        <LoginPage setUser={mockSetUser} />
      </MemoryRouter>
    );

    fireEvent.submit(screen.getByLabelText('login form'));

    expect(fetch).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Please enter username and password');
  });

  it('should redirect to Google OAuth when Google login button is clicked', () => {
    render(
      <MemoryRouter>
        <LoginPage setUser={mockSetUser} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Log in with Google/i }));

    expect(window.location.href).toBe('http://localhost:8000/auth/google');
  });

  it('should redirect to GitHub OAuth when GitHub login button is clicked', () => {
    render(
      <MemoryRouter>
        <LoginPage setUser={mockSetUser} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Log in with GitHub/i }));

    expect(window.location.href).toBe('http://localhost:8000/auth/github');
  });
});
