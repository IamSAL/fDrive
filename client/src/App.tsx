import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { CreateEndpoint } from './pages/CreateEndpoint';
import { EditEndpoint } from './pages/EditEndpoint';
import { Settings } from './pages/Settings';
import { LiveMock } from './pages/LiveMock';
import { useAppStore } from './store/store';
import { MonacoPreload } from './components/MonacoPreload';

function App() {
  const { theme, setTheme } = useAppStore();

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'system';
    setTheme(savedTheme);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        document.documentElement.classList.toggle('dark', mediaQuery.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, setTheme]);

  return (
    <Router>
      <MonacoPreload />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <Header />
        <main className="pb-12">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreateEndpoint />} />
            <Route path="/edit/:id" element={<EditEndpoint />} />
            <Route path="/live" element={<LiveMock />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: 'white',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: 'white',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;