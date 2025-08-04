import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Index from './pages/Index';
import Login from './pages/Login'; // 1. Importe a nova página de Login

// Componente para proteger rotas que exigem login
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Componente para rotas públicas (como login), que redireciona se o usuário já estiver logado
function PublicRoute({ children }: { children: JSX.Element }) {
    const { user, loading } = useAuth();
  
    if (loading) {
      return <div>Carregando...</div>;
    }
  
    if (user) {
      return <Navigate to="/" replace />;
    }
  
    return children;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rota para a página principal, protegida */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            }
          />
          
          {/* 2. Ative a rota para a página de login, agora protegida por PublicRoute */}
          <Route 
            path="/login" 
            element={
                <PublicRoute>
                    <Login />
                </PublicRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;