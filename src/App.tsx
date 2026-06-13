import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { cyberpunkTheme } from '@/theme/cyberpunk';
import Workbench from '@/pages/Workbench';
import Templates from '@/pages/Templates';

export default function App() {
  return (
    <MantineProvider theme={cyberpunkTheme} defaultColorScheme="dark">
      <Notifications position="top-right" zIndex={1000} />
      <Router>
        <Routes>
          <Route path="/" element={<Workbench />} />
          <Route path="/templates" element={<Templates />} />
        </Routes>
      </Router>
    </MantineProvider>
  );
}
