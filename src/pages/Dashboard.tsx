import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CountdownPreview } from "../components/CountdownPreview";
import { MuralCollaborativo } from "../components/MuralCollaborativo";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Event } from "../types/event";
import { supabase } from "../lib/supabase";
import { Settings, List, Share, MessageCircle, Send, Copy, Plus, User, X } from "lucide-react";
import { useToast } from "../hooks/use-toast";

const Dashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ name?: string; email: string } | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showAddToMural, setShowAddToMural] = useState(false);
  const [showManageEvents, setShowManageEvents] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserAndEvent = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userObj = userData?.user;
      if (userObj) {
        setUser({
          name: userObj.user_metadata?.name,
          email: userObj.email,
        });
      }
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
    fetchUserAndEvent();
  }, [id]);

  // Navegação separada para evitar setState durante renderização
  useEffect(() => {
    if (error || (!loading && !event)) {
      navigate('/criar');
    }
  }, [error, loading, event, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleShare = async () => {
    if (event && !event.is_active) {
      navigate(`/desbloquear/${event.id}`);
    } else if (event) {
      setShowShareOptions(!showShareOptions);
    }
  };

  const handleEdit = () => {
    if (event) {
      navigate(`/editar/${event.id}`);
    }
  };

  const shareNative = async () => {
    if (navigator.share && event) {
      try {
        await navigator.share({
          title: event.name,
          text: `Contando os dias para: ${event.name} ${event.emoji}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Erro ao compartilhar:', error);
      }
    } else {
      fallbackShare();
    }
  };

  const fallbackShare = () => {
    const url = window.location.href;
    const text = `Contando os dias para: ${event?.name} ${event?.emoji}`;
    
    navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
      toast({
        title: "Link copiado!",
        description: "Cole o link onde quiser compartilhar.",
        duration: 2000,
      });
    });
  };

  const shareToSocial = (platform: 'whatsapp' | 'telegram' | 'facebook') => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Contando os dias para: ${event?.name} ${event?.emoji}`);
    
    const shareUrls = {
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`
    };
    
    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-center text-muted-foreground">Carregando evento...</div>;
  }
  if (error || !event) {
    // Usar useEffect para navegação em vez de chamar durante renderização
    return <div className="min-h-screen flex items-center justify-center text-center text-muted-foreground">Redirecionando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-lavender-100 to-purple-200 flex flex-col">


      {/* Popover de configurações */}
      {showConfig && user && (
        <div className="fixed bottom-24 right-6 z-50 bg-gradient-to-br from-white/95 to-purple-50/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 min-w-[280px] border border-purple-100/40 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 via-lavender-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
              {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-medium text-gray-700">{user.name || "Usuário"}</div>
              <div className="text-sm text-gray-400">{user.email}</div>
            </div>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleLogout} 
            className="w-full border-purple-100 text-purple-600 hover:bg-purple-25 rounded-xl py-2"
          >
            Sair da conta
          </Button>
        </div>
      )}

      {/* Conteúdo principal */}
      <main className="flex-1 w-full max-w-md mx-auto px-6 py-8 pb-24 space-y-8">
        {/* Card do evento */}
        <div className="bg-gradient-to-br from-purple-100 via-lavender-200 to-purple-300 backdrop-blur-sm rounded-2xl shadow-sm border border-purple-200/50 p-6">
          <CountdownPreview event={event} onShare={handleShare} onEdit={handleEdit} />
        </div>
        
        {/* Mural Colaborativo */}
        <div className="bg-gradient-to-br from-white/90 to-purple-50/70 backdrop-blur-sm rounded-2xl shadow-sm border border-purple-100/30 overflow-hidden">
          <MuralCollaborativo 
            event={event} 
            isActive={event.is_active || false} 
            showCreatePost={showAddToMural}
            setShowCreatePost={setShowAddToMural}
          />
        </div>
      </main>

      {/* Modal de opções de compartilhamento */}
      {showShareOptions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setShowShareOptions(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-lg border border-gray-100 p-6 min-w-[280px] max-w-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Compartilhar</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowShareOptions(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="space-y-3">
              <Button
                variant="ghost"
                onClick={() => {
                  shareNative();
                  setShowShareOptions(false);
                }}
                className="w-full justify-start h-12 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                <Share className="w-4 h-4 mr-3" />
                Compartilhar nativo
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => {
                  shareToSocial('whatsapp');
                  setShowShareOptions(false);
                }}
                className="w-full justify-start h-12 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                <MessageCircle className="w-4 h-4 mr-3" />
                WhatsApp
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => {
                  shareToSocial('telegram');
                  setShowShareOptions(false);
                }}
                className="w-full justify-start h-12 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                <Send className="w-4 h-4 mr-3" />
                Telegram
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => {
                  fallbackShare();
                  setShowShareOptions(false);
                }}
                className="w-full justify-start h-12 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                <Copy className="w-4 h-4 mr-3" />
                Copiar link
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Gerenciar Eventos */}
      {showManageEvents && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setShowManageEvents(false)}
          />
          <div className="relative bg-gradient-to-br from-white/95 to-purple-50/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 min-w-[320px] max-w-md w-full border border-purple-100/40">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Seus eventos</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowManageEvents(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {/* Card do evento atual */}
              <div className="bg-white/80 rounded-xl p-4 border border-purple-100/50 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{event?.emoji}</div>
                    <div>
                      <div className="font-medium text-gray-800">{event?.name}</div>
                      <div className="text-sm text-gray-500">
                        {event?.date ? new Date(event.date).toLocaleDateString('pt-BR') : 'Data não definida'}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setShowManageEvents(false)}
                    className="bg-gradient-to-br from-purple-400 via-lavender-500 to-purple-600 text-white px-4 py-2 rounded-lg"
                  >
                    Acessar
                  </Button>
                </div>
              </div>
              
              {/* Botão criar novo evento */}
              <Button
                onClick={() => {
                  setShowManageEvents(false);
                  navigate('/criar');
                }}
                className="w-full bg-gradient-to-br from-purple-400 via-lavender-500 to-purple-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar novo evento
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Navegação Inferior */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-purple-100">
        <div className="max-w-md mx-auto px-6 py-3 flex items-center justify-between relative">
          {/* Botão Gerenciar */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowManageEvents(true)}
            className="flex flex-col items-center gap-1 text-purple-600 hover:text-purple-700 hover:bg-purple-25 rounded-xl px-3 py-2"
          >
            <List className="w-5 h-5" />
            <span className="text-xs">Gerenciar</span>
          </Button>

          {/* Botão + (Adicionar ao mural) */}
          <Button
            onClick={() => {
              if (event && event.is_active) {
                setShowAddToMural(true);
              } else {
                navigate(`/desbloquear/${event?.id}`);
              }
            }}
            className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-purple-400 via-lavender-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
          >
            <Plus className="w-6 h-6" />
          </Button>

          {/* Botão Perfil */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowConfig(!showConfig)}
            className="flex flex-col items-center gap-1 text-purple-600 hover:text-purple-700 hover:bg-purple-25 rounded-xl px-3 py-2"
          >
            <User className="w-5 h-5" />
            <span className="text-xs">Perfil</span>
          </Button>
        </div>
      </nav>

      {/* Overlay para fechar configurações */}
      {showConfig && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setShowConfig(false)}
        />
      )}
    </div>
  );
};

export default Dashboard; 