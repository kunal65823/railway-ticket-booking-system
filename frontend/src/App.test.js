import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('react-router-dom', () => {
  const React = require('react');

  const Link = ({ children, to, ...props }) => React.createElement(
    'a',
    { href: typeof to === 'string' ? to : '#', ...props },
    children
  );

  return {
    BrowserRouter: ({ children }) => React.createElement(React.Fragment, null, children),
    Routes: ({ children }) => {
      const routes = React.Children.toArray(children);
      const route = routes.find((child) => child.props.path === '/') || routes[0];
      return route?.props.element || null;
    },
    Route: () => null,
    Navigate: ({ to }) => React.createElement('span', { 'data-to': to }, 'Redirect'),
    Link,
    useLocation: () => ({ pathname: '/' }),
    useNavigate: () => jest.fn(),
    useParams: () => ({}),
    useSearchParams: () => [new URLSearchParams(), jest.fn()],
  };
}, { virtual: true });

jest.mock('./pages/Home', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: () => React.createElement('div', null, 'Home route loaded'),
  };
});

test('renders the default app route', async () => {
  render(<App />);
  expect(await screen.findByText(/home route loaded/i)).toBeInTheDocument();
});
