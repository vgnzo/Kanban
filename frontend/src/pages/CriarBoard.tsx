import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button';

interface ColunaForm {
  nome: string;
  cor: string;
}

export default function CriarBoard() {
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [campoExtra1, setCampoExtra1] = useState('');
  const [campoExtra2, setCampoExtra2] = useState('');
  const [campoExtra3, setCampoExtra3] = useState('');
  const [colunas, setColunas] = useState<ColunaForm[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const adicionarColuna = () => {
    if (colunas.length >= 15) return; // backend limita a 15
    setColunas([...colunas, { nome: '', cor: '#667eea' }]);
  };

  const removerColuna = (index: number) => {
    setColunas(colunas.filter((_, i) => i !== index));
  };

  const atualizarColuna = (index: number, campo: 'nome' | 'cor', valor: string) => {
    setColunas(colunas.map((c, i) => i === index ? { ...c, [campo]: valor } : c));
  };

  const salvar = async () => {
    setErro('');

    if (!nome.trim()) {
      setErro('Dê um nome ao quadro.');
      return;
    }
    if (colunas.length === 0) {
      setErro('Adicione pelo menos uma coluna.');
      return;
    }
    if (colunas.some(c => !c.nome.trim())) {
      setErro('Todas as colunas precisam de um nome.');
      return;
    }

    setSalvando(true);
    try {
      await api.post('/api/boards', {
        nome: nome.trim(),
        campoExtra1: campoExtra1.trim() || null,
        campoExtra2: campoExtra2.trim() || null,
        campoExtra3: campoExtra3.trim() || null,
        colunas: colunas.map(c => ({ nome: c.nome.trim(), cor: c.cor })),
      });
      navigate('/boards');
    } catch {
      setErro('Não foi possível criar o quadro. Verifique os dados e tente de novo.');
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
      maxHeight: '100vh',
      overflowY: 'auto',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      fontFamily: "'Segoe UI', sans-serif"
    }}>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: 'rgba(26,26,46,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <Button variant="ghost" onClick={() => navigate('/boards')}>← Voltar</Button>
        <div>
          <div style={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>Novo quadro</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Crie um quadro de tarefas personalizado</div>
        </div>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 16px 80px' }}>
        <div style={{
          width: '100%',
          maxWidth: '620px',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '28px'
        }}>
          {/* nome do quadro */}
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Nome do quadro *</label>
            <input style={inputStyle} value={nome} placeholder="Ex: Tarefas da Equipe"
              onChange={(e) => setNome(e.target.value)} />
          </div>

          {/* campos extras */}
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Campos personalizados (opcional)</label>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '0 0 10px' }}>
              Dê nomes aos campos que cada card terá. Ex: "Prioridade", "Setor". Deixe em branco se não quiser.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input style={inputStyle} value={campoExtra1} placeholder="Campo 1 (ex: Prioridade)"
                onChange={(e) => setCampoExtra1(e.target.value)} />
              <input style={inputStyle} value={campoExtra2} placeholder="Campo 2 (ex: Setor)"
                onChange={(e) => setCampoExtra2(e.target.value)} />
              <input style={inputStyle} value={campoExtra3} placeholder="Campo 3 (opcional)"
                onChange={(e) => setCampoExtra3(e.target.value)} />
            </div>
          </div>

          {/* colunas */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Colunas (etapas) *</label>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>{colunas.length}/15</span>
            </div>

            {colunas.length === 0 && (
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '0 0 10px' }}>
                Nenhuma coluna ainda. Adicione as etapas do seu fluxo (ex: A Fazer, Fazendo, Feito).
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              {colunas.map((coluna, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="color"
                    value={coluna.cor}
                    onChange={(e) => atualizarColuna(index, 'cor', e.target.value)}
                    style={{
                      width: '42px', height: '42px',
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      flexShrink: 0,
                      padding: '2px'
                    }}
                  />
                  <input
                    style={{ ...inputStyle, flex: 1 }}
                    value={coluna.nome}
                    placeholder={`Coluna ${index + 1}`}
                    onChange={(e) => atualizarColuna(index, 'nome', e.target.value)}
                  />
                  <button
                    onClick={() => removerColuna(index)}
                    style={{
                      background: 'rgba(255,77,79,0.12)',
                      border: '1px solid rgba(255,77,79,0.3)',
                      color: '#ff7875',
                      borderRadius: '8px',
                      width: '42px', height: '42px',
                      cursor: 'pointer',
                      fontSize: '18px',
                      flexShrink: 0
                    }}
                  >×</button>
                </div>
              ))}
            </div>

            {colunas.length < 15 && (
              <Button variant="secondary" onClick={adicionarColuna} style={{ width: '100%' }}>
                + Adicionar coluna
              </Button>
            )}
          </div>

          {erro && (
            <div style={{
              background: 'rgba(255,77,79,0.15)',
              border: '1px solid rgba(255,77,79,0.4)',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '20px',
              color: '#ff7875',
              fontSize: '13px'
            }}>
              {erro}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="secondary" onClick={() => navigate('/boards')} style={{ flex: 1 }}>Cancelar</Button>
            <Button variant="primary" disabled={salvando} onClick={salvar} style={{ flex: 2 }}>
              {salvando ? 'Criando...' : 'Criar quadro'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}