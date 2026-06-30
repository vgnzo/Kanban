import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Button from '../components/Button';
import Timeline from '../components/Timeline'; // 🛠️ Ajustado rota caso esteja na pasta de componentes. Altere se necessário!
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';

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
  responsavelId: string | null;
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

interface Usuario {
  id: string;
  nome: string;
}

interface Equipamento {
  id: string;
  frota: string;
  modelo: string;
}

// ===== CARD ARRASTÁVEL =====
export function CardArrastavel({ card, podeArrastar, children }: {
  card: Card;
  podeArrastar: boolean;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: card.id,
    disabled: !podeArrastar,
  });

  const style: React.CSSProperties = {
    opacity: isDragging ? 0.5 : 1,
    cursor: podeArrastar ? 'grab' : 'pointer',
    touchAction: 'none',
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  );
}

// ===== COLUNA QUE RECEBE O DROP =====
export function ColunaDroppavel({ colunaId, children }: {
  colunaId: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: colunaId });

  return (
    <div ref={setNodeRef} style={{
      flex: 1,
      overflowY: 'auto',
      padding: '10px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      background: isOver ? 'rgba(102,126,234,0.12)' : 'transparent',
      transition: 'background 0.15s ease',
    }}>
      {children}
    </div>
  );
}

export default function KanbanGenerico() {
  const { usuario, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [colunas, setColunas] = useState<Coluna[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [cardSelecionado, setCardSelecionado] = useState<Card | null>(null);
  const [historico, setHistorico] = useState<Historico[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [arquivando, setArquivando] = useState(false);
  const [cardArrastado, setCardArrastado] = useState<Card | null>(null);

  // filtros
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroUnidade, setFiltroUnidade] = useState('');
  const [filtroResponsavel, setFiltroResponsavel] = useState('');
  const [filtroColuna, setFiltroColuna] = useState('');

  // edição
  const [editando, setEditando] = useState(false);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [formEdit, setFormEdit] = useState({
    titulo: '',
    descricao: '',
    responsavelId: '',
    reservaId: '',
    previsaoLiberacao: '',
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => { carregarDados(); }, []);

  const carregarDados = async () => {
    const [resColunas, resCards] = await Promise.all([
      api.get('/api/colunas'),
      api.get('/api/cards'),
    ]);
    setColunas(resColunas.data);
    setCards(resCards.data);
  };

  const unidadesDisponiveis = Array.from(new Set(cards.map(c => c.unidade))).sort();
  const responsaveisDisponiveis = Array.from(
    new Set(cards.map(c => c.responsavelNome).filter((n): n is string => !!n))
  ).sort();

  const aplicarFiltros = (lista: Card[]) => {
    const texto = filtroTexto.trim().toLowerCase();
    return lista.filter(c => {
      const casaTexto = !texto ||
        c.frota.toLowerCase().includes(texto) ||
        c.titulo.toLowerCase().includes(texto) ||
        c.modelo.toLowerCase().includes(texto);
      const casaUnidade = !filtroUnidade || c.unidade === filtroUnidade;
      const casaResponsavel = !filtroResponsavel || c.responsavelNome === filtroResponsavel;
      return casaTexto && casaUnidade && casaResponsavel;
    });
  };

  const filtroAtivo = filtroTexto || filtroUnidade || filtroResponsavel || filtroColuna;

  const limparFiltros = () => {
    setFiltroTexto('');
    setFiltroUnidade('');
    setFiltroResponsavel('');
    setFiltroColuna('');
  };

  const abrirCard = async (card: Card) => {
    setCardSelecionado(card);
    setEditando(false);
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
    setEditando(false);
    setHistorico([]);
  };

  const iniciarEdicao = async () => {
    if (!cardSelecionado) return;
    setFormEdit({
      titulo: cardSelecionado.titulo || '',
      descricao: cardSelecionado.descricao || '',
      responsavelId: cardSelecionado.responsavelId || '',
      reservaId: '',
      previsaoLiberacao: cardSelecionado.previsaoLiberacao || '',
    });
    setEditando(true);
    try {
      const [resUsuarios, resEquip] = await Promise.all([
        api.get('/api/usuarios'),
        api.get('/api/equipamentos'),
      ]);
      setUsuarios(resUsuarios.data);
      setEquipamentos(resEquip.data);

      const eqReserva = resEquip.data.find((eq: Equipamento) => eq.frota === cardSelecionado.frotaReserva);
      if (eqReserva) {
        setFormEdit(prev => ({ ...prev, reservaId: eqReserva.id }));
      }
    } catch {
      // segue sem as listas se falhar
    }
  };

  const salvarEdicao = async () => {
    if (!cardSelecionado) return;
    setSalvandoEdicao(true);
    try {
      await api.put(`/api/cards/${cardSelecionado.id}`, {
        titulo: formEdit.titulo,
        descricao: formEdit.descricao || null,
        responsavelId: formEdit.responsavelId || null,
        reservaId: formEdit.reservaId || null,
        previsaoLiberacao: formEdit.previsaoLiberacao || null,
      });
      await carregarDados();
      const atualizado = (await api.get('/api/cards')).data.find((c: Card) => c.id === cardSelecionado.id);
      if (atualizado) {
        await abrirCard(atualizado);
      } else {
        fecharCard();
      }
    } catch (error) {
      console.error("Erro ao salvar edição:", error);
    } finally {
      setSalvandoEdicao(false);
    }
  };

  const moverCard = async (cardId: string, novaColunaId: string) => {
    if (!isAdmin()) return;
    await api.patch(`/api/cards/${cardId}/mover/${novaColunaId}`);
    await carregarDados();
    fecharCard();
  };

  const aoComecarArraste = (event: DragStartEvent) => {
    const card = cards.find(c => c.id === String(event.active.id));
    setCardArrastado(card || null);
  };

  const aoSoltar = async (event: DragEndEvent) => {
    setCardArrastado(null);
    const { active, over } = event;
    if (!over) return;

    const cardId = String(active.id);
    const novaColunaId = String(over.id);

    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    if (card.colunaId === novaColunaId) return;

    setCards(prev => prev.map(c =>
      c.id === cardId ? { ...c, colunaId: novaColunaId } : c
    ));

    try {
      await api.patch(`/api/cards/${cardId}/mover/${novaColunaId}`);
      await carregarDados();
    } catch {
      await carregarDados();
    }
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
    aplicarFiltros(cards.filter((c) => c.colunaId === colunaId));

  const colunasVisiveis = (() => {
    if (filtroColuna) {
      return colunas.filter(c => c.id === filtroColuna);
    }
    if (filtroTexto || filtroUnidade || filtroResponsavel) {
      return colunas.filter(c => cardsDaColuna(c.id).length > 0);
    }
    return colunas;
  })();

  const corDaColuna = (nome: string | null) => {
    const col = colunas.find(c => c.nome === nome);
    return col ? col.cor : 'rgba(255,255,255,0.4)';
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  const labelStyle = {
    display: 'block',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '11px',
    marginBottom: '6px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.8px',
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
            <div style={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>Kanban Genérico</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Gestão de processos gerais</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {isAdmin() && (
            <Button variant="primary" onClick={() => navigate('/criar-card')}>+ Novo card</Button>
          )}

          <Button variant="secondary" onClick={() => navigate('/historico')}>Histórico</Button>

          {isAdmin() && (
            <Button variant="secondary" onClick={() => navigate('/equipamentos')}>Equipamentos</Button>
          )}

          {isAdmin() && (
            <Button variant="secondary" onClick={() => navigate('/usuarios')}>Usuários</Button>
          )}

          <Button variant="secondary" onClick={logout}>Sair</Button>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', marginLeft: '4px' }}>
            <div style={{ color: 'white', fontSize: '13px', fontWeight: 500, lineHeight: 1 }}>{usuario?.nome}</div>
            <div style={{
              fontSize: '10px',
              background: usuario?.perfil === 'ADMIN' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.15)',
              color: 'white', padding: '2px 10px', borderRadius: '20px',
              lineHeight: 1.4, letterSpacing: '0.5px'
            }}>{usuario?.perfil}</div>
          </div>
        </div>
      </header>

      <div style={{
        padding: '12px 16px',
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        flexWrap: 'wrap',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0
      }}>
        <input
          value={filtroTexto}
          onChange={(e) => setFiltroTexto(e.target.value)}
          placeholder="🔍 Buscar..."
          style={{
            flex: 1, minWidth: '200px',
            padding: '8px 14px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none'
          }}
        />
        <select value={filtroUnidade} onChange={(e) => setFiltroUnidade(e.target.value)}
          style={{
            padding: '8px 12px', background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px',
            color: 'white', fontSize: '13px', cursor: 'pointer', outline: 'none'
          }}>
          <option value="" style={{ background: '#1a1a2e' }}>Todas as unidades</option>
          {unidadesDisponiveis.map(u => (
            <option key={u} value={u} style={{ background: '#1a1a2e' }}>{u}</option>
          ))}
        </select>
        <select value={filtroResponsavel} onChange={(e) => setFiltroResponsavel(e.target.value)}
          style={{
            padding: '8px 12px', background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px',
            color: 'white', fontSize: '13px', cursor: 'pointer', outline: 'none'
          }}>
          <option value="" style={{ background: '#1a1a2e' }}>Todos responsáveis</option>
          {responsaveisDisponiveis.map(r => (
            <option key={r} value={r} style={{ background: '#1a1a2e' }}>{r}</option>
          ))}
        </select>
        <select value={filtroColuna} onChange={(e) => setFiltroColuna(e.target.value)}
          style={{
            padding: '8px 12px', background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px',
            color: 'white', fontSize: '13px', cursor: 'pointer', outline: 'none'
          }}>
          <option value="" style={{ background: '#1a1a2e' }}>Todas as etapas</option>
          {colunas.map(c => (
            <option key={c.id} value={c.id} style={{ background: '#1a1a2e' }}>{c.nome}</option>
          ))}
        </select>
        {filtroAtivo && (
          <Button variant="ghost" onClick={limparFiltros}>Limpar filtros</Button>
        )}
      </div>

      <DndContext sensors={sensors} onDragStart={aoComecarArraste} onDragEnd={aoSoltar}>
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
          {colunasVisiveis.map((coluna, index) => (
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

                <ColunaDroppavel colunaId={coluna.id}>
                  {cardsDaColuna(coluna.id).map((card) => (
                    <CardArrastavel key={card.id} card={card} podeArrastar={isAdmin()}>
                      <div onClick={() => abrirCard(card)} style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.09)',
                        borderLeft: `3px solid ${coluna.cor}`,
                        borderRadius: '8px',
                        padding: '10px 12px',
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
                    </CardArrastavel>
                  ))}
                </ColunaDroppavel>
              </div>

              {index < colunasVisiveis.length - 1 && (
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

        <DragOverlay>
          {cardArrastado ? (
            <div style={{
              background: 'rgba(40,44,72,0.95)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderLeft: `3px solid ${cardArrastado.corColuna}`,
              borderRadius: '8px',
              padding: '10px 12px',
              width: '230px',
              boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
              cursor: 'grabbing',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ color: 'white', fontWeight: 700, fontSize: '13px' }}>{cardArrastado.frota}</span>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', marginBottom: '2px' }}>{cardArrastado.modelo}</div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', marginBottom: '7px' }}>{cardArrastado.unidade}</div>
              <div style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '11px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                padding: '5px 8px',
                borderRadius: '6px',
                lineHeight: 1.4
              }}>{cardArrastado.titulo}</div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <footer style={{
        textAlign: 'center',
        padding: '6px 0',
        color: 'rgba(255,255,255,0.25)',
        fontSize: '11px',
        letterSpacing: '0.3px',
        flexShrink: 0
      }}>
        Desenvolvido por Vinicius Galdino
      </footer>

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

            {editando ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Título *</label>
                  <input style={inputStyle} value={formEdit.titulo}
                    onChange={(e) => setFormEdit({ ...formEdit, titulo: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Descrição</label>
                  <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={3} value={formEdit.descricao}
                    onChange={(e) => setFormEdit({ ...formEdit, descricao: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Responsável</label>
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={formEdit.responsavelId}
                    onChange={(e) => setFormEdit({ ...formEdit, responsavelId: e.target.value })}>
                    <option value="" style={{ background: '#1a1a2e' }}>Ninguém</option>
                    {usuarios.map(u => (
                      <option key={u.id} value={u.id} style={{ background: '#1a1a2e' }}>{u.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Frota reserva</label>
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={formEdit.reservaId}
                    onChange={(e) => setFormEdit({ ...formEdit, reservaId: e.target.value })}>
                    <option value="" style={{ background: '#1a1a2e' }}>Nenhuma</option>
                    {equipamentos.map(eq => (
                      <option key={eq.id} value={eq.id} style={{ background: '#1a1a2e' }}>{eq.frota} — {eq.modelo}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Previsão de liberação</label>
                  <input type="date" style={inputStyle} value={formEdit.previsaoLiberacao}
                    onChange={(e) => setFormEdit({ ...formEdit, previsaoLiberacao: e.target.value })} />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  <Button variant="secondary" onClick={() => setEditando(false)} style={{ flex: 1, padding: '11px' }}>Cancelar</Button>
                  <Button variant="primary" disabled={salvandoEdicao} onClick={salvarEdicao} style={{ flex: 2, padding: '11px' }}>
                    {salvandoEdicao ? 'Salvando...' : 'Salvar alterações'}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  {[
                    { label: 'Título/Problema', value: cardSelecionado.titulo },
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
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <Button variant="primary" onClick={iniciarEdicao} style={{ flex: 1 }}>Editar</Button>
                      <Button variant="secondary" disabled={arquivando} onClick={() => arquivarCard(cardSelecionado.id)} style={{ flex: 1 }}>
                        {arquivando ? 'Arquivando...' : 'Arquivar'}
                      </Button>
                    </div>
                  </div>
                )}

                <div>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    Histórico
                  </div>
                  
                  <Timeline
                    historico={historico}
                    loading={loadingHistorico}
                    corDoEvento={(colunaDestino: string | null) => corDaColuna(colunaDestino)}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}