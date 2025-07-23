import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Event } from "@/types/event";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Hourglass, Check, X, Heart, Users, MessageCircle, Camera, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function UnlockEvent() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activating, setActivating] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchEvent = async () => {
      if (id) {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("id", id)
          .single();
        
        if (error) {
          setError("Evento não encontrado ou erro ao buscar.");
          setEvent(null);
        } else {
          setEvent(data as Event);
        }
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleBack = () => {
    if (event) {
      navigate(`/dashboard/${event.id}`);
    } else {
      navigate('/criar');
    }
  };

  const handleActivate = async () => {
    setActivating(true);
    await new Promise((resolve) => setTimeout(resolve, 1800));
    const { error } = await supabase
      .from("events")
      .update({ is_active: true })
      .eq("id", event?.id);
    setActivating(false);
    if (!error) {
      setShowCongrats(true);
    } else {
      toast({
        title: "Erro ao ativar mural",
        description: error.message || "Tente novamente.",
        variant: "destructive"
      });
    }
  };

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
        
        {/* Card de loading */}
        <div className="relative z-10 w-full max-w-md mx-auto px-6">
          <Card className="bg-white/95 backdrop-blur-sm border border-purple-100/50 shadow-xl rounded-3xl overflow-hidden">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando evento...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background com ampulheta */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5"
          style={{ backgroundImage: 'url(/ampulheta.png)' }}
        />
        
        {/* Gradiente de fundo */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-lavender-100 to-purple-200" />
        
        {/* Card de erro */}
        <div className="relative z-10 w-full max-w-md mx-auto px-6">
          <Card className="bg-white/95 backdrop-blur-sm border border-purple-100/50 shadow-xl rounded-3xl overflow-hidden">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Hourglass className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-red-800">Evento não encontrado</h2>
              <p className="text-gray-600 mb-6">{error || "O evento que você está procurando não existe ou foi removido."}</p>
              <Button 
                onClick={handleBack}
                className="w-full bg-gradient-to-br from-purple-400 via-lavender-500 to-purple-600 text-white font-semibold py-3 rounded-xl"
              >
                Voltar
              </Button>
            </CardContent>
          </Card>
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
      <div className="relative z-10 w-full max-w-lg mx-auto px-6">
        {/* Botão voltar */}
        <Button 
          variant="outline" 
          size="sm" 
          className="mb-4 w-full border-purple-200 text-purple-600 hover:bg-purple-50" 
          onClick={handleBack}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao evento
        </Button>

        <Card className="bg-white/95 backdrop-blur-sm border border-purple-100/50 shadow-xl rounded-3xl overflow-hidden">
          <CardContent className="p-8 text-center">
            {/* Conteúdo condicional baseado no estado */}
            {showCongrats ? (
              // Tela de parabéns - sem ícone/título de ativação
              <div className="space-y-6">
                {/* Mensagem de parabéns */}
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-400 via-lavender-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <div className="text-4xl">🎉</div>
                  </div>
                  <h2 className="text-2xl font-bold text-purple-800">
                    Parabéns!<br />
                    Seu mural foi ativado
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    Agora você pode compartilhar o evento e trocar mensagens, fotos e reações com seus convidados.
                  </p>
                </div>

                {/* Preview do evento */}
                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 text-center">
                  <div className="text-4xl mb-3">{event.emoji}</div>
                  <h3 className="text-lg font-bold text-purple-800 mb-2">{event.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {new Date(event.date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  {event.custom_message && (
                    <p className="text-sm italic text-gray-600">"{event.custom_message}"</p>
                  )}
                </div>

                {/* Botão de ação */}
                <Button 
                  size="lg" 
                  className="w-full py-4 rounded-xl bg-gradient-to-br from-purple-400 via-lavender-500 to-purple-600 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
                  onClick={() => navigate(`/dashboard/${event.id}`)}
                >
                  Ir para o mural
                </Button>
              </div>
            ) : (
              // Tela de ativação - com ícone/título de ativação
              <div className="space-y-6">
                {/* Ícone/Ilustração central */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-400 via-lavender-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <div className="text-3xl">{event.emoji}</div>
                  </div>
                  {/* Aura/glow effect */}
                  <div className="absolute inset-0 w-20 h-20 mx-auto bg-gradient-to-br from-purple-400/30 via-lavender-500/30 to-purple-600/30 rounded-full blur-xl animate-pulse"></div>
                </div>

                {/* Título principal */}
                <h1 className="text-2xl font-bold mb-2 text-purple-800">
                  Ativar {event.name}
                </h1>
                
                {/* Descrição */}
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Desbloqueie o mural colaborativo e transforme a espera em uma experiência compartilhada
                </p>

                {/* Valor e benefícios */}
                <div className="text-center space-y-3">
                  <p className="text-sm text-gray-700">
                    Com apenas <strong className="text-purple-600">R$ 8,90</strong>, você desbloqueia todas as funcionalidades 
                    colaborativas e transforma a ansiedade da espera em momentos de conexão.
                  </p>
                </div>

                {/* Lista de benefícios */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
                      <Users className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-purple-800">Compartilhe com quem importa</h4>
                      <p className="text-xs text-gray-600">
                        Convide pessoas especiais para viverem essa experiência juntos
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
                      <MessageCircle className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-purple-800">Mural colaborativo completo</h4>
                      <p className="text-xs text-gray-600">
                        Mensagens, fotos e interações em tempo real
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
                      <Camera className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-purple-800">Galeria de memórias</h4>
                      <p className="text-xs text-gray-600">
                        Todas as fotos organizadas automaticamente
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
                      <Download className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-purple-800">Álbum final exportável</h4>
                      <p className="text-xs text-gray-600">
                        Baixe um lindo álbum com toda a jornada da espera
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
                      <Check className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-purple-800">Backup por 1 ano</h4>
                      <p className="text-xs text-gray-600">
                        Suas memórias ficam seguras e acessíveis
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botão principal */}
                <Button
                  onClick={handleActivate}
                  className="w-full py-8 px-6 rounded-xl bg-gradient-to-br from-purple-400 via-lavender-500 to-purple-600 text-white font-bold text-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-0"
                  disabled={activating}
                >
                  {activating ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-lg">Ativando...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-0 py-2">
                      <div className="text-2xl font-black tracking-wide">R$ 8,90</div>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Check className="w-4 h-4" />
                        <span>Acesso vitalício ao evento</span>
                      </div>
                    </div>
                  )}
                </Button>

                {/* Botão secundário */}
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="w-full py-3 rounded-xl border-2 border-purple-200 hover:bg-purple-50 transition-all text-purple-600"
                >
                  <X className="w-4 h-4 mr-2" />
                  Talvez mais tarde
                </Button>

                {/* Footer */}
                <div className="text-center pt-2 border-t border-purple-200">
                  <p className="text-xs text-gray-500">
                    💡 Pagamento único por evento
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 