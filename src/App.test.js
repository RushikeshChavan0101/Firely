import { render, screen } from '@testing-library/react';
import App from './App';

test('renders join room button', () => {
  render(<App />);
  const button = screen.getByRole('button', { name: /join room/i });
  expect(button).toBeInTheDocument();
});
