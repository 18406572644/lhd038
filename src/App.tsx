import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { cyberpunkTheme } from '@/theme/cyberpunk';
import { useTimelineApplier } from '@/hooks/useTimelineApplier';
import Workbench from '@/pages/Workbench';
import Templates from '@/pages/Templates';

function AppContent() {
  useTimelineApplier();
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Workbench />} />
        <Route path="/templates" element={<Templates />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <MantineProvider theme={cyberpunkTheme} defaultColorScheme="dark">
      <Notifications position="top-right" zIndex={1000} />
      <AppContent />
    </MantineProvider>
  );
}
