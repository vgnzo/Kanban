import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';

// Interface para organizar os painéis dinamicamente
interface Painel {
  id: string;
  nome: string;
  desc: string;
  rota: string;
  icone: string;
  cor: string;
}

export default function EscolhaKanban() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  // Lista de Kanbans inicial (os seus dois padrões)
  const [paineis, setPaineis] = useState<Painel[]>([
    { 
      id: 'equipamentos', 
      nome: 'Kanban Equipamentos', 
      desc: 'Gestão de frotas e equipamentos na oficina.', 
      rota: '/kanban', 
      icone: '⚙️', 
      cor: '#667eea' 
    },
    { 
      id: 'tarefas', 
      nome: 'Kanban de Tarefas', 
      desc: 'Gerenciamento de atividades gerais da equipe.', 
      rota: '/kanban-generico', 
      icone: '📋', 
      cor: '#764ba2' 
    }
  ]);

  // Função que o Admin usa para criar um novo painel
  const handleCriarKanban = () => {
    const nomeComutado = prompt('Digite o nome do novo Kanban:');
    if (!nomeComutado) return;

    const descricao = prompt('Digite uma breve descrição para este Kanban:') || 'Painel personalizado.';

    const novoPainel: Painel = {
      id: `custom-${Date.now()}`,
      nome: nomeComutado,
      desc: descricao,
      rota: '/kanban-generico', // Aponta para o genérico que aceita qualquer tarefa
      icone: '🚀',
      cor: '#2ecc71' // Cor verde para destacar os novos
    };

    setPaineis([...paineis, novoPainel]);
  };

  // Verifica se o perfil do usuário logado é admin (convertendo para minúsculo para evitar erros)
  const isAdmin = usuario?.perfil?.toLowerCase() === 'admin';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      fontFamily: "'Segoe UI', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '520px',
        textAlign: 'center',
        boxShadow: '0 25px 50px rgba(0,0,0,0.4)'
      }}>
        <h2 style={{ color: 'white', margin: '0 0 10px 0', fontWeight: 600 }}>
          Olá, {usuario?.nome}! 👋
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: '0 0 30px 0' }}>
          Selecione ou gerencie seus painéis de gestão:
        </p>

        {/* 🌟 BOTÃO EXCLUSIVO DO ADMIN */}
        {isAdmin && (
          <button
            onClick={handleCriarKanban}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #f5af19, #f12711)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontWeight: 600,
              fontSize: '15px',
              cursor: 'pointer',
              marginBottom: '24px',
              boxShadow: '0 4px 15px rgba(241, 39, 17, 0.3)',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            ➕ Criar Novo Kanban (Admin)
          </button>
        )}

        {/* LISTA DE KANBANS RENDERIZADA DINAMICAMENTE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {paineis.map((painel) => (
            <div
              key={painel.id}
              onClick={() => navigate(painel.rota)}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.borderColor = painel.cor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>{painel.icone}</span>
                <div>
                  <div style={{ color: 'white', fontWeight: 600, fontSize: '15px' }}>{painel.nome}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '2px' }}>
                    {painel.desc}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '32px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
          <Button variant="secondary" onClick={logout} style={{ width: '100%' }}>
            Sair da Conta
          </Button>
        </div>
      </div>
    </div>
  );
}