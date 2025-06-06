import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

test('allows selecting role and shows controls', async () => {
  render(<App />);
  const select = screen.getByLabelText(/select role/i);
  expect(select).toBeInTheDocument();
  await userEvent.selectOptions(select, 'judge');
  const button = screen.getByText(/score speaker/i);
  expect(button).toBeInTheDocument();
});
