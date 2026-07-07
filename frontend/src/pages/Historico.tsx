import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Button from '../components/Button';

interface Card {
  id: string;
  titulo: string;
  descricao: string;
  frota: string;
  modelo: string;
  unidade: string;
  colunaNome: string;
  corColuna: string;
  criadoEm: string;
}

interface Historico {
  id: string;
  usuarioNome: string;
  colunaOrigem: string | null;
  colunaDestino: string | null;
  observacao: string;
  criadoEm: string;
}

export default function Historico() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [selecionado, setSelecionado] = useState<Card | null>(null);
  const [historico, setHistorico] = useState<Historico[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [desarquivando, setDesarquivando] = useState(false);

  // filtros
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroUnidade, setFiltroUnidade] = useState('');

  useEffect(() => {
    carregarArquivados();
  }, []);

  const carregarArquivados = async () => {
    try {
      const res = await api.get('/api/cards/arquivados');
      setCards(res.data);
    } catch {
      setCards([]);
    }
  };

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
    if (!selecionado || !isAdmin()) return;
    setDesarquivando(true);
    try {
      await api.patch(`/api/cards/${selecionado.id}/desarquivar`);
      fechar();
      await carregarArquivados(); // recarrega — o card desarquivado sai dos arquivados
    } catch {
      alert('Não foi possível desarquivar o card.');
    } finally {
      setDesarquivando(false);
    }
  };

  const formatarData = (iso: string) => {
    const d = new Date(iso);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const hora = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dia}/${mes} ${hora}:${min}`;
  };

  // unidades presentes nos arquivados (pro filtro)
  const unidadesDisponiveis = Array.from(new Set(cards.map(c => c.unidade))).sort();

  // aplica os filtros
  const texto = filtroTexto.trim().toLowerCase();
  const cardsFiltrados = cards.filter(c => {
    const casaTexto = !texto ||
      c.frota.toLowerCase().includes(texto) ||
      c.titulo.toLowerCase().includes(texto) ||
      c.modelo.toLowerCase().includes(texto);
    const casaUnidade = !filtroUnidade || c.unidade === filtroUnidade;
    return casaTexto && casaUnidade;
  });

  const filtroAtivo = filtroTexto || filtroUnidade;

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
          <div style={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>Histórico</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Problemas resolvidos e arquivados</div>
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
          {/* barra de filtros */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '18px', flexWrap: 'wrap' }}>
            <input
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              placeholder="🔍 Buscar frota, problema ou modelo..."
              style={{
                flex: 1, minWidth: '200px',
                padding: '9px 14px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none'
              }}
            />
            <select value={filtroUnidade} onChange={(e) => setFiltroUnidade(e.target.value)}
              style={{
                padding: '9px 12px', background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px',
                color: 'white', fontSize: '13px', cursor: 'pointer', outline: 'none'
              }}>
              <option value="" style={{ background: '#1a1a2e' }}>Todas as unidades</option>
              {unidadesDisponiveis.map(u => (
                <option key={u} value={u} style={{ background: '#1a1a2e' }}>{u}</option>
              ))}
            </select>
            {filtroAtivo && (
              <Button variant="ghost" onClick={() => { setFiltroTexto(''); setFiltroUnidade(''); }}>Limpar</Button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {cardsFiltrados.map(card => (
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
                  <div style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>
                    {card.frota} <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>· {card.modelo}</span>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '2px' }}>{card.titulo}</div>
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', marginTop: '2px' }}>{card.unidade}</div>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '18px', flexShrink: 0 }}>›</span>
              </div>
            ))}

            {cardsFiltrados.length === 0 && (
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', textAlign: 'center', padding: '24px' }}>
                {cards.length === 0 ? 'Nenhum problema arquivado ainda.' : 'Nenhum resultado para o filtro.'}
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
              <div>
                <h3 style={{ color: 'white', margin: 0, fontSize: '18px' }}>{selecionado.frota}</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', margin: '4px 0 0', fontSize: '13px' }}>
                  {selecionado.modelo} — {selecionado.unidade}
                </p>
              </div>
              <Button variant="icon" onClick={fechar}>×</Button>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px', padding: '10px 14px', marginBottom: '20px'
            }}>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Problema
              </div>
              <div style={{ color: 'white', fontSize: '13px' }}>{selecionado.titulo}</div>
            </div>

            {/* botão desarquivar — só admin */}
            {isAdmin() && (
              <div style={{ marginBottom: '20px' }}>
                <Button variant="primary" disabled={desarquivando} onClick={desarquivar} style={{ width: '100%' }}>
                  {desarquivando ? 'Desarquivando...' : '↩ Desarquivar card'}
                </Button>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: '8px 0 0', textAlign: 'center' }}>
                  O card volta para o quadro, na coluna onde estava.
                </p>
              </div>
            )}

            <div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Histórico completo
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
                          backgroundColor: i === historico.length - 1 ? '#9eff9e' : 'rgba(255,255,255,0.4)',
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