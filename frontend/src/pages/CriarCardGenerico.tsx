import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button';

interface Coluna {
  id: string;
  nome: string;
  cor: string;
  ordem: number;
}

interface Board {
  id: string;
  nome: string;
  tipo: string;
  campoExtra1: string | null;
  campoExtra2: string | null;
  campoExtra3: string | null;
}

interface Usuario {
  id: string;
  nome: string;
}

export default function CriarCardGenerico() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();

  const [board, setBoard] = useState<Board | null>(null);
  const [colunas, setColunas] = useState<Coluna[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    responsavelId: '',
    valorExtra1: '',
    valorExtra2: '',
    valorExtra3: '',
  });

  useEffect(() => {
    if (boardId) carregarDados();
  }, [boardId]);

  const carregarDados = async () => {
    try {
      const [resBoards, resColunas, resUsuarios] = await Promise.all([
        api.get('/api/boards'),
        api.get(`/api/colunas/board/${boardId}`),
        api.get('/api/usuarios'),
      ]);
      const boardAtual = resBoards.data.find((b: Board) => b.id === boardId) || null;
      setBoard(boardAtual);
      setColunas(resColunas.data);
      setUsuarios(resUsuarios.data);
    } catch {
      setErro('Não foi possível carregar os dados do quadro.');
    } finally {
      setCarregando(false);
    }
  };

  const salvar = async () => {
    setErro('');

    if (!form.titulo.trim()) {
      setErro('Dê um título à tarefa.');
      return;
    }
    if (colunas.length === 0) {
      setErro('Este quadro não tem colunas. Crie colunas antes de adicionar tarefas.');
      return;
    }

    // a primeira coluna (menor ordem) é onde o card nasce
    const primeiraColuna = [...colunas].sort((a, b) => a.ordem - b.ordem)[0];

    setSalvando(true);
    try {
      await api.post('/api/cards/generico', {
        titulo: form.titulo.trim(),
        descricao: form.descricao.trim() || null,
        colunaId: primeiraColuna.id,
        responsavelId: form.responsavelId || null,
        valorExtra1: form.valorExtra1.trim() || null,
        valorExtra2: form.valorExtra2.trim() || null,
        valorExtra3: form.valorExtra3.trim() || null,
      });
      navigate(`/kanban-generico/${boardId}`);
    } catch {
      setErro('Não foi possível criar a tarefa. Tente de novo.');
    } finally {
      setSalvando(false);
    }
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
        <Button variant="ghost" onClick={() => navigate(`/kanban-generico/${boardId}`)}>← Voltar</Button>
        <div>
          <div style={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>Nova tarefa</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{board?.nome || 'Quadro'}</div>
        </div>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 16px' }}>
        <div style={{
          width: '100%',
          maxWidth: '520px',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '28px'
        }}>
          {carregando ? (
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>Carregando...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Título *</label>
                <input style={inputStyle} value={form.titulo} placeholder="O que precisa ser feito?"
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
              </div>

              <div>
                <label style={labelStyle}>Descrição</label>
                <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={3} value={form.descricao}
                  placeholder="Detalhes da tarefa (opcional)"
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
              </div>

              <div>
                <label style={labelStyle}>Responsável</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.responsavelId}
                  onChange={(e) => setForm({ ...form, responsavelId: e.target.value })}>
                  <option value="" style={{ background: '#1a1a2e' }}>Ninguém</option>
                  {usuarios.map(u => (
                    <option key={u.id} value={u.id} style={{ background: '#1a1a2e' }}>{u.nome}</option>
                  ))}
                </select>
              </div>

              {/* campos extras nomeados pelo board */}
              {board?.campoExtra1 && (
                <div>
                  <label style={labelStyle}>{board.campoExtra1}</label>
                  <input style={inputStyle} value={form.valorExtra1}
                    onChange={(e) => setForm({ ...form, valorExtra1: e.target.value })} />
                </div>
              )}
              {board?.campoExtra2 && (
                <div>
                  <label style={labelStyle}>{board.campoExtra2}</label>
                  <input style={inputStyle} value={form.valorExtra2}
                    onChange={(e) => setForm({ ...form, valorExtra2: e.target.value })} />
                </div>
              )}
              {board?.campoExtra3 && (
                <div>
                  <label style={labelStyle}>{board.campoExtra3}</label>
                  <input style={inputStyle} value={form.valorExtra3}
                    onChange={(e) => setForm({ ...form, valorExtra3: e.target.value })} />
                </div>
              )}

              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', margin: 0 }}>
                A tarefa será criada na primeira coluna do quadro. Você pode movê-la e definir um prazo depois.
              </p>

              {erro && (
                <div style={{
                  background: 'rgba(255,77,79,0.15)',
                  border: '1px solid rgba(255,77,79,0.4)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#ff7875',
                  fontSize: '13px'
                }}>
                  {erro}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <Button variant="secondary" onClick={() => navigate(`/kanban-generico/${boardId}`)} style={{ flex: 1 }}>
                  Cancelar
                </Button>
                <Button variant="primary" disabled={salvando} onClick={salvar} style={{ flex: 2 }}>
                  {salvando ? 'Criando...' : 'Criar tarefa'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}