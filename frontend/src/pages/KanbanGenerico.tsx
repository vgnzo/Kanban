import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Button from '../components/Button';
import Timeline from '../components/Timeline';
import { CardArrastavel, ColunaDroppavel } from '../components/DragDrop';
import {
  DndContext,
  DragOverlay,
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
  colunaId: string;
  colunaNome: string;
  corColuna: string;
  responsavelId: string | null;
  responsavelNome: string | null;
  previsaoLiberacao: string | null;
  valorExtra1: string | null;
  valorExtra2: string | null;
  valorExtra3: string | null;
}

interface Board {
  id: string;
  nome: string;
  tipo: string;
  campoExtra1: string | null;
  campoExtra2: string | null;
  campoExtra3: string | null;
  nivelAcesso: string | null;
}

interface Usuario {
  id: string;
  nome: string;
}

export default function KanbanGenerico() {
  const { boardId } = useParams<{ boardId: string }>();
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [souDono, setSouDono] = useState(false);
  const [board, setBoard] = useState<Board | null>(null);
  const [nivelAcesso, setNivelAcesso] = useState<string | null>(null);
  const [colunas, setColunas] = useState<Coluna[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [cardSelecionado, setCardSelecionado] = useState<Card | null>(null);
  const [historico, setHistorico] = useState<any[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [arquivando, setArquivando] = useState(false);
  const [cardArrastado, setCardArrastado] = useState<Card | null>(null);
  const [mostrarFormColuna, setMostrarFormColuna] = useState(false);
  const [editandoColuna, setEditandoColuna] = useState<string | null>(null);
  const [nomeEditColuna, setNomeEditColuna] = useState('');
  const [nomeNovaColuna, setNomeNovaColuna] = useState('');
  const [corNovaColuna, setCorNovaColuna] = useState('#378ADD');
  const [salvandoColuna, setSalvandoColuna] = useState(false);

  // pode editar o conteúdo (cards/colunas) se tem nível EDITAR neste quadro
  // (vale tanto pro admin dono quanto pro user com permissão de editar)
  const podeEditar = nivelAcesso === 'EDITAR';

  // filtros (genérico: texto, responsável, coluna — sem unidade)
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroResponsavel, setFiltroResponsavel] = useState('');
  const [filtroColuna, setFiltroColuna] = useState('');

  // edição
  const [editando, setEditando] = useState(false);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [formEdit, setFormEdit] = useState({
    titulo: '',
    descricao: '',
    responsavelId: '',
    previsaoLiberacao: '',
    valorExtra1: '',
    valorExtra2: '',
    valorExtra3: '',
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    if (boardId) carregarTudo();
  }, [boardId]);

  const carregarTudo = async () => {
    // busca o board (pra nomes dos campos extras + nivelAcesso), colunas e cards — todos por boardId
  const [resBoard, resColunas, resCards] = await Promise.all([
  api.get(`/api/boards/${boardId}`),               // 👈 busca SÓ este board (rápido)
  api.get(`/api/colunas/board/${boardId}`),
  api.get(`/api/cards/board/${boardId}`),
]);
const boardAtual = resBoard.data;                  // 👈 já vem o board direto
setBoard(boardAtual);
setNivelAcesso(boardAtual?.nivelAcesso || null);
setSouDono(boardAtual?.souDono || false);
    setColunas(resColunas.data);
    setCards(resCards.data);
  };

  const adicionarColuna = async () => {
    if (!nomeNovaColuna.trim()) return;
    setSalvandoColuna(true);
    try {
      await api.post(`/api/colunas/board/${boardId}`, {
        nome: nomeNovaColuna.trim(),
        cor: corNovaColuna,
      });
      setNomeNovaColuna('');
      setCorNovaColuna('#378ADD');
      setMostrarFormColuna(false);
      await carregarTudo();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Não foi possível adicionar a coluna.');
    } finally {
      setSalvandoColuna(false);
    }
  };

  const salvarNomeColuna = async (colunaId: string) => {
    if (!nomeEditColuna.trim()) { setEditandoColuna(null); return; }
    try {
      await api.patch(`/api/colunas/${colunaId}`, { nome: nomeEditColuna.trim() });
      setEditandoColuna(null);
      await carregarTudo();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Não foi possível renomear a coluna.');
    }
  };

  const removerColuna = async (colunaId: string, nomeColuna: string) => {
    const confirmado = window.confirm(`Remover a coluna "${nomeColuna}"?`);
    if (!confirmado) return;
    try {
      await api.delete(`/api/colunas/${colunaId}`);
      await carregarTudo();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Não foi possível remover a coluna.');
    }
  };

  // nomes dos campos extras (vêm do board); se não tiver nome, o campo não é usado
  const campos = [
    { nome: board?.campoExtra1, chave: 'valorExtra1' as const },
    { nome: board?.campoExtra2, chave: 'valorExtra2' as const },
    { nome: board?.campoExtra3, chave: 'valorExtra3' as const },
  ].filter(c => c.nome);

  const responsaveisDisponiveis = Array.from(
    new Set(cards.map(c => c.responsavelNome).filter((n): n is string => !!n))
  ).sort();

  const aplicarFiltros = (lista: Card[]) => {
    const texto = filtroTexto.trim().toLowerCase();
    return lista.filter(c => {
      const casaTexto = !texto ||
        c.titulo.toLowerCase().includes(texto) ||
        (c.descricao || '').toLowerCase().includes(texto);
      const casaResponsavel = !filtroResponsavel || c.responsavelNome === filtroResponsavel;
      return casaTexto && casaResponsavel;
    });
  };

  const filtroAtivo = filtroTexto || filtroResponsavel || filtroColuna;

  const limparFiltros = () => {
    setFiltroTexto('');
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
      previsaoLiberacao: cardSelecionado.previsaoLiberacao || '',
      valorExtra1: cardSelecionado.valorExtra1 || '',
      valorExtra2: cardSelecionado.valorExtra2 || '',
      valorExtra3: cardSelecionado.valorExtra3 || '',
    });
    setEditando(true);
    try {
const resUsuarios = await api.get('/api/usuarios/lista-simples');      setUsuarios(resUsuarios.data);
    } catch {
      // segue sem a lista se falhar
    }
  };

  const salvarEdicao = async () => {
    if (!cardSelecionado) return;
    setSalvandoEdicao(true);
    try {
      await api.put(`/api/cards/generico/${cardSelecionado.id}`, {
        titulo: formEdit.titulo,
        descricao: formEdit.descricao || null,
        responsavelId: formEdit.responsavelId || null,
        previsaoLiberacao: formEdit.previsaoLiberacao || null,
        valorExtra1: formEdit.valorExtra1 || null,
        valorExtra2: formEdit.valorExtra2 || null,
        valorExtra3: formEdit.valorExtra3 || null,
      });
      await carregarTudo();
      const atualizado = (await api.get(`/api/cards/board/${boardId}`)).data
        .find((c: Card) => c.id === cardSelecionado.id);
      if (atualizado) {
        await abrirCard(atualizado);
      } else {
        fecharCard();
      }
    } finally {
      setSalvandoEdicao(false);
    }
  };

  const moverCard = async (cardId: string, novaColunaId: string) => {
    if (!podeEditar) return;
    await api.patch(`/api/cards/${cardId}/mover/${novaColunaId}`);
    await carregarTudo();
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
      await carregarTudo();
    } catch {
      await carregarTudo();
    }
  };

  const arquivarCard = async (cardId: string) => {
    if (!podeEditar) return;
    setArquivando(true);
    try {
      await api.patch(`/api/cards/${cardId}/arquivar`);
      await carregarTudo();
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
    if (filtroTexto || filtroResponsavel) {
      return colunas.filter(c => cardsDaColuna(c.id).length > 0);
    }
    return colunas;
  })();

  const corDaColuna = (nome: string | null) => {
    const col = colunas.find(c => c.nome === nome);
    return col ? col.cor : 'rgba(255,255,255,0.4)';
  };

  // valor de um campo extra de um card pela chave
  const valorCampo = (card: Card, chave: 'valorExtra1' | 'valorExtra2' | 'valorExtra3') => card[chave];

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
          <Button variant="ghost" onClick={() => navigate('/boards')}>←</Button>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px'
          }}>📋</div>
          <div>
            <div style={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>{board?.nome || 'Quadro'}</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Quadro de tarefas</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {podeEditar && (
            <Button variant="primary" onClick={() => navigate(`/criar-card-generico/${boardId}`)}>+ Novo card</Button>
          )}
        {souDono && (
            <Button variant="secondary" onClick={() => navigate(`/solicitacoes/${boardId}`)}>Solicitações</Button>
          )}
          <Button variant="secondary" onClick={() => navigate(`/historico-generico/${boardId}`)}>Histórico</Button>
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
          placeholder="🔍 Buscar título ou descrição..."
          style={{
            flex: 1, minWidth: '200px',
            padding: '8px 14px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none'
          }}
        />
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
          // só converte vertical→horizontal se não for um scroll horizontal nativo (trackpad)
          if (e.deltaY !== 0) {
            e.currentTarget.scrollLeft += e.deltaY;
          }
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
                  {editandoColuna === coluna.id ? (
                    <input
                      autoFocus
                      value={nomeEditColuna}
                      onChange={(e) => setNomeEditColuna(e.target.value)}
                      onBlur={() => salvarNomeColuna(coluna.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') salvarNomeColuna(coluna.id);
                        if (e.key === 'Escape') setEditandoColuna(null);
                      }}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        padding: '2px 6px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.25)',
                        borderRadius: '4px',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 600,
                        outline: 'none'
                      }}
                    />
                  ) : (
                    <span style={{ color: 'white', fontSize: '12px', fontWeight: 600, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {coluna.nome}
                    </span>
                  )}
                  {podeEditar && editandoColuna !== coluna.id && (
                    <button
                      onClick={() => { setEditandoColuna(coluna.id); setNomeEditColuna(coluna.nome); }}
                      title="Renomear coluna"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'rgba(170, 170, 170, 0.4)',
                        cursor: 'pointer',
                        fontSize: '11px',
                        padding: '2px',
                        flexShrink: 0
                      }}
                    >
                      ✏️
                    </button>
                  )}

                  {podeEditar && editandoColuna !== coluna.id && (
                    <button
                      onClick={() => removerColuna(coluna.id, coluna.nome)}
                      title="Remover coluna"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'rgba(251, 33, 29, 0.6)',
                        cursor: 'pointer',
                        fontSize: '20px',
                        padding: '2px',
                        flexShrink: 0
                      }}
                    >
                      🗑
                    </button>
                  )}
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
                    <CardArrastavel key={card.id} id={card.id} podeArrastar={podeEditar}>
                      <div onClick={() => abrirCard(card)} style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.09)',
                        borderLeft: `3px solid ${coluna.cor}`,
                        borderRadius: '8px',
                        padding: '10px 12px',
                        cursor: 'pointer'
                      }}>
                        <div style={{ color: 'white', fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>
                          {card.titulo}
                        </div>
                        {campos.map(campo => {
                          const valor = valorCampo(card, campo.chave);
                          if (!valor) return null;
                          return (
                            <div key={campo.chave} style={{ fontSize: '10px', marginBottom: '3px' }}>
                              <span style={{ color: 'rgba(255,255,255,0.4)' }}>{campo.nome}: </span>
                              <span style={{ color: 'rgba(255,255,255,0.75)' }}>{valor}</span>
                            </div>
                          );
                        })}
                        {card.responsavelNome && (
                          <div style={{
                            marginTop: '6px',
                            fontSize: '10px',
                            color: 'rgba(255,255,255,0.5)',
                            display: 'flex', alignItems: 'center', gap: '4px'
                          }}>
                            👤 {card.responsavelNome}
                          </div>
                        )}
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
            {podeEditar && (
            <div style={{ flexShrink: 0, width: '220px', padding: '0 8px', alignSelf: 'flex-start' }}>
              {!mostrarFormColuna ? (
                <button
                  onClick={() => setMostrarFormColuna(true)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px dashed rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    color: 'rgba(255,255,255,0.6)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600
                  }}
                >
                  + Adicionar coluna
                </button>
              ) : (
                <div style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '12px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <input
                    autoFocus
                    value={nomeNovaColuna}
                    onChange={(e) => setNomeNovaColuna(e.target.value)}
                    placeholder="Nome da coluna"
                    style={{
                      padding: '8px 10px',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '6px',
                      color: 'white',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="color"
                      value={corNovaColuna}
                      onChange={(e) => setCorNovaColuna(e.target.value)}
                      style={{ width: '36px', height: '32px', background: 'none', border: 'none', cursor: 'pointer' }}
                    />
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Cor da coluna</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={adicionarColuna}
                      disabled={salvandoColuna}
                      style={{
                        flex: 1,
                        padding: '8px',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        border: 'none',
                        borderRadius: '6px',
                        color: 'white',
                        cursor: salvandoColuna ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        fontWeight: 600
                      }}
                    >
                      {salvandoColuna ? 'Salvando...' : 'Adicionar'}
                    </button>
                    <button
                      onClick={() => { setMostrarFormColuna(false); setNomeNovaColuna(''); }}
                      style={{
                        padding: '8px 12px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '6px',
                        color: 'rgba(255,255,255,0.7)',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
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
              <div style={{ color: 'white', fontWeight: 700, fontSize: '13px' }}>{cardArrastado.titulo}</div>
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
              <h3 style={{ color: 'white', margin: 0, fontSize: '18px' }}>{cardSelecionado.titulo}</h3>
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
                  <label style={labelStyle}>Prazo</label>
                  <input type="date" style={inputStyle} value={formEdit.previsaoLiberacao}
                    onChange={(e) => setFormEdit({ ...formEdit, previsaoLiberacao: e.target.value })} />
                </div>
                {/* campos extras nomeados pelo board */}
                {board?.campoExtra1 && (
                  <div>
                    <label style={labelStyle}>{board.campoExtra1}</label>
                    <input style={inputStyle} value={formEdit.valorExtra1}
                      onChange={(e) => setFormEdit({ ...formEdit, valorExtra1: e.target.value })} />
                  </div>
                )}
                {board?.campoExtra2 && (
                  <div>
                    <label style={labelStyle}>{board.campoExtra2}</label>
                    <input style={inputStyle} value={formEdit.valorExtra2}
                      onChange={(e) => setFormEdit({ ...formEdit, valorExtra2: e.target.value })} />
                  </div>
                )}
                {board?.campoExtra3 && (
                  <div>
                    <label style={labelStyle}>{board.campoExtra3}</label>
                    <input style={inputStyle} value={formEdit.valorExtra3}
                      onChange={(e) => setFormEdit({ ...formEdit, valorExtra3: e.target.value })} />
                  </div>
                )}
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
                    { label: 'Descrição', value: cardSelecionado.descricao },
                    ...campos.map(c => ({ label: c.nome as string, value: valorCampo(cardSelecionado, c.chave) })),
                    { label: 'Responsável', value: cardSelecionado.responsavelNome },
                    { label: 'Prazo', value: cardSelecionado.previsaoLiberacao },
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

                {podeEditar && (
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
                    corDoEvento={corDaColuna}
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