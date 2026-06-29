import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Kanban from './pages/Kanban';
import CriarCard from './pages/CriarCard';
import GerenciarUsuarios from './pages/GerenciarUsuarios';
import GerenciarEquipamentos from './pages/GerenciarEquipamentos';
import Historico from './pages/Historico';
import { useAuth } from './contexts/AuthContext';

function RotaProtegida({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  return token ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/kanban" element={
            <RotaProtegida>
              <Kanban />
            </RotaProtegida>
          } />
          <Route path="/criar-card" element={
            <RotaProtegida>
              <CriarCard />
            </RotaProtegida>
          } />
          <Route path="/usuarios" element={
            <RotaProtegida>
              <GerenciarUsuarios />
            </RotaProtegida>
          } />
          <Route path="/equipamentos" element={
            <RotaProtegida>
              <GerenciarEquipamentos />
            </RotaProtegida>
          } />
          <Route path="/historico" element={
            <RotaProtegida>
              <Historico />
            </RotaProtegida>
          } />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;