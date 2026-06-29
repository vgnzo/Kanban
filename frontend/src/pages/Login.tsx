import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Button from '../components/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      const response = await api.post('/api/auth/login', { email, senha });
      const { token, nome, perfil } = response.data;
      login(token, { nome, email, perfil });
      navigate('/kanban');
    } catch {
      setErro('Email ou senha incorretos');
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
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '28px'
          }}>⚙️</div>
          <h1 style={{ color: 'white', margin: 0, fontSize: '24px', fontWeight: 600 }}>
            Kanban Equipamentos
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: '8px 0 0', fontSize: '14px' }}>
            Gestão de equipamentos parados
          </p>
        </div>

        <form onSubmit={handleLogin}>
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
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s'
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
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
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

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={loading}
            style={{ padding: '13px', fontSize: '15px', letterSpacing: '0.5px' }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
          Não tem conta?{' '}
          <Link to="/cadastro" style={{ color: '#667eea', textDecoration: 'none', fontWeight: 500 }}>
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}