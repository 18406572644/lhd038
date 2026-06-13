import { useEffect } from 'react';
import { AppShell, NavLink } from '@mantine/core';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { LayoutDashboard, BookTemplate } from 'lucide-react';

const NAV_ITEMS = [
  { label: '工作台', to: '/', icon: LayoutDashboard },
  { label: '模板库', to: '/templates', icon: BookTemplate },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const orbitron = document.createElement('link');
    orbitron.rel = 'stylesheet';
    orbitron.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap';
    document.head.appendChild(orbitron);

    const rajdhani = document.createElement('link');
    rajdhani.rel = 'stylesheet';
    rajdhani.href = 'https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&display=swap';
    document.head.appendChild(rajdhani);

    return () => {
      document.head.removeChild(orbitron);
      document.head.removeChild(rajdhani);
    };
  }, []);

  return (
    <AppShell
      header={{ height: 56 }}
      padding={0}
      styles={{
        root: {
          backgroundColor: '#0A0A14',
          minHeight: '100vh',
        },
        header: {
          backgroundColor: 'rgba(10, 10, 20, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 240, 255, 0.1)',
        },
        main: {
          backgroundColor: '#0A0A14',
          height: 'calc(100vh - 56px)',
          overflow: 'hidden',
        },
      }}
    >
      <AppShell.Header className="flex items-center justify-between px-6">
        <div
          className="text-xl font-bold tracking-widest"
          style={{
            fontFamily: 'Orbitron, sans-serif',
            color: '#FF2E97',
            textShadow: '0 0 10px rgba(255, 46, 151, 0.6), 0 0 20px rgba(255, 46, 151, 0.3)',
          }}
        >
          CYBER LIGHT SHOW
        </div>
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <RouterNavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all duration-200 rounded ${
                  isActive
                    ? 'text-[#00F0FF]'
                    : 'text-gray-400 hover:text-gray-200'
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? {
                      textShadow: '0 0 8px rgba(0, 240, 255, 0.5)',
                      borderBottom: '2px solid #00F0FF',
                      boxShadow: '0 2px 8px rgba(0, 240, 255, 0.3)',
                    }
                  : {}
              }
            >
              <item.icon size={16} />
              {item.label}
            </RouterNavLink>
          ))}
        </nav>
      </AppShell.Header>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
