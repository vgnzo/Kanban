import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      const response = await api.post('/api/auth/registrar', { nome, email, senha });
      const { token, nome: nomeResp, perfil } = response.data;
      login(token, { nome: nomeResp, email, perfil });
      navigate('/kanban');
    } catch (err: any) {
      if (err.response?.data?.message?.includes('já cadastrado')) {
        setErro('Esse email já está cadastrado');
      } else {
        setErro('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Segoe UI', sans-serif"
    }}>
      <div style={{
        width: '420px',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '48px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.4)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px', height: '64px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: '28px'
          }}>⚙️</div>
          <h1 style={{ color: 'white', margin: 0, fontSize: '24px', fontWeight: 600 }}>
            Criar conta
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: '8px 0 0', fontSize: '14px' }}>
            Cadastre-se para acessar o sistema
          </p>
        </div>

        <form onSubmit={handleCadastro}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginBottom: '8px', fontWeight: 500 }}>
              NOME
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome"
              required
              style={{
                width: '100%', padding: '12px 16px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px', color: 'white',
                fontSize: '14px', outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginBottom: '8px', fontWeight: 500 }}>
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              style={{
                width: '100%', padding: '12px 16px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px', color: 'white',
                fontSize: '14px', outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginBottom: '8px', fontWeight: 500 }}>
              SENHA
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%', padding: '12px 16px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px', color: 'white',
                fontSize: '14px', outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          {erro && (
            <div style={{
              background: 'rgba(255,77,79,0.15)',
              border: '1px solid rgba(255,77,79,0.4)',
              borderRadius: '8px', padding: '10px 14px',
              marginBottom: '20px', color: '#ff7875', fontSize: '13px'
            }}>{erro}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '13px',
              background: loading ? 'rgba(102,126,234,0.5)' : 'linear-gradient(135deg, #667eea, #764ba2)',
              border: 'none', borderRadius: '8px',
              color: 'white', fontSize: '15px', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.5px'
            }}
          >
            {loading ? 'Criando conta...' : 'Cadastrar'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
          Já tem conta?{' '}
          <Link to="/login" style={{ color: '#667eea', textDecoration: 'none', fontWeight: 500 }}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}