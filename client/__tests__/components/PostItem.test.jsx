import PostItem from '../../src/components/PostItem.jsx';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { toast } from 'react-toastify';

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('PostItem Component', () => {
  const mockPost = {
    _id: '1234',
    username: 'Ola Nordmann',
    content: 'This is a test post',
    timestamp: '2024-02-25T12:00:00Z',
    reactions: [
      { userId: '1', reaction: '👍' },
      { userId: '2', reaction: '❤️' },
    ],
  };

  const mockOnDelete = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnReact = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders post content and username correctly', () => {
    render(
      <PostItem
        userLoggedIn={true}
        post={mockPost}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onReact={mockOnReact}
      />
    );

    expect(screen.getByText('Ola Nordmann')).toBeInTheDocument();
    expect(screen.getByText('This is a test post')).toBeInTheDocument();
    expect(screen.getByText('Show Reactions')).toBeInTheDocument();
  });

  it('toggles the dropdown menu when button is clicked', () => {
    render(
      <PostItem
        userLoggedIn={true}
        post={mockPost}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onReact={mockOnReact}
      />
    );

    const menuButton = screen.getByLabelText('More options');

    fireEvent.click(menuButton);

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <PostItem
        userLoggedIn={true}
        post={mockPost}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onReact={mockOnReact}
      />
    );

    const menuButton = screen.getByLabelText('More options');
    fireEvent.click(menuButton);

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith('1234');
  });

  it('switches to edit mode when edit button is clicked', () => {
    render(
      <PostItem
        userLoggedIn={true}
        post={mockPost}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onReact={mockOnReact}
      />
    );

    const menuButton = screen.getByLabelText('More options');
    fireEvent.click(menuButton);

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(screen.getByRole('textbox')).toHaveValue('This is a test post');
  });

  it('saves edited post when save button is clicked', async () => {
    render(
      <PostItem
        userLoggedIn={true}
        post={mockPost}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onReact={mockOnReact}
      />
    );

    const menuButton = screen.getByLabelText('More options');
    fireEvent.click(menuButton);

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'updated post content' } });

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => expect(mockOnEdit).toHaveBeenCalledWith('1234', 'updated post content'));
  });

  it('shows error toast when trying to save empty content', async () => {
    render(
      <PostItem
        userLoggedIn={true}
        post={mockPost}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onReact={mockOnReact}
      />
    );

    const menuButton = screen.getByLabelText('More options');
    fireEvent.click(menuButton);

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '' } });

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Content required.'));
    expect(mockOnEdit).not.toHaveBeenCalled();
  });

  it('calls onReact when a reaction button is clicked', async () => {
    render(
      <PostItem
        userLoggedIn={true}
        post={mockPost}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onReact={mockOnReact}
      />
    );

    const reactionButton = screen.getByRole('button', { name: /👍/i });
    fireEvent.click(reactionButton);

    await waitFor(() => expect(mockOnReact).toHaveBeenCalledWith('1234', '👍'));
  });

  it('does not show reaction button for non-logged-in users', () => {
    render(
      <PostItem
        userLoggedIn={false}
        post={mockPost}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onReact={mockOnReact}
      />
    );

    expect(screen.queryByText('Show Reactions')).not.toBeInTheDocument();
  });

  it('opens and closes reactions popup', async () => {
    render(
      <PostItem
        userLoggedIn={true}
        post={mockPost}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        onReact={mockOnReact}
      />
    );

    // Click the button to show reactions
    const reactionsPopupButton = screen.getByText('Show Reactions');
    fireEvent.click(reactionsPopupButton);

    // Wait for the reactions popup to appear
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Reactions/i })).toBeInTheDocument();
    });

    // Close the popup
    const closeButton = screen.getByLabelText('close');
    fireEvent.click(closeButton);

    // Wait for the popup to disappear
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /Reactions/i })).not.toBeInTheDocument();
    });
  });
});
