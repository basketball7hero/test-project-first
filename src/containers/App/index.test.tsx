import React from 'react';
import { act, render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from '.';

jest.mock('../../api/posts', () => {
  const module = jest.requireActual('../../api/posts');
  return {
    __esModule: true,
    ...module,
    default: {
      ...module.default,
      list: jest.fn(() => Promise.resolve({
        "items": [
          {
            "userId": 1,
            "id": 1,
            "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
            "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
          },
          {
            "userId": 1,
            "id": 2,
            "title": "qui est esse",
            "body": "est rerum tempore vitae\nsequi sint nihil reprehenderit dolor beatae ea dolores neque\nfugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis\nqui aperiam non debitis possimus qui neque nisi nulla"
          },
          {
            "userId": 1,
            "id": 3,
            "title": "ea molestias quasi exercitationem repellat qui ipsa sit aut",
            "body": "et iusto sed quo iure\nvoluptatem occaecati omnis eligendi aut ad\nvoluptatem doloribus vel accusantium quis pariatur\nmolestiae porro eius odio et labore et velit aut"
          },
        ],
        "total": 3,
      })),
    }
  }
});

beforeEach( () => {
  render(<App />);
})

describe('render app', () => {
  it('check the title', () => {
    expect(document.querySelector('H1')).toHaveTextContent('Posts');
    expect(screen.queryByText('Posts')?.nodeName).toBe('H1');
  });

  it('check the form validation', async () => {
    const user = userEvent.setup();

    await act(async () => {
      await user.click(screen.getByText('Create Post'));
    });

    expect(document.querySelector('*[data-name="create-post-form"] input[name="title"] ~ div')).toHaveTextContent('title is a required field');
    expect(document.querySelector('*[data-name="create-post-form"] textarea[name="body"] ~ div')).toHaveTextContent('body is a required field');

    await act(async () => {
      await fireEvent.change(document.querySelector('*[data-name="create-post-form"] input[name="title"]')!, {target: {value: 'Lorem'}});
      await fireEvent.change(document.querySelector('*[data-name="create-post-form"] textarea[name="body"]')!, {target: {value: 'Lorem'}});
    });

    expect(document.querySelector('*[data-name="create-post-form"] input[name="title"] ~ div')!).toHaveTextContent('title must be at least 10 characters');
    expect(document.querySelector('*[data-name="create-post-form"] textarea[name="body"] ~ div')!).toHaveTextContent('body must be at least 50 characters');

    await act(async () => {
      await fireEvent.change(document.querySelector('*[data-name="create-post-form"] input[name="title"]')!, {target: {value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit Lorem ipsum dolor sit amet, consectetur adipiscing elit'}});
      await fireEvent.change(document.querySelector('*[data-name="create-post-form"] textarea[name="body"]')!, {target: {value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit Lorem ipsum dolor sit amet, consectetur adipiscing elit Lorem ipsum dolor sit amet consectetur adipiscing elit Lorem ipsum dolor sit amet, consectetur adipiscing elit Lorem ipsum dolor sit amet, consectetur adipiscing elit Lorem ipsum dolor sit amet consectetur adipiscing elit Lorem ipsum dolor sit amet, consectetur adipiscing elit Lorem ipsum dolor sit amet, consectetur adipiscing elit Lorem ipsum dolor sit amet consectetur adipiscing elit Lorem ipsum dolor sit amet, consectetur adipiscing elit'}});
    });

    expect(document.querySelector('*[data-name="create-post-form"] input[name="title"] ~ div')!).toHaveTextContent('title must be at most 50 characters');
    expect(document.querySelector('*[data-name="create-post-form"] textarea[name="body"] ~ div')!).toHaveTextContent('body must be at most 100 characters');

    await act(async () => {
      await fireEvent.change(document.querySelector('*[data-name="create-post-form"] input[name="title"]')!, {target: {value: 'Lorem ipsum dolor sit amet, consectetur adipiscing'}});
      await fireEvent.change(document.querySelector('*[data-name="create-post-form"] textarea[name="body"]')!, {target: {value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit Lorem ipsum dolor sit amet, consectetur adip'}});
    });

    expect(document.querySelector('*[data-name="create-post-form"] input[name="title"] ~ div')!).toHaveTextContent('');
    expect(document.querySelector('*[data-name="create-post-form"] textarea[name="body"] ~ div')!).toHaveTextContent('');
  });

  it('post will be created', async () => {
    const user = userEvent.setup();

    await act(async () => {
      await fireEvent.change(document.querySelector('*[data-name="create-post-form"] input[name="title"]')!, {target: {value: 'Lorem ipsum dolor sit amet, consectetur adipiscing'}});
      await fireEvent.change(document.querySelector('*[data-name="create-post-form"] textarea[name="body"]')!, {target: {value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit Lorem ipsum dolor sit amet, consectetur adip'}});
      await user.click(screen.getByText('Create Post'));
    });

    expect(document.querySelector<HTMLInputElement>('*[data-name="create-post-form"] input[name="title"]')?.value).toBe('');
    expect(document.querySelector<HTMLInputElement>('*[data-name="create-post-form"] textarea[name="body"]')?.value).toBe('');
    expect(document.querySelector('*[role="gridcell"][col-id="title"]')).toHaveTextContent('Lorem ipsum dolor sit amet, consectetur adipiscing');
    expect(document.querySelector('*[role="gridcell"][col-id="body"]')).toHaveTextContent('Lorem ipsum dolor sit amet, consectetur adipiscing elit Lorem ipsum dolor sit amet, consectetur adip');
  });

  it('post will be removed', async () => {
    expect(document.querySelector('*[data-name="remove-selected-posts"]')?.innerHTML).toBe('remove selected');

    const user = userEvent.setup();

    await act(async () => {
      // не смог разобраться почему тут клик не работает, я бы писал эти тесты на cypress, jest немного для другого
      await user.click(document.querySelector('*[role="row"][row-index="1"]')!);
    });

    expect(document.querySelector('*[data-name="remove-selected-posts"]')).toHaveTextContent('remove selected (1)');
    expect(document.querySelector('*[role="row"][row-index="1"]')).toHaveTextContent('qui est esse');

    await act(async () => {
      await user.click(document.querySelector('*[data-name="remove-selected-posts"]')!);
    });

    expect(document.querySelector('*[role="row"][row-index="1"]')).not.toHaveTextContent('qui est esse');
  });
});
