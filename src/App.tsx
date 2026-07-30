import { AppRoutes } from './routes/routes';
import { AuthProvider } from './contexts/AutoContext';
import { BrowserRouter } from 'react-router-dom';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}