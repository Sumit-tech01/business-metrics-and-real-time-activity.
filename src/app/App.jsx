import { AppRouter } from '../router/AppRouter';
import { Toaster } from 'react-hot-toast';
import { useAuthInitialization } from '../hooks/useAuthInitialization';
import { useTheme } from '../hooks/useTheme';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

function App() {
  useAuthInitialization();
  useTheme();

  return (
    <ErrorBoundary>
      <AppRouter />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: '#0f172a',
            color: '#f8fafc',
          },
        }}
      />
    </ErrorBoundary>
  );
}

export default App;
