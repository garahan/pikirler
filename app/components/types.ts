export type PublicUser = {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
  bio: string | null;
  isBot: boolean;
  isAdmin: boolean;
};
