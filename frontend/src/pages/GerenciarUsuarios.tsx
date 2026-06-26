import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: 'ADMIN' | 'USER';
}

export default function GerenciarUsuarios() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      const res = await api.get('/api/usuarios');
      setUsuarios(res.data);
    } catch {
      setErro('Erro ao carregar usuários.');
    }
  };

  const alterarPerfil = async (id: string, novoPerfil: 'ADMIN' | 'USER') => {
    setErro('');
    setLoadingId(id);
    try {
      await api.patch(`/api/usuarios/${id}/perfil`, { perfil: novoPerfil });
      await carregarUsuarios();
    } catch {
      setErro('Erro ao alterar perfil do usuário.');
    } finally {
      setLoadingId(null);
    }
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
          <div style={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>Gerenciar usuários</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Promover ou rebaixar permissões de acesso</div>
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
          {erro && (
            <div style={{
              background: 'rgba(255,77,79,0.15)',
              border: '1px solid rgba(255,77,79,0.4)',
              borderRadius: '8px', padding: '10px 14px',
              color: '#ff7875', fontSize: '13px', marginBottom: '16px'
            }}>{erro}</div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {usuarios.map(u => (
              <div key={u.id} style={{
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
                  <div style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>{u.nome}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{u.email}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    color: u.perfil === 'ADMIN' ? '#9eff9e' : 'rgba(255,255,255,0.6)',
                    background: u.perfil === 'ADMIN' ? 'rgba(80,220,100,0.15)' : 'rgba(255,255,255,0.08)',
                    border: u.perfil === 'ADMIN' ? '1px solid rgba(80,220,100,0.4)' : '1px solid rgba(255,255,255,0.15)'
                  }}>{u.perfil}</span>

                  {u.perfil === 'USER' ? (
                    <Button
                      variant="primary"
                      onClick={() => alterarPerfil(u.id, 'ADMIN')}
                      disabled={loadingId === u.id}
                    >{loadingId === u.id ? '...' : 'Promover'}</Button>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={() => alterarPerfil(u.id, 'USER')}
                      disabled={loadingId === u.id}
                    >{loadingId === u.id ? '...' : 'Rebaixar'}</Button>
                  )}
                </div>
              </div>
            ))}

            {usuarios.length === 0 && !erro && (
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', textAlign: 'center', padding: '24px' }}>
                Nenhum usuário cadastrado ainda.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}