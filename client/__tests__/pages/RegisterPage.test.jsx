import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { RegisterPage } from '../../src/pages/RegisterPage.jsx';
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

describe('RegisterPage', () => {
  it('should render form', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Register New User')).toBeInTheDocument();
    expect(screen.getByLabelText('register form')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Register/i }));
  });

  it('should call API on register, and navigate to login', async () => {
    const mockNavigate = vi.fn();
    useNavigate.mockReturnValue(mockNavigate);

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Registration Successful' }),
      })
    );

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText('username-input');
    const passwordInput = screen.getByLabelText('password-input');
    const emailInput = screen.getByLabelText('email-input');

    expect(usernameInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();

    await userEvent.clear(usernameInput);
    await userEvent.clear(passwordInput);
    await userEvent.clear(emailInput);

    await userEvent.type(usernameInput, 'Test Username');
    await userEvent.type(passwordInput, 'Test Password');
    await userEvent.type(emailInput, 'Test@email.com');

    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: usernameInput.value,
          password: passwordInput.value,
          email: emailInput.value,
        }),
      });
    });

    expect(toast.success).toHaveBeenCalledWith('Registration successful, you can now log in');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should show toast error when failing to call API', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Registration failed' }),
      })
    );

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText('username-input');
    const passwordInput = screen.getByLabelText('password-input');
    const emailInput = screen.getByLabelText('email-input');

    await userEvent.clear(usernameInput);
    await userEvent.clear(passwordInput);
    await userEvent.clear(emailInput);

    await userEvent.type(usernameInput, 'Test Username');
    await userEvent.type(passwordInput, 'Test Password');
    await userEvent.type(emailInput, 'Test@email.com');

    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
    expect(toast.error).toHaveBeenCalledWith('Registration failed');
  });

  it('should not call API when username empty', async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText('username-input');
    const passwordInput = screen.getByLabelText('password-input');
    const emailInput = screen.getByLabelText('email-input');

    await userEvent.clear(usernameInput); // empty username
    await userEvent.clear(passwordInput);
    await userEvent.clear(emailInput);

    await userEvent.type(passwordInput, 'Test Password');
    await userEvent.type(emailInput, 'Test@email.com');

    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    expect(fetch).not.toHaveBeenCalled;
  });

  it('should not call API when password empty', async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText('username-input');
    const passwordInput = screen.getByLabelText('password-input');
    const emailInput = screen.getByLabelText('email-input');

    await userEvent.clear(usernameInput);
    await userEvent.clear(passwordInput); // empty password
    await userEvent.clear(emailInput);

    await userEvent.type(usernameInput, 'Test Username');
    await userEvent.type(emailInput, 'Test@email.com');

    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    expect(fetch).not.toHaveBeenCalled;
  });
});
