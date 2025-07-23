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
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao verificar sessão:', error);
          setError(error.message);
          setUser(null);
        } else if (session?.user) {
          console.log('Sessão encontrada:', session.user.id);
          setUser(session.user);
          setError(null);
        } else {
          console.log('Nenhuma sessão encontrada');
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
        console.log('Auth state change:', event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          setError(null);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setError(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setUser(session.user);
          setError(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro ao fazer logout:', error);
        setError(error.message);
      } else {
        setUser(null);
        setError(null);
      }
    } catch (err) {
      console.error('Erro geral no logout:', err);
      setError('Erro ao fazer logout');
    }
  };

  return {
    user,
    loading,
    error,
    signOut,
    isAuthenticated: !!user
  };
}; 