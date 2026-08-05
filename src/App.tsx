import { AppRoutes } from './routes/routes';
import { AuthProvider } from './contexts/AutoContext';
import { BrowserRouter } from 'react-router-dom';
import { SessaoProvider } from './contexts/SessaoContext';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SessaoProvider>
        <AppRoutes />
        </SessaoProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}