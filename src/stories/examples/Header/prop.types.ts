type User = {
  name: string;
};

interface HeaderProps {
  user?: User | undefined;
  onLogin?: () => void;
  onLogout?: () => void;
  onCreateAccount?: () => void;
}

export type { HeaderProps, User };
