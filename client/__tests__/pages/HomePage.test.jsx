import { vi } from 'vitest';
import { render, waitFor, screen } from '@testing-library/react';
import { HomePage } from '../../src/pages/HomePage.jsx';
import React from 'react';

vi.mock('../../src/utils/getApiUrl.js', () => ({
  api_url: 'http://localhost:8000',
}));

describe('HomePage', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              _id: '1',
              username: 'User1',
              content: 'Post 1',
              timestamp: '2024-02-25T12:00:00Z',
              reactions: [],
            },
            {
              _id: '2',
              username: 'User2',
              content: 'Post 2',
              timestamp: '2024-02-26T12:00:00Z',
              reactions: [],
            },
          ]),
      })
    );
  });

  it('should fetch posts from API and update state', async () => {
    const mockUser = { id: '2', username: 'testUser', verified: true };

    // Spy on React useState
    const setPostsSpy = vi.fn();
    vi.spyOn(React, 'useState').mockImplementation((init) => [init, setPostsSpy]);

    render(<HomePage user={mockUser} />);

    // Ensure fetch was called correctly
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/post/all', {
        method: 'GET',
        credentials: 'include',
      });
    });

    let post1 = await screen.findByText('Post 1');
    let post2 = await screen.findByText('Post 2');

    expect(post1).toBeInTheDocument();
    expect(post2).toBeInTheDocument();
  });
});
