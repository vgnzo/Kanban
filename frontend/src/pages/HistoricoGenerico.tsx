import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button';
import Timeline from '../components/Timeline';

interface Card {
  id: string;
  titulo: string;
  descricao: string;
  colunaNome: string;
  corColuna: string;
  valorExtra1: string | null;
  valorExtra2: string | null;
  valorExtra3: string | null;
}

interface Board {
  id: string;
  nome: string;
  campoExtra1: string | null;
  campoExtra2: string | null;
  campoExtra3: string | null;
  nivelAcesso: string | null;
}

export default function HistoricoGenerico() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();

  const [board, setBoard] = useState<Board | null>(null);
  const [nivelAcesso, setNivelAcesso] = useState<string | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [selecionado, setSelecionado] = useState<Card | null>(null);
  const [historico, setHistorico] = useState<any[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [desarquivando, setDesarquivando] = useState(false);

  // pode desarquivar se tem nível EDITAR neste quadro
  const podeEditar = nivelAcesso === 'EDITAR';

  useEffect(() => {
    if (boardId) carregar();
  }, [boardId]);

  const carregar = async () => {
    try {
   const [resBoard, resCards] = await Promise.all([
  api.get(`/api/boards/${boardId}`),
  api.get(`/api/cards/board/${boardId}/arquivados`),
]);
setBoard(resBoard.data);
setNivelAcesso(resBoard.data?.nivelAcesso || null);
      setCards(resCards.data);
    } catch {
      setCards([]);
    }
  };

  // campos extras que o board nomeou (cruza nome do board + valor do card)
  const campos = [
    { nome: board?.campoExtra1, chave: 'valorExtra1' as const },
    { nome: board?.campoExtra2, chave: 'valorExtra2' as const },
    { nome: board?.campoExtra3, chave: 'valorExtra3' as const },
  ].filter(c => c.nome);

  const abrirCard = async (card: Card) => {
    setSelecionado(card);
    setHistorico([]);
    setLoadingHistorico(true);
    try {
      const res = await api.get(`/api/historico/card/${card.id}`);
      setHistorico(res.data);
    } catch {
      setHistorico([]);
    } finally {
      setLoadingHistorico(false);
    }
  };

  const fechar = () => {
    setSelecionado(null);
    setHistorico([]);
  };

  const desarquivar = async () => {
    if (!selecionado || !podeEditar) return;
    setDesarquivando(true);
    try {
      await api.patch(`/api/cards/${selecionado.id}/desarquivar`);
      fechar();
      await carregar(); // recarrega a lista — o card desarquivado sai dos arquivados
    } catch {
      alert('Não foi possível desarquivar a tarefa.');
    } finally {
      setDesarquivando(false);
    }
  };

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
        <Button variant="ghost" onClick={() => navigate(`/kanban-generico/${boardId}`)}>← Voltar</Button>
        <div>
          <div style={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>Histórico</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>
            {board?.nome ? `${board.nome} · tarefas arquivadas` : 'Tarefas arquivadas'}
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 16px' }}>
        <div style={{
          width: '100%',
          maxWidth: '720px',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {cards.map(card => (
              <div key={card.id} onClick={() => abrirCard(card)} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderLeft: `3px solid ${card.corColuna}`,
                borderRadius: '10px',
                padding: '14px 16px',
                cursor: 'pointer'
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>{card.titulo}</div>
                  {campos.map(campo => {
                    const valor = card[campo.chave];
                    if (!valor) return null;
                    return (
                      <div key={campo.chave} style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '2px' }}>
                        {campo.nome}: <span style={{ color: 'rgba(255,255,255,0.6)' }}>{valor}</span>
                      </div>
                    );
                  })}
                </div>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '18px', flexShrink: 0 }}>›</span>
              </div>
            ))}

            {cards.length === 0 && (
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', textAlign: 'center', padding: '24px' }}>
                Nenhuma tarefa arquivada ainda.
              </div>
            )}
          </div>
        </div>
      </div>

      {selecionado && (
        <div onClick={fechar} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '16px',
            padding: '28px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <h3 style={{ color: 'white', margin: 0, fontSize: '18px' }}>{selecionado.titulo}</h3>
              <Button variant="icon" onClick={fechar}>×</Button>
            </div>

            {selecionado.descricao && (
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px', padding: '10px 14px', marginBottom: '20px'
              }}>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  Descrição
                </div>
                <div style={{ color: 'white', fontSize: '13px' }}>{selecionado.descricao}</div>
              </div>
            )}

            {/* botão desarquivar — só pra quem tem EDITAR */}
            {podeEditar && (
              <div style={{ marginBottom: '20px' }}>
                <Button variant="primary" disabled={desarquivando} onClick={desarquivar} style={{ width: '100%' }}>
                  {desarquivando ? 'Desarquivando...' : '↩ Desarquivar tarefa'}
                </Button>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: '8px 0 0', textAlign: 'center' }}>
                  A tarefa volta para o quadro, na coluna onde estava.
                </p>
              </div>
            )}

            <div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Histórico completo
              </div>
              <Timeline historico={historico} loading={loadingHistorico} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}