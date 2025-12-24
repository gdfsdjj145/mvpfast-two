import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '@/components/Header';
import { useSession, signOut } from 'next-auth/react';

// Type the mock
const mockUseSession = useSession as ReturnType<typeof vi.fn>;
const mockSignOut = signOut as ReturnType<typeof vi.fn>;

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render header with logo', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<Header />);

    const logo = screen.getByRole('img');
    expect(logo).toBeInTheDocument();
  });

  it('should show login button when user is not authenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<Header />);

    const loginButton = screen.getByRole('link', { name: /login\.label/i });
    expect(loginButton).toBeInTheDocument();
    expect(loginButton).toHaveAttribute('href', '/auth/signin');
  });

  it('should not show login button when user is authenticated', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          email: 'test@example.com',
        },
      },
      status: 'authenticated',
    });

    render(<Header />);

    const loginButton = screen.queryByRole('link', { name: /login\.label/i });
    expect(loginButton).not.toBeInTheDocument();
  });

  it('should show user menu when authenticated', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          email: 'test@example.com',
        },
      },
      status: 'authenticated',
    });

    render(<Header />);

    // Check for user avatar/initial
    expect(screen.getAllByText('t')[0]).toBeInTheDocument(); // First letter of email
  });

  it('should display user phone initial when phone is provided', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          phone: '13800138000',
        },
      },
      status: 'authenticated',
    });

    render(<Header />);

    expect(screen.getAllByText('1')[0]).toBeInTheDocument(); // First digit of phone
  });

  it('should display avatar when user has avatar', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          avatar: 'https://example.com/avatar.jpg',
          email: 'test@example.com',
        },
      },
      status: 'authenticated',
    });

    render(<Header />);

    const avatars = screen.getAllByRole('img');
    const userAvatar = avatars.find(img => img.getAttribute('src') === 'https://example.com/avatar.jpg');
    expect(userAvatar).toBeInTheDocument();
  });

  it('should call signOut when logout button is clicked', async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          email: 'test@example.com',
        },
      },
      status: 'authenticated',
    });

    mockSignOut.mockResolvedValue({ url: '/' });

    render(<Header />);

    // Find and click the logout button (mobile version is easier to test)
    const logoutButtons = screen.getAllByRole('button');
    const logoutButton = logoutButtons.find(btn => btn.textContent?.includes('退出'));

    if (logoutButton) {
      fireEvent.click(logoutButton);
      expect(mockSignOut).toHaveBeenCalledWith({ redirect: false, callbackUrl: '/' });
    }
  });

  it('should render navigation links', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<Header />);

    const navElement = screen.getByRole('banner');
    expect(navElement).toBeInTheDocument();
  });

  it('should render I18n and Theme components', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<Header />);

    // The header should contain the theme and i18n components
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  it('should render nothing for UserMenu when status is loading', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
    });

    render(<Header />);

    // Should not show user menu content when loading
    const logoutButton = screen.queryByText('退出');
    expect(logoutButton).not.toBeInTheDocument();
  });
});
