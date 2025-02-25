import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';
import NavBar from '../../src/components/NavBar';
import userEvent from '@testing-library/user-event';

afterEach(cleanup);

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});
describe('NavBar Component', () => {
  it('renders Home and Login link when user is not logged in', () => {
    render(
      <MemoryRouter>
        <NavBar user={null} onLogout={vi.fn()} />
      </MemoryRouter>
    );

    // Check for Home link
    expect(screen.getByText('Home')).toBeInTheDocument();

    // Check for Login link
    expect(screen.getByText('Login')).toBeInTheDocument();

    // Logout button should NOT be present
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('renders Home, Post, Profile, and Logout when user is logged in', () => {
    const mockUser = { id: '123', username: 'testuser' };

    render(
      <MemoryRouter>
        <NavBar user={mockUser} onLogout={vi.fn()} />
      </MemoryRouter>
    );

    // Check for Home, Post, Profile, and Logout buttons
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Post')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('should render login and home if user prop undefined', () => {
    render(
      <MemoryRouter>
        <NavBar user={undefined} onLogout={vi.fn()} />
      </MemoryRouter>
    );

    // Check for Home link
    expect(screen.getByText('Home')).toBeInTheDocument();

    // Check for Login link
    expect(screen.getByText('Login')).toBeInTheDocument();

    // Logout button should NOT be present
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  // 🟠 4️⃣ Edge Case: Invalid User Values
  test.each([null, 123, {}, [], 'string'])(
    'renders safely with invalid user: %p',
    (invalidUser) => {
      render(
        <MemoryRouter>
          <NavBar user={invalidUser} onLogout={vi.fn()} />
        </MemoryRouter>
      );

      expect(screen.getByLabelText('navigate-home')).toBeInTheDocument();
      expect(screen.getByLabelText('navigate-login')).toBeInTheDocument();
      expect(screen.queryByLabelText('logout')).not.toBeInTheDocument();
    }
  );

  test('calls onLogout when Logout button is clicked', async () => {
    const mockUser = { id: '123', username: 'testuser' };
    const mockLogout = vi.fn();
    const mockNavigate = vi.fn();
    useNavigate.mockReturnValue(mockNavigate);

    render(
      <MemoryRouter>
        <NavBar user={mockUser} onLogout={mockLogout} />
      </MemoryRouter>
    );

    // Click the Logout button
    fireEvent.click(screen.getByText('Logout'));

    // Check if onLogout function was called
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('directs home when home button is clicked', () => {
    const mockNavigate = vi.fn();
    useNavigate.mockReturnValue(mockNavigate);

    render(
      <MemoryRouter>
        <NavBar user={null} onLogout={vi.fn()} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByLabelText('navigate-home'));

    expect(mockNavigate).toHaveBeenCalledWith('/home');
  });

  it('directs to login when clicked', () => {
    const mockNavigate = vi.fn();
    useNavigate.mockReturnValue(mockNavigate);

    render(
      <MemoryRouter>
        <NavBar user={null} onLogout={vi.fn()} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByLabelText('navigate-login'));

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('redirects to profile when clicked while user logged in', () => {
    const mockUser = { id: '123', username: 'testuser' };
    const mockNavigate = vi.fn();
    useNavigate.mockReturnValue(mockNavigate);

    render(
      <MemoryRouter>
        <NavBar user={mockUser} onLogout={vi.fn()} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByLabelText('navigate-profile'));

    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  it('redirects to post when clicked and user logged in', () => {
    const mockUser = { id: '123', username: 'testuser' };
    const mockNavigate = vi.fn();
    useNavigate.mockReturnValue(mockNavigate);

    render(
      <MemoryRouter>
        <NavBar user={mockUser} onLogout={vi.fn()} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByLabelText('navigate-publish'));

    expect(mockNavigate).toHaveBeenCalledWith('/publish');
  });

  it('should navigate using keyboard', async () => {
    const mockUser = { id: '123', username: 'testuser' };
    const mockNavigate = vi.fn();
    useNavigate.mockReturnValue(mockNavigate);

    render(
      <MemoryRouter>
        <NavBar user={mockUser} onLogout={vi.fn()} />
      </MemoryRouter>
    );

    await userEvent.tab();

    expect(document.activeElement).toBe(screen.getByLabelText('navigate-home'));

    await userEvent.keyboard('{Enter}');

    expect(mockNavigate).toHaveBeenCalledWith('/home');
  });
});
