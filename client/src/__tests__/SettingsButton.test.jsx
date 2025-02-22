import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SettingsButton from '../components/SettingsButton';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest'; // Use vi from Vitest

describe('SettingsButton Component', () => {
  let mockUser, mockSetUser;

  beforeEach(() => {
    mockUser = { username: 'testuser', verified: false };
    mockSetUser = vi.fn();

    // Mock fetch globally before each test
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Username updated' }),
      })
    );
  });

  test('calls API when saving new username', async () => {
    render(<SettingsButton user={mockUser} setUser={mockSetUser} />);

    // Open settings menu
    fireEvent.click(screen.getByRole('button'));

    // Click "Change Username"
    fireEvent.click(await screen.findByText('Change Username'));

    // Ensure the input field appears
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();

    // Type new username
    await userEvent.clear(input);
    await userEvent.type(input, 'newUsername');

    // Ensure the input value is updated correctly
    expect(input).toHaveValue('newUsername');

    // Click "Save" button
    fireEvent.click(screen.getByText('Save'));

    // Wait for fetch API to be called
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    // Ensure fetch was called with the correct API URL and data
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/user/change-username'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newUsername: 'newUsername' }),
      })
    );
  });
});
