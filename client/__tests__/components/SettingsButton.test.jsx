import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import SettingsButton from '../../src/components/SettingsButton';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { toast } from 'react-toastify'; // Use vi from Vitest

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('SettingsButton Component', () => {
  let mockUser, mockSetUser;

  beforeEach(() => {
    mockUser = { username: 'testuser', verified: false };
    mockSetUser = vi.fn();

    // Mock global fetch
    global.fetch = vi.fn((url) => {
      if (url.includes('/user/change-username')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Username updated' }),
        });
      }
      if (url.includes('/user/verify')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'You are now verified' }),
        });
      }
      return Promise.reject(new Error('Network error'));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders settings button and opens menu on click', async () => {
    render(<SettingsButton user={mockUser} setUser={mockSetUser} />);

    const settingsButton = screen.getByLabelText('settings-button');
    expect(settingsButton).toBeInTheDocument();

    fireEvent.click(settingsButton);

    expect(await screen.findByLabelText('change-username')).toBeInTheDocument();
    expect(screen.getByLabelText('verify')).toBeInTheDocument();
  });

  it('opens and closes the username change popup ', async () => {
    render(<SettingsButton user={mockUser} setUser={mockSetUser} />);

    fireEvent.click(screen.getByLabelText('settings-button'));

    fireEvent.click(await screen.findByLabelText('change-username'));

    expect(await screen.findByText('Enter new username')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('cancel-change-username'));

    await waitFor(() => {
      expect(screen.queryByText('Enter new username')).not.toBeInTheDocument();
    });
  });

  it('shows error when trying to save an empty username', async () => {
    render(<SettingsButton user={mockUser} setUser={mockSetUser} />);

    fireEvent.click(screen.getByLabelText('settings-button')); // Open settings menu
    fireEvent.click(await screen.findByLabelText('change-username')); // Open username change popup

    await userEvent.clear(await screen.getByRole('textbox'));

    fireEvent.click(screen.getByLabelText('save-username')); // Click save with empty input

    // Check that toast.error was called at all
    await waitFor(() => expect(toast.error).toHaveBeenCalled());

    // Check the exact message
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Username can't be empty."));
  });

  test('calls API when saving new username', async () => {
    render(<SettingsButton user={mockUser} setUser={mockSetUser} />);

    // Open settings menu
    fireEvent.click(screen.getByLabelText('settings-button'));

    // Click "Change Username"
    fireEvent.click(await screen.findByLabelText('change-username'));

    // Ensure the input field appears
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();

    // Type new username
    await userEvent.clear(input);
    await userEvent.type(input, 'newUsername');

    // Ensure the input value is updated correctly
    expect(input).toHaveValue('newUsername');

    // Click "Save" button
    fireEvent.click(screen.getByLabelText('save-username'));

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

  it('verifies user when "Become Verified" is clicked ', async () => {
    render(<SettingsButton user={mockUser} setUser={mockSetUser} />);

    fireEvent.click(screen.getByLabelText('settings-button'));
    fireEvent.click(await screen.getByLabelText('verify'));

    expect(
      await screen.findByText('Are you sure you want to become verified?')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('confirm-verify'));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/user/verify'),
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        })
      )
    );

    // 🔥 Fix: Allow state updater function and simulate state update
    expect(mockSetUser).toHaveBeenCalledWith(expect.any(Function));

    const updateFunction = mockSetUser.mock.calls[0][0]; // Get first call argument
    expect(updateFunction(mockUser)).toEqual({ username: 'testuser', verified: true });

    expect(toast.success).toHaveBeenCalledWith('You are now verified');
  });

  it('handles verification failure correctly', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Verification failed' }),
      })
    );

    render(<SettingsButton user={mockUser} setUser={mockSetUser} />);

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(await screen.getByLabelText('verify'));

    fireEvent.click(screen.getByLabelText('confirm-verify'));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Verification failed'));
    expect(mockSetUser).not.toHaveBeenCalled();
  });

  it('closes modals correctly', async () => {
    render(<SettingsButton user={mockUser} setUser={mockSetUser} />);
    fireEvent.click(screen.getByLabelText('settings-button'));
    fireEvent.click(await screen.getByLabelText('change-username'));

    expect(await screen.findByText('Enter new username')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('cancel-change-username'));

    await waitFor(() => {
      expect(screen.queryByText('Enter new username')).not.toBeInTheDocument();
    });

    fireEvent.click(await screen.findByLabelText('verify'));

    expect(await screen.getByText('Are you sure you want to become verified?')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('cancel-verify'));

    await waitFor(() => {
      expect(
        screen.queryByText('Are you sure you want to become verified?')
      ).not.toBeInTheDocument();
    });
  });
});
