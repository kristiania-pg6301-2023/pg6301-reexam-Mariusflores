import { fireEvent, render, screen } from '@testing-library/react';
import { CommentItem } from '../../src/components/CommentItem.jsx';

describe('Comment Item', () => {
  it('should render the list of elements if no comments are sent', () => {
    render(<CommentItem comment={{}} userLoggedIn={false} onDelete={null} />);

    expect(screen.getByLabelText('list item')).toBeInTheDocument();
  });

  test('it should call onDelete when delete button is clicked', () => {
    const mockOnDelete = vi.fn();
    const mockComment = { _id: '123' };

    render(<CommentItem comment={mockComment} userLoggedIn={true} onDelete={mockOnDelete} />);

    let deleteButton = screen.getByLabelText('delete comment button');
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith(mockComment._id);
  });
});
