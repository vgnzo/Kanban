import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface Board {
  id: string;
  nome: string;
  tipo: string;
}

export default function Boards() {
  const { usuario, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [excluindo, setExcluindo] = useState<string | null>(null);

  useEffect(() => {
    carregarBoards();
  }, []);

  const carregarBoards = async () => {
    try {
      const res = await api.get('/api/boards');
      setBoards(res.data);
    } finally {
      setLoading(false);
    }
  };

  const excluirBoard = async (e: React.MouseEvent, board: Board) => {
    e.stopPropagation();
    const confirmado = window.confirm(
      `Excluir o quadro "${board.nome}"?\n\nIsso apaga todas as colunas e cards deste quadro. Esta ação não pode ser desfeita.`
    );
    if (!confirmado) return;

    setExcluindo(board.id);
    try {
      await api.delete(`/api/boards/${board.id}`);
      await carregarBoards();
    } catch {
      alert('Não foi possível excluir o quadro.');
    } finally {
      setExcluindo(null);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      fontFamily: "'Segoe UI', sans-serif"
    }}>
      <header style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '14px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px'
          }}>⚙️</div>
          <div style={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>Meus Kanbans</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'white', fontSize: '13px', fontWeight: 500 }}>{usuario?.nome}</div>
            <div style={{
              fontSize: '10px',
              background: usuario?.perfil === 'ADMIN' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.15)',
              color: 'white', padding: '2px 8px', borderRadius: '20px',
              display: 'inline-block', marginTop: '2px'
            }}>{usuario?.perfil}</div>
          </div>
          <button onClick={logout} style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.7)',
            padding: '8px 16px', borderRadius: '8px',
            cursor: 'pointer', fontSize: '13px'
          }}>Sair</button>
        </div>
      </header>

      <div style={{ padding: '32px 28px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ color: 'white', fontSize: '22px', margin: 0 }}>Escolha um quadro</h1>
          {isAdmin() && (
            <button onClick={() => navigate('/criar-board')} style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              border: 'none', color: 'white',
              padding: '10px 18px', borderRadius: '8px',
              cursor: 'pointer', fontSize: '14px', fontWeight: 600
            }}>+ Novo quadro</button>
          )}
        </div>

        {loading ? (
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Carregando...</p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '16px'
          }}>
            {boards.map((board) => {
              const podeExcluir = isAdmin() && board.tipo !== 'EQUIPAMENTOS';
              return (
                <div key={board.id}
                  onClick={() => navigate(
                    board.tipo === 'EQUIPAMENTOS'
                      ? `/kanban/${board.id}`
                      : `/kanban-generico/${board.id}`
                  )}
                  style={{
                    position: 'relative',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    padding: '24px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    opacity: excluindo === board.id ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                >
                  {podeExcluir && (
                    <button
                      onClick={(e) => excluirBoard(e, board)}
                      disabled={excluindo === board.id}
                      title="Excluir quadro"
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '28px',
                        height: '28px',
                        background: 'rgba(226,75,74,0.15)',
                        border: '1px solid rgba(226,75,74,0.3)',
                        borderRadius: '8px',
                        color: '#ff7875',
                        cursor: 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        lineHeight: 1,
                        padding: 0
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(226,75,74,0.3)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(226,75,74,0.15)'; }}
                    >
                      🗑
                    </button>
                  )}
                  <div style={{
                    width: '44px', height: '44px',
                    background: board.tipo === 'EQUIPAMENTOS'
                      ? 'linear-gradient(135deg, #E24B4A, #BA7517)'
                      : 'linear-gradient(135deg, #667eea, #764ba2)',
                    borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '22px', marginBottom: '14px'
                  }}>{board.tipo === 'EQUIPAMENTOS' ? '🚜' : '📋'}</div>
                  <div style={{ color: 'white', fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                    {board.nome}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                    {board.tipo === 'EQUIPAMENTOS' ? 'Quadro de equipamentos' : 'Quadro personalizado'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}