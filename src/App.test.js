import { render, screen } from '@testing-library/react';
import App from './App';

test('renders role selection', () => {
  render(<App />);
  const select = screen.getByTestId('role-select');
  expect(select).toBeInTheDocument();
});
