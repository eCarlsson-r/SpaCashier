import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageSwitcher } from "../LanguageSwitcher";
import { LocaleProvider } from '@/providers/locale-provider';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the current locale', () => {
    localStorageMock.getItem.mockReturnValue('en');
    render(
      <LocaleProvider>
        <LanguageSwitcher />
      </LocaleProvider>
    );
    expect(screen.getByText('EN')).toBeInTheDocument();
  });

  it('calls switchLocale with "id" when Indonesian is selected', async () => {
    const user = userEvent.setup();
    localStorageMock.getItem.mockReturnValue('en');
    render(
      <LocaleProvider>
        <LanguageSwitcher />
      </LocaleProvider>
    );

    const trigger = screen.getByRole('button');
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('Bahasa Indonesia')).toBeInTheDocument();
    });

    const indonesianOption = screen.getByText('Bahasa Indonesia');
    await user.click(indonesianOption);

    expect(localStorageMock.setItem).toHaveBeenCalledWith('spa-locale', 'id');
  });

  it('calls switchLocale with "en" when English is selected', async () => {
    const user = userEvent.setup();
    localStorageMock.getItem.mockReturnValue('id');
    render(
      <LocaleProvider>
        <LanguageSwitcher />
      </LocaleProvider>
    );

    const trigger = screen.getByRole('button');
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument();
    });

    const englishOption = screen.getByText('English');
    await user.click(englishOption);

    expect(localStorageMock.setItem).toHaveBeenCalledWith('spa-locale', 'en');
  });

  it('defaults to "en" when no locale is stored', () => {
    localStorageMock.getItem.mockReturnValue(null);
    render(
      <LocaleProvider>
        <LanguageSwitcher />
      </LocaleProvider>
    );
    expect(screen.getByText('EN')).toBeInTheDocument();
  });
});