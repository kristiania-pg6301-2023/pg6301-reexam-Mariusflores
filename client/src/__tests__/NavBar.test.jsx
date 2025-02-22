import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';
import NavBar from '../components/NavBar';

describe('NavBar Component', () => {
  test('renders Home and Login link when user is not logged in', () => {
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

  test('renders Home, Post, Profile, and Logout when user is logged in', () => {
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

  test('calls onLogout when Logout button is clicked', () => {
    const mockUser = { id: '123', username: 'testuser' };
    const mockLogout = vi.fn();

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
});
