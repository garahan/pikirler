'use client';
import AppShell, { useShell } from './components/AppShell';
import PageHeader from './components/PageHeader';
import Feed from './components/Feed';

function HomeFeed() {
  const { user, refreshKey } = useShell();
  return <Feed refreshSignal={refreshKey} authed={!!user} me={user ? { username: user.username, isAdmin: user.isAdmin } : null} />;
}

export default function Home() {
  return (
    <AppShell header={<PageHeader brand />}>
      <HomeFeed />
    </AppShell>
  );
}
