import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button';

interface Equipamento {
  id: string;
  frota: string;
  modelo: string;
  marca: string | null;
  horimetro: number | null;
  unidade: string;
}

interface Unidade {
  id: string;
  nome: string;
  cidade: string | null;
  estado: string | null;
}

export default function GerenciarEquipamentos() {
  const navigate = useNavigate();
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [erro, setErro] = useState('');

  // controle dos modais
  const [modalEquip, setModalEquip] = useState(false);
  const [modalUnidade, setModalUnidade] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // formulário de equipamento
  const [formEquip, setFormEquip] = useState({
    frota: '',
    modelo: '',
    marca: '',
    horimetro: '',
    unidadeId: '',
  });

  // formulário de unidade
  const [formUnidade, setFormUnidade] = useState({
    nome: '',
    cidade: '',
    estado: '',
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [resEquip, resUnid] = await Promise.all([
        api.get('/api/equipamentos'),
        api.get('/api/unidades'),
      ]);
      setEquipamentos(resEquip.data);
      setUnidades(resUnid.data);
    } catch {
      setErro('Erro ao carregar dados.');
    }
  };

  const salvarEquipamento = async () => {
    setErro('');
    setSalvando(true);
    try {
      await api.post('/api/equipamentos', {
        frota: formEquip.frota,
        modelo: formEquip.modelo,
        marca: formEquip.marca || null,
        horimetro: formEquip.horimetro ? Number(formEquip.horimetro) : null,
        unidadeId: formEquip.unidadeId,
      });
      setFormEquip({ frota: '', modelo: '', marca: '', horimetro: '', unidadeId: '' });
      setModalEquip(false);
      await carregarDados();
    } catch {
      setErro('Erro ao cadastrar equipamento. Verifique os campos.');
    } finally {
      setSalvando(false);
    }
  };

  const salvarUnidade = async () => {
    setErro('');
    setSalvando(true);
    try {
      const res = await api.post('/api/unidades', {
        nome: formUnidade.nome,
        cidade: formUnidade.cidade || null,
        estado: formUnidade.estado || null,
      });
      setFormUnidade({ nome: '', cidade: '', estado: '' });
      setModalUnidade(false);
      await carregarDados();
      // já deixa a unidade recém-criada selecionada no form de equipamento
      setFormEquip(f => ({ ...f, unidadeId: res.data.id }));
    } catch {
      setErro('Erro ao cadastrar unidade.');
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
        <div style={{ flex: 1 }}>
          <div style={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>Equipamentos</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Cadastro da frota de equipamentos</div>
        </div>
        <Button variant="primary" onClick={() => setModalEquip(true)}>+ Novo equipamento</Button>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 16px' }}>
        <div style={{
          width: '100%',
          maxWidth: '760px',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '24px'
        }}>
          {erro && (
            <div style={{
              background: 'rgba(255,77,79,0.15)',
              border: '1px solid rgba(255,77,79,0.4)',
              borderRadius: '8px', padding: '10px 14px',
              color: '#ff7875', fontSize: '13px', marginBottom: '16px'
            }}>{erro}</div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {equipamentos.map(eq => (
              <div key={eq.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                padding: '14px 16px'
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>
                    {eq.frota} <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>· {eq.modelo}</span>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '2px' }}>
                    {eq.marca && `${eq.marca} · `}{eq.horimetro != null && `${eq.horimetro}h · `}{eq.unidade}
                  </div>
                </div>
              </div>
            ))}

            {equipamentos.length === 0 && !erro && (
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', textAlign: 'center', padding: '24px' }}>
                Nenhum equipamento cadastrado ainda.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== MODAL: NOVO EQUIPAMENTO ===== */}
      {modalEquip && (
        <div onClick={() => setModalEquip(false)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '16px', padding: '28px',
            width: '90%', maxWidth: '460px',
            maxHeight: '85vh', overflowY: 'auto',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: 'white', margin: 0, fontSize: '17px' }}>Novo equipamento</h3>
              <Button variant="icon" onClick={() => setModalEquip(false)}>×</Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Frota *</label>
                <input style={inputStyle} value={formEquip.frota}
                  onChange={(e) => setFormEquip({ ...formEquip, frota: e.target.value })}
                  placeholder="Ex: F-7578" />
              </div>
              <div>
                <label style={labelStyle}>Modelo *</label>
                <input style={inputStyle} value={formEquip.modelo}
                  onChange={(e) => setFormEquip({ ...formEquip, modelo: e.target.value })}
                  placeholder="Ex: Toyota 8FD50N" />
              </div>
              <div>
                <label style={labelStyle}>Marca</label>
                <input style={inputStyle} value={formEquip.marca}
                  onChange={(e) => setFormEquip({ ...formEquip, marca: e.target.value })}
                  placeholder="Ex: Toyota" />
              </div>
              <div>
                <label style={labelStyle}>Horímetro</label>
                <input style={inputStyle} type="number" value={formEquip.horimetro}
                  onChange={(e) => setFormEquip({ ...formEquip, horimetro: e.target.value })}
                  placeholder="Ex: 5435" />
              </div>
              <div>
                <label style={labelStyle}>Unidade *</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    value={formEquip.unidadeId}
                    onChange={(e) => setFormEquip({ ...formEquip, unidadeId: e.target.value })}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="" style={{ background: '#1a1a2e' }}>Selecione a unidade</option>
                    {unidades.map(u => (
                      <option key={u.id} value={u.id} style={{ background: '#1a1a2e' }}>
                        {u.nome}{u.estado ? ` (${u.estado})` : ''}
                      </option>
                    ))}
                  </select>
                  <Button variant="secondary" onClick={() => setModalUnidade(true)} style={{ whiteSpace: 'nowrap' }}>+ Unidade</Button>
                </div>
              </div>

              <Button
                variant="primary" fullWidth disabled={salvando}
                onClick={salvarEquipamento}
                style={{ marginTop: '4px', padding: '12px' }}
              >{salvando ? 'Salvando...' : 'Cadastrar equipamento'}</Button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: NOVA UNIDADE ===== */}
      {modalUnidade && (
        <div onClick={() => setModalUnidade(false)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '16px', padding: '28px',
            width: '90%', maxWidth: '400px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: 'white', margin: 0, fontSize: '17px' }}>Nova unidade</h3>
              <Button variant="icon" onClick={() => setModalUnidade(false)}>×</Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Nome *</label>
                <input style={inputStyle} value={formUnidade.nome}
                  onChange={(e) => setFormUnidade({ ...formUnidade, nome: e.target.value })}
                  placeholder="Ex: Albras" />
              </div>
              <div>
                <label style={labelStyle}>Cidade</label>
                <input style={inputStyle} value={formUnidade.cidade}
                  onChange={(e) => setFormUnidade({ ...formUnidade, cidade: e.target.value })}
                  placeholder="Ex: Barcarena" />
              </div>
              <div>
                <label style={labelStyle}>Estado (UF)</label>
                <input style={inputStyle} maxLength={2} value={formUnidade.estado}
                  onChange={(e) => setFormUnidade({ ...formUnidade, estado: e.target.value.toUpperCase() })}
                  placeholder="Ex: PA" />
              </div>

              <Button
                variant="primary" fullWidth disabled={salvando}
                onClick={salvarUnidade}
                style={{ marginTop: '4px', padding: '12px' }}
              >{salvando ? 'Salvando...' : 'Cadastrar unidade'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}