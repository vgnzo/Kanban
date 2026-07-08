import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Boards from './pages/Board';
import CriarBoard from './pages/CriarBoard';
import CriarCardGenerico from './pages/CriarCardGenerico';
import HistoricoGenerico from './pages/HistoricoGenerico';
import Kanban from './pages/Kanban';
import KanbanGenerico from './pages/KanbanGenerico';
import CriarCard from './pages/CriarCard';
import GerenciarUsuarios from './pages/GerenciarUsuarios';
import GerenciarEquipamentos from './pages/GerenciarEquipamentos';
import Historico from './pages/Historico';
import Solicitacoes from './pages/Solicitacoes';
import { useAuth } from './contexts/AuthContext';
import Perfil from './pages/Perfil';
import TrocarSenha from './pages/TrocarSenha';

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

          {/* tela inicial após login: seleção de quadros */}
          <Route path="/boards" element={
            <RotaProtegida>
              <Boards />
            </RotaProtegida>
          } />

          {/* criar quadro novo (só admin chega aqui pelo botão) */}
          <Route path="/criar-board" element={
            <RotaProtegida>
              <CriarBoard />
            </RotaProtegida>
          } />

          <Route path="/solicitacoes/:boardId" element={
            <RotaProtegida>
              <Solicitacoes />
            </RotaProtegida>
          } />

          {/* kanban de equipamentos, por board */}
          <Route path="/kanban/:boardId" element={
            <RotaProtegida>
              <Kanban />
            </RotaProtegida>
          } />

          {/* kanban genérico (tarefas), por board */}
          <Route path="/kanban-generico/:boardId" element={
            <RotaProtegida>
              <KanbanGenerico />
            </RotaProtegida>
          } />

          {/* criar tarefa num quadro genérico */}
          <Route path="/criar-card-generico/:boardId" element={
            <RotaProtegida>
              <CriarCardGenerico />
            </RotaProtegida>
          } />

          {/* histórico/arquivados de um quadro genérico */}
          <Route path="/historico-generico/:boardId" element={
            <RotaProtegida>
              <HistoricoGenerico />
            </RotaProtegida>
          } />

          <Route path="/criar-card/:boardId" element={
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

          <Route path="/perfil" element={
            <RotaProtegida>
              <Perfil />
            </RotaProtegida>
          } />
          <Route path="/trocar-senha" element={
            <RotaProtegida>
              <TrocarSenha />
            </RotaProtegida>
          } />

          {/* qualquer rota desconhecida vai pro login */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;