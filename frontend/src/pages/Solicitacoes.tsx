import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button';

interface Solicitacao {
  id: string;
  nomeSolicitante: string;
  setor: string | null;
  email: string;
  status: string;
  criadoEm: string;
}

export default function Solicitacoes() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();

  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState<string | null>(null);

  // pop-up de aprovação
  const [aprovando, setAprovando] = useState<Solicitacao | null>(null);
  const [nivel, setNivel] = useState<'VISUALIZAR' | 'EDITAR'>('VISUALIZAR');

  useEffect(() => {
    if (boardId) carregar();
  }, [boardId]);

  const carregar = async () => {
    setCarregando(true);
    try {
      const res = await api.get(`/api/acesso/pendentes/${boardId}`);
      setSolicitacoes(res.data);
    } catch {
      setSolicitacoes([]);
    } finally {
      setCarregando(false);
    }
  };

  const confirmarAprovacao = async () => {
    if (!aprovando) return;
    setProcessando(aprovando.id);
    try {
      await api.patch(`/api/acesso/aprovar/${aprovando.id}`, { nivel });
      setAprovando(null);
      await carregar();
    } catch {
      alert('Não foi possível aprovar a solicitação.');
    } finally {
      setProcessando(null);
    }
  };

  const recusar = async (sol: Solicitacao) => {
    const ok = window.confirm(`Recusar a solicitação de ${sol.nomeSolicitante}?`);
    if (!ok) return;
    setProcessando(sol.id);
    try {
      await api.patch(`/api/acesso/recusar/${sol.id}`);
      await carregar();
    } catch {
      alert('Não foi possível recusar a solicitação.');
    } finally {
      setProcessando(null);
    }
  };

  const formatarData = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return '';
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
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <Button variant="ghost" onClick={() => navigate(-1)}>← Voltar</Button>
        <div>
          <div style={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>Solicitações de acesso</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Pedidos pendentes deste quadro</div>
        </div>
      </header>

      <div style={{ padding: '32px 16px', maxWidth: '760px', margin: '0 auto' }}>
        {carregando ? (
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Carregando...</p>
        ) : solicitacoes.length === 0 ? (
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center',
            color: 'rgba(255,255,255,0.4)',
            fontSize: '14px'
          }}>
            Nenhuma solicitação pendente no momento.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {solicitacoes.map((sol) => (
              <div key={sol.id} style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '18px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap',
                opacity: processando === sol.id ? 0.5 : 1
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: 'white', fontSize: '15px', fontWeight: 600 }}>
                    {sol.nomeSolicitante}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '2px' }}>
                    {sol.email}{sol.setor ? ` · ${sol.setor}` : ''}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', marginTop: '4px' }}>
                    Pedido em {formatarData(sol.criadoEm)}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button
                    onClick={() => recusar(sol)}
                    disabled={processando === sol.id}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(226,75,74,0.15)',
                      border: '1px solid rgba(226,75,74,0.3)',
                      borderRadius: '8px',
                      color: '#ff7875',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600
                    }}
                  >
                    Recusar
                  </button>
                  <button
                    onClick={() => { setAprovando(sol); setNivel('VISUALIZAR'); }}
                    disabled={processando === sol.id}
                    style={{
                      padding: '8px 16px',
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600
                    }}
                  >
                    Aprovar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* pop-up de aprovação com escolha de nível */}
      {aprovando && (
        <div onClick={() => setAprovando(null)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '16px', padding: '28px', width: '90%', maxWidth: '420px'
          }}>
            <h3 style={{ color: 'white', margin: '0 0 6px' }}>Aprovar acesso</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: '0 0 20px' }}>
              Liberar acesso para <strong style={{ color: 'rgba(255,255,255,0.8)' }}>{aprovando.nomeSolicitante}</strong>. Qual nível?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 16px',
                background: nivel === 'VISUALIZAR' ? 'rgba(102,126,234,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${nivel === 'VISUALIZAR' ? 'rgba(102,126,234,0.5)' : 'rgba(255,255,255,0.12)'}`,
                borderRadius: '10px', cursor: 'pointer'
              }}>
                <input type="radio" name="nivel" checked={nivel === 'VISUALIZAR'}
                  onChange={() => setNivel('VISUALIZAR')} />
                <div>
                  <div style={{ color: 'white', fontSize: '14px', fontWeight: 600 }}>👁 Visualizar</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Pode ver os cards, mas não editar</div>
                </div>
              </label>

              <label style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 16px',
                background: nivel === 'EDITAR' ? 'rgba(102,126,234,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${nivel === 'EDITAR' ? 'rgba(102,126,234,0.5)' : 'rgba(255,255,255,0.12)'}`,
                borderRadius: '10px', cursor: 'pointer'
              }}>
                <input type="radio" name="nivel" checked={nivel === 'EDITAR'}
                  onChange={() => setNivel('EDITAR')} />
                <div>
                  <div style={{ color: 'white', fontSize: '14px', fontWeight: 600 }}>✏️ Editar</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Pode criar, mover e editar cards</div>
                </div>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setAprovando(null)} style={{
                flex: 1, padding: '11px', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px',
                color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '14px'
              }}>Cancelar</button>
              <button onClick={confirmarAprovacao} disabled={processando === aprovando.id} style={{
                flex: 2, padding: '11px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                border: 'none', borderRadius: '8px', color: 'white',
                cursor: 'pointer', fontSize: '14px', fontWeight: 600
              }}>{processando === aprovando.id ? 'Aprovando...' : 'Confirmar aprovação'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}