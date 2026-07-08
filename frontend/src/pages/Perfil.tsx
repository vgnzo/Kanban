import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Button from '../components/Button';

interface Board {
  id: string;
  nome: string;
  tipo: string;
  souDono: boolean;
  temAcesso: boolean;
  nivelAcesso: string | null;
}

const AVATARES = [
  'Aneka', 'Felix', 'Maria', 'Jocelyn', 'Aidan', 'Sara',
  'Leo', 'Nina', 'Gabriel', 'Luna', 'Diego', 'Valentina',
];

const urlAvatar = (seed: string) =>
  `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;

export default function Perfil() {
  // AQUI: Pegamos o setAvatar do contexto que vamos atualizar no AuthContext
  const { usuario, logout, setAvatar } = useAuth() as any;
  const navigate = useNavigate();

  const [boards, setBoards] = useState<Board[]>([]);
  const [carregando, setCarregando] = useState(true);
  
  // Usamos o avatar do usuário logado vindo do contexto
  const [avatarSelecionado, setAvatarSelecionado] = useState<string | null>(usuario?.avatar || null);
  const [salvandoAvatar, setSalvandoAvatar] = useState(false);
  const [mostrarGaleria, setMostrarGaleria] = useState(false);

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async () => {
    try {
      const res = await api.get('/api/boards');
      setBoards(res.data.filter((b: Board) => b.temAcesso));
    } catch {
      setBoards([]);
    } finally {
      setCarregando(false);
    }
  };

  const escolherAvatar = async (seed: string) => {
    setAvatarSelecionado(seed);
    setSalvandoAvatar(true);
    try {
      await api.patch('/api/auth/avatar', { avatar: seed });
      
      // AQUI: Chamamos a função do contexto para atualizar globalmente
      if (setAvatar) setAvatar(seed);
      
      setMostrarGaleria(false);
    } catch {
      alert('Não foi possível salvar o avatar.');
    } finally {
      setSalvandoAvatar(false);
    }
  };

  const inicial = (usuario?.nome || '?').charAt(0).toUpperCase();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      fontFamily: "'Segoe UI', sans-serif",
      display: 'flex',
      flexDirection: 'column'
    }}>
      <header style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <Button variant="ghost" onClick={() => navigate('/boards')}>← Voltar</Button>
        <div>
          <div style={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>Meu perfil</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Suas informações e quadros</div>
        </div>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 16px' }}>
        <div style={{ width: '100%', maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <div style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '28px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
          }}>
            <div
              onClick={() => setMostrarGaleria(!mostrarGaleria)}
              title="Trocar avatar"
              style={{
                width: '72px', height: '72px',
                borderRadius: '50%',
                background: avatarSelecionado ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #667eea, #764ba2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '30px', fontWeight: 600, color: 'white',
                flexShrink: 0, cursor: 'pointer',
                border: '2px solid rgba(255,255,255,0.2)',
                overflow: 'hidden'
              }}>
              {avatarSelecionado ? (
                <img src={urlAvatar(avatarSelecionado)} width="72" height="72" alt="avatar" />
              ) : inicial}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: 'white', fontSize: '20px', fontWeight: 600 }}>{usuario?.nome}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginTop: '2px' }}>{usuario?.email}</div>
              <button onClick={() => setMostrarGaleria(!mostrarGaleria)} style={{
                marginTop: '8px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px', color: 'rgba(255,255,255,0.8)',
                padding: '5px 12px', cursor: 'pointer', fontSize: '12px'
              }}>
                {mostrarGaleria ? 'Fechar' : '🎨 Trocar avatar'}
              </button>
            </div>
          </div>

          {mostrarGaleria && (
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '20px'
            }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '14px' }}>
                Escolha seu avatar {salvandoAvatar && '(salvando...)'}
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
                gap: '10px'
              }}>
                {AVATARES.map(seed => (
                  <div key={seed}
                    onClick={() => escolherAvatar(seed)}
                    style={{
                      cursor: 'pointer',
                      borderRadius: '12px',
                      padding: '6px',
                      background: 'rgba(255,255,255,0.06)',
                      border: avatarSelecionado === seed ? '2px solid #667eea' : '1px solid rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                    <img src={urlAvatar(seed)} width="56" height="56" alt="avatar" style={{ borderRadius: '50%' }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '14px' }}>
              Meus quadros ({boards.length})
            </div>
            {carregando ? (
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Carregando...</div>
            ) : boards.length === 0 ? (
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Você ainda não tem acesso a nenhum quadro.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {boards.map(board => (
                  <div key={board.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px', padding: '12px 14px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <span style={{ fontSize: '18px', flexShrink: 0 }}>{board.tipo === 'EQUIPAMENTOS' ? '🚜' : '📋'}</span>
                      <span style={{ color: 'white', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{board.nome}</span>
                    </div>
                    <span style={{
                      fontSize: '10px', flexShrink: 0,
                      background: board.souDono ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.12)',
                      color: 'white', padding: '3px 10px', borderRadius: '20px', letterSpacing: '0.4px'
                    }}>{board.souDono ? 'DONO' : (board.nivelAcesso === 'EDITAR' ? 'EDITAR' : 'VISUALIZAR')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex', flexDirection: 'column', gap: '10px'
          }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>Conta</div>
            <Button variant="secondary" onClick={() => navigate('/trocar-senha')} style={{ width: '100%' }}>🔑 Trocar senha</Button>
            <button onClick={logout} style={{
              width: '100%', padding: '11px',
              background: 'rgba(226,75,74,0.12)', border: '1px solid rgba(226,75,74,0.3)',
              borderRadius: '8px', color: '#ff7875', cursor: 'pointer', fontSize: '14px', fontWeight: 600
            }}>🚪 Sair</button>
          </div>
        </div>
      </div>
    </div>
  );
}