import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar sessão atual
    const checkSession = async () => {
      try {
        setLoading(true);
        console.log('Verificando sessão persistente...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao verificar sessão:', error);
          setError(error.message);
          setUser(null);
        } else if (session?.user) {
          console.log('Sessão persistente encontrada:', session.user.id, session.user.email);
          setUser(session.user);
          setError(null);
        } else {
          console.log('Nenhuma sessão persistente encontrada');
          setUser(null);
          setError(null);
        }
      } catch (err) {
        console.error('Erro geral na verificação de sessão:', err);
        setError('Erro ao verificar autenticação');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id, session?.user?.email);
        
        switch (event) {
          case 'SIGNED_IN':
            if (session?.user) {
              console.log('Usuário logado:', session.user.email);
              setUser(session.user);
              setError(null);
            }
            break;
          case 'SIGNED_OUT':
            console.log('Usuário deslogado');
            setUser(null);
            setError(null);
            break;
          case 'TOKEN_REFRESHED':
            if (session?.user) {
              console.log('Token renovado:', session.user.email);
              setUser(session.user);
              setError(null);
            }
            break;
          case 'USER_UPDATED':
            if (session?.user) {
              console.log('Usuário atualizado:', session.user.email);
              setUser(session.user);
              setError(null);
            }
            break;
          default:
            console.log('Evento de auth não tratado:', event);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      console.log('Fazendo logout...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro ao fazer logout:', error);
        setError(error.message);
      } else {
        console.log('Logout realizado com sucesso');
        setUser(null);
        setError(null);
      }
    } catch (err) {
      console.error('Erro geral no logout:', err);
      setError('Erro ao fazer logout');
    }
  };

  const refreshSession = async () => {
    try {
      console.log('Renovando sessão...');
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Erro ao renovar sessão:', error);
        setError(error.message);
      } else if (data.session) {
        console.log('Sessão renovada com sucesso');
        setUser(data.session.user);
        setError(null);
      }
    } catch (err) {
      console.error('Erro geral ao renovar sessão:', err);
      setError('Erro ao renovar sessão');
    }
  };

  return {
    user,
    loading,
    error,
    signOut,
    refreshSession,
    isAuthenticated: !!user
  };
}; 