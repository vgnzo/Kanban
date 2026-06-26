import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button';

interface Coluna {
  id: string;
  nome: string;
  cor: string;
}

interface Equipamento {
  id: string;
  frota: string;
  modelo: string;
  unidade: string;
}

export default function CriarCard() {
  const navigate = useNavigate();
  const [colunas, setColunas] = useState<Coluna[]>([]);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    equipamentoId: '',
    colunaId: '',
    reservaId: '',
    previsaoLiberacao: '',
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    const [resColunas, resEquip] = await Promise.all([
      api.get('/api/colunas'),
      api.get('/api/equipamentos'),
    ]);
    setColunas(resColunas.data);
    setEquipamentos(resEquip.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      await api.post('/api/cards', {
        titulo: form.titulo,
        descricao: form.descricao || null,
        equipamentoId: form.equipamentoId,
        colunaId: form.colunaId,
        reservaId: form.reservaId || null,
        previsaoLiberacao: form.previsaoLiberacao || null,
      });
      navigate('/kanban');
    } catch {
      setErro('Erro ao criar card. Verifique os campos.');
    } finally {
      setLoading(false);
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
        <Button variant="ghost" onClick={() => navigate('/kanban')}>← Voltar</Button>
        <div>
          <div style={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>Novo Card</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Registrar problema em equipamento</div>
        </div>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 16px' }}>
        <div style={{
          width: '100%',
          maxWidth: '560px',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '32px'
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            <div>
              <label style={labelStyle}>Equipamento *</label>
              <select
                value={form.equipamentoId}
                onChange={(e) => setForm({ ...form, equipamentoId: e.target.value })}
                required
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="" style={{ background: '#1a1a2e' }}>Selecione o equipamento</option>
                {equipamentos.map(eq => (
                  <option key={eq.id} value={eq.id} style={{ background: '#1a1a2e' }}>
                    {eq.frota} — {eq.modelo} ({eq.unidade})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Frota reserva</label>
              <select
                value={form.reservaId}
                onChange={(e) => setForm({ ...form, reservaId: e.target.value })}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="" style={{ background: '#1a1a2e' }}>Nenhuma</option>
                {equipamentos.filter(eq => eq.id !== form.equipamentoId).map(eq => (
                  <option key={eq.id} value={eq.id} style={{ background: '#1a1a2e' }}>
                    {eq.frota} — {eq.modelo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Coluna inicial *</label>
              <select
                value={form.colunaId}
                onChange={(e) => setForm({ ...form, colunaId: e.target.value })}
                required
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="" style={{ background: '#1a1a2e' }}>Selecione a etapa</option>
                {colunas.map(col => (
                  <option key={col.id} value={col.id} style={{ background: '#1a1a2e' }}>
                    {col.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Problema / Título *</label>
              <input
                type="text"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                placeholder="Ex: Sem motor, vazamento de óleo..."
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Descrição</label>
              <textarea
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                placeholder="Detalhes adicionais sobre o problema..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={labelStyle}>Previsão de liberação</label>
              <input
                type="date"
                value={form.previsaoLiberacao}
                onChange={(e) => setForm({ ...form, previsaoLiberacao: e.target.value })}
                style={inputStyle}
              />
            </div>

            {erro && (
              <div style={{
                background: 'rgba(255,77,79,0.15)',
                border: '1px solid rgba(255,77,79,0.4)',
                borderRadius: '8px', padding: '10px 14px',
                color: '#ff7875', fontSize: '13px'
              }}>{erro}</div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/kanban')}
                style={{ flex: 1, padding: '12px', fontSize: '14px' }}
              >Cancelar</Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                style={{ flex: 2, padding: '12px', fontSize: '14px' }}
              >{loading ? 'Criando...' : 'Criar card'}</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}