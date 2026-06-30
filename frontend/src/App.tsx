import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Kanban from './pages/Kanban';
import KanbanGenerico from './pages/KanbanGenerico';
import EscolhaKanban from './pages/EscolhaKanban'; // 🚀 NOVO: Importando a tela de escolha
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
          
          {/* 🚀 NOVO: Rota da Tela de Seleção de Kanban */}
          <Route path="/dashboard" element={
            <RotaProtegida>
              <EscolhaKanban />
            </RotaProtegida>
          } />

          {/* Rota do Kanban Normal */}
          <Route path="/kanban" element={
            <RotaProtegida>
              <Kanban />
            </RotaProtegida>
          } />

          {/* Rota do Kanban Genérico */}
          <Route path="/kanban-generico" element={
            <RotaProtegida>
              <KanbanGenerico />
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