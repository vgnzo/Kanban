import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Button from '../components/Button';

interface Coluna {
  id: string;
  nome: string;
  cor: string;
  ordem: number;
}

interface Card {
  id: string;
  titulo: string;
  descricao: string;
  frota: string;
  modelo: string;
  unidade: string;
  frotaReserva: string | null;
  colunaId: string;
  colunaNome: string;
  corColuna: string;
  responsavelNome: string | null;
  previsaoLiberacao: string | null;
}

interface Historico {
  id: string;
  usuarioNome: string;
  colunaOrigem: string | null;
  colunaDestino: string | null;
  observacao: string;
  criadoEm: string;
}

export default function Kanban() {
  const { usuario, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [colunas, setColunas] = useState<Coluna[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [cardSelecionado, setCardSelecionado] = useState<Card | null>(null);
  const [historico, setHistorico] = useState<Historico[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [arquivando, setArquivando] = useState(false);

  useEffect(() => { carregarDados(); }, []);

  const carregarDados = async () => {
    const [resColunas, resCards] = await Promise.all([
      api.get('/api/colunas'),
      api.get('/api/cards'),
    ]);
    setColunas(resColunas.data);
    setCards(resCards.data);
  };

  const abrirCard = async (card: Card) => {
    setCardSelecionado(card);
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

  const fecharCard = () => {
    setCardSelecionado(null);
    setHistorico([]);
  };

  const moverCard = async (cardId: string, novaColunaId: string) => {
    if (!isAdmin()) return;
    await api.patch(`/api/cards/${cardId}/mover/${novaColunaId}`);
    await carregarDados();
    fecharCard();
  };

  const arquivarCard = async (cardId: string) => {
    if (!isAdmin()) return;
    setArquivando(true);
    try {
      await api.patch(`/api/cards/${cardId}/arquivar`);
      await carregarDados();
      fecharCard();
    } finally {
      setArquivando(false);
    }
  };

  const cardsDaColuna = (colunaId: string) =>
    cards.filter((c) => c.colunaId === colunaId);

  const formatarData = (iso: string) => {
    const d = new Date(iso);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const hora = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dia}/${mes} ${hora}:${min}`;
  };

  const corDaColuna = (nome: string | null) => {
    const col = colunas.find(c => c.nome === nome);
    return col ? col.cor : 'rgba(255,255,255,0.4)';
  };

  return (
    <div style={{
      height: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      fontFamily: "'Segoe UI', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <header style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px'
          }}>⚙️</div>
          <div>
            <div style={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>Kanban Equipamentos</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Gestão de equipamentos parados</div>
          </div>
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

          <Button variant="secondary" onClick={() => navigate('/historico')}>Histórico</Button>

          {isAdmin() && (
            <Button variant="secondary" onClick={() => navigate('/usuarios')}>Usuários</Button>
          )}

          <Button variant="secondary" onClick={logout}>Sair</Button>
        </div>
      </header>

      <div
  onWheel={(e) => {
    e.preventDefault();
    e.currentTarget.scrollLeft += e.deltaY;
  }}
  style={{
    display: 'flex',
    flex: 1,
    overflowX: 'auto',
    overflowY: 'hidden',
    padding: '16px',
    gap: '0',
  }}>
        {colunas.map((coluna, index) => (
          <div key={coluna.id} style={{ display: 'flex', flexShrink: 0 }}>
            <div style={{
              width: 'clamp(180px, 22vw, 260px)',
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.07)',
              maxHeight: 'calc(100vh - 90px)'
            }}>
              <div style={{
                padding: '12px 14px',
                borderBottom: `2px solid ${coluna.cor}`,
                background: 'rgba(255,255,255,0.03)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexShrink: 0
              }}>
                <span style={{
                  width: '8px', height: '8px',
                  borderRadius: '50%',
                  backgroundColor: coluna.cor,
                  boxShadow: `0 0 6px ${coluna.cor}`,
                  display: 'inline-block',
                  flexShrink: 0
                }} />
                <span style={{ color: 'white', fontSize: '12px', fontWeight: 600, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {coluna.nome}
                </span>
                <span style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '11px',
                  padding: '1px 7px',
                  borderRadius: '20px',
                  flexShrink: 0
                }}>{cardsDaColuna(coluna.id).length}</span>
              </div>

              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {cardsDaColuna(coluna.id).map((card) => (
                  <div key={card.id} onClick={() => abrirCard(card)} style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    borderLeft: `3px solid ${coluna.cor}`,
                    borderRadius: '8px',
                    padding: '10px 12px',
                    cursor: 'pointer',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ color: 'white', fontWeight: 700, fontSize: '13px' }}>{card.frota}</span>
                      {card.previsaoLiberacao && (
                        <span style={{ fontSize: '10px', color: '#fa8c16', background: 'rgba(250,140,22,0.15)', padding: '1px 5px', borderRadius: '4px' }}>
                          {card.previsaoLiberacao}
                        </span>
                      )}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', marginBottom: '2px' }}>{card.modelo}</div>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', marginBottom: '7px' }}>{card.unidade}</div>
                    <div style={{
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '11px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      padding: '5px 8px',
                      borderRadius: '6px',
                      lineHeight: 1.4
                    }}>{card.titulo}</div>
                  </div>
                ))}
              </div>
            </div>

            {index < colunas.length - 1 && (
              <div style={{
                width: '1px',
                background: 'rgba(255,255,255,0.07)',
                margin: '0 8px',
                alignSelf: 'stretch'
              }} />
            )}
          </div>
        ))}
      </div>

      {cardSelecionado && (
        <div onClick={fecharCard} style={{
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
              <div>
                <h3 style={{ color: 'white', margin: 0, fontSize: '18px' }}>{cardSelecionado.frota}</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', margin: '4px 0 0', fontSize: '13px' }}>
                  {cardSelecionado.modelo} — {cardSelecionado.unidade}
                </p>
              </div>
              <Button variant="icon" onClick={fecharCard}>×</Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {[
                { label: 'Problema', value: cardSelecionado.titulo },
                { label: 'Descrição', value: cardSelecionado.descricao },
                { label: 'Frota reserva', value: cardSelecionado.frotaReserva },
                { label: 'Responsável', value: cardSelecionado.responsavelNome },
                { label: 'Previsão liberação', value: cardSelecionado.previsaoLiberacao },
              ].filter(item => item.value).map(item => (
                <div key={item.label} style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px', padding: '10px 14px'
                }}>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    {item.label}
                  </div>
                  <div style={{ color: 'white', fontSize: '13px' }}>{item.value}</div>
                </div>
              ))}
            </div>

            {isAdmin() && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  Mover para
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                  {colunas.filter(c => c.id !== cardSelecionado.colunaId).map(coluna => (
                    <button key={coluna.id} onClick={() => moverCard(cardSelecionado.id, coluna.id)} style={{
                      padding: '6px 12px',
                      background: 'rgba(255,255,255,0.05)',
                      border: `1px solid ${coluna.cor}`,
                      color: 'white', borderRadius: '8px',
                      cursor: 'pointer', fontSize: '12px',
                      display: 'flex', alignItems: 'center', gap: '6px'
                    }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: coluna.cor, display: 'inline-block' }} />
                      {coluna.nome}
                    </button>
                  ))}
                </div>
                <Button
                  variant="secondary"
                  fullWidth
                  disabled={arquivando}
                  onClick={() => arquivarCard(cardSelecionado.id)}
                >{arquivando ? 'Arquivando...' : 'Arquivar card'}</Button>
              </div>
            )}

            {/* ===== TIMELINE DO HISTÓRICO ===== */}
            <div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Histórico
              </div>

              {loadingHistorico && (
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Carregando...</div>
              )}

              {!loadingHistorico && historico.length === 0 && (
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Sem movimentações registradas.</div>
              )}

              {!loadingHistorico && historico.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {historico.map((h, i) => (
                    <div key={h.id} style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{
                          width: '10px', height: '10px',
                          borderRadius: '50%',
                          backgroundColor: corDaColuna(h.colunaDestino),
                          boxShadow: `0 0 6px ${corDaColuna(h.colunaDestino)}`,
                          flexShrink: 0,
                          marginTop: '3px'
                        }} />
                        {i < historico.length - 1 && (
                          <span style={{
                            width: '2px',
                            flex: 1,
                            background: 'rgba(255,255,255,0.12)',
                            marginTop: '2px'
                          }} />
                        )}
                      </div>
                      <div style={{ paddingBottom: '16px', minWidth: 0 }}>
                        <div style={{ color: 'white', fontSize: '13px', fontWeight: 500 }}>
                          {h.observacao}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '2px' }}>
                          {h.usuarioNome} · {formatarData(h.criadoEm)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}