import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button';

export default function TrocarSenha() {
  const navigate = useNavigate();

  const [senhaAtual, setSenhaAtual] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const salvar = async () => {
    setErro('');

    // validações no front (antes de mandar pro backend)
    if (!senhaAtual || !senhaNova || !confirmarSenha) {
      setErro('Preencha todos os campos.');
      return;
    }
    if (senhaNova.length < 6) {
      setErro('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (senhaNova !== confirmarSenha) {
      setErro('A confirmação não bate com a nova senha.');
      return;
    }
    if (senhaNova === senhaAtual) {
      setErro('A nova senha precisa ser diferente da atual.');
      return;
    }

    setSalvando(true);
    try {
      await api.patch('/api/auth/trocar-senha', {
        senhaAtual,
        senhaNova,
      });
      setSucesso(true);
      // limpa os campos
      setSenhaAtual('');
      setSenhaNova('');
      setConfirmarSenha('');
    } catch (err: any) {
      // o backend responde "Senha atual incorreta" quando a senhaAtual não bate
      const msg = err.response?.data?.message || err.response?.data || '';
      if (typeof msg === 'string' && msg.toLowerCase().includes('incorreta')) {
        setErro('A senha atual está incorreta.');
      } else {
        setErro('Não foi possível trocar a senha. Tente de novo.');
      }
    } finally {
      setSalvando(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
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
    color: 'rgba(255,255,255,0.7)',
    fontSize: '13px',
    marginBottom: '8px',
    fontWeight: 500,
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
        <Button variant="ghost" onClick={() => navigate(-1)}>← Voltar</Button>
        <div>
          <div style={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>Trocar senha</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Atualize sua senha de acesso</div>
        </div>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 16px' }}>
        <div style={{
          width: '100%',
          maxWidth: '440px',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '32px'
        }}>
          {sucesso ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '56px', height: '56px',
                background: 'rgba(99,153,34,0.15)',
                border: '1px solid rgba(99,153,34,0.4)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', fontSize: '26px'
              }}>✓</div>
              <h3 style={{ color: 'white', margin: '0 0 8px', fontSize: '18px' }}>Senha alterada!</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: '0 0 24px' }}>
                Sua senha foi atualizada com sucesso.
              </p>
              <Button variant="primary" onClick={() => navigate('/boards')} style={{ width: '100%' }}>
                Voltar aos quadros
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={labelStyle}>Senha atual</label>
                <input type="password" style={inputStyle} value={senhaAtual}
                  placeholder="••••••••"
                  onChange={(e) => setSenhaAtual(e.target.value)} />
              </div>

              <div>
                <label style={labelStyle}>Nova senha</label>
                <input type="password" style={inputStyle} value={senhaNova}
                  placeholder="Mínimo 6 caracteres"
                  onChange={(e) => setSenhaNova(e.target.value)} />
              </div>

              <div>
                <label style={labelStyle}>Confirmar nova senha</label>
                <input type="password" style={inputStyle} value={confirmarSenha}
                  placeholder="Repita a nova senha"
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') salvar(); }} />
              </div>

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

              <Button variant="primary" disabled={salvando} onClick={salvar} style={{ width: '100%', padding: '13px' }}>
                {salvando ? 'Alterando...' : 'Trocar senha'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}