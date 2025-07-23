import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Hourglass, Clock, Users } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Verificar se usuário já está logado e redirecionar
  useEffect(() => {
    if (!loading && user) {
      // Usuário está logado, verificar se tem eventos
      const checkUserEvents = async () => {
        try {
          const { data: eventsData } = await supabase
            .from('events')
            .select('id, name, is_active')
            .eq('created_by', user.id)
            .order('created_at', { ascending: false });
          
          if (eventsData && eventsData.length > 0) {
            // Usuário tem eventos, ir para dashboard do evento mais recente
            const latestEvent = eventsData[0];
            navigate(`/dashboard/${latestEvent.id}`);
          } else {
            // Usuário não tem eventos, ir para página de escolha
            navigate('/escolher-acao');
          }
        } catch (error) {
          console.error('Erro ao verificar eventos:', error);
          // Em caso de erro, ir para página de escolha
          navigate('/escolher-acao');
        }
      };

      checkUserEvents();
    }
  }, [user, loading, navigate]);

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background com ampulheta */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5"
          style={{ backgroundImage: 'url(/ampulheta.png)' }}
        />
        
        {/* Gradiente de fundo */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-lavender-100 to-purple-200" />
        
        {/* Loading */}
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background com ampulheta */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5"
        style={{ backgroundImage: 'url(/ampulheta.png)' }}
      />
      
      {/* Gradiente de fundo */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-lavender-100 to-purple-200" />
      
      {/* Card principal */}
      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <Card className="bg-white/95 backdrop-blur-sm border border-purple-100/50 shadow-xl rounded-3xl overflow-hidden">
          <CardContent className="p-10 text-center">
            {/* Ícone/Ilustração central */}
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-400 via-lavender-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <Hourglass className="w-10 h-10 text-white" />
              </div>
              {/* Aura/glow effect */}
              <div className="absolute inset-0 w-20 h-20 mx-auto bg-gradient-to-br from-purple-400/30 via-lavender-500/30 to-purple-600/30 rounded-full blur-xl animate-pulse"></div>
            </div>

            {/* Título principal */}
            <h1 className="text-4xl md:text-5xl font-bold mb-2 text-purple-800">
              WeCount
            </h1>
            
            {/* Descrição */}
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              A contagem que aproxima.
            </p>

            {/* Features/benefícios */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center justify-center gap-3 text-base text-gray-600">
                <Clock className="w-5 h-5 text-purple-500" />
                <span>Contagens personalizadas</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-base text-gray-600">
                <Hourglass className="w-5 h-5 text-purple-500" />
                <span>Momentos emocionais</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-base text-gray-600">
                <Users className="w-5 h-5 text-purple-500" />
                <span>Compartilhamento especial</span>
              </div>
            </div>
            
            {/* Botão principal */}
              <Button
                className="w-full py-5 rounded-xl bg-gradient-to-br from-purple-400 via-lavender-500 to-purple-600 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                onClick={() => navigate("/login")}
              >
                Começar agora
              </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
