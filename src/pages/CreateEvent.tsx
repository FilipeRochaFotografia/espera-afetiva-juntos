import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EventCreator } from "@/components/EventCreator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Event } from "@/types/event";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function CreateEvent() {
  const [createdEvent, setCreatedEvent] = useState<Event | null>(null);
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [user, setUser] = useState<{ name?: string; email: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const [lastEventId, setLastEventId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndEvents = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userObj = userData?.user;
      if (userObj) {
        setUser({
          name: userObj.user_metadata?.name,
          email: userObj.email,
        });
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("created_by", userObj.id)
          .order("date", { ascending: true });
        if (!error && data) setUserEvents(data as Event[]);
        // Mostrar formulário direto sempre que acessar /criar
        setShowForm(true);
      }
      // Recupera último evento acessado do localStorage
      const lastId = localStorage.getItem("lastEventId");
      if (lastId) setLastEventId(lastId);
    };
    fetchUserAndEvents();
  }, []);

  // Mostrar formulário direto quando acessar /criar
  useEffect(() => {
    setShowForm(true);
  }, []);

  // Sempre que acessar um evento, salve o id no localStorage
  const handleAccessEvent = (id: string) => {
    localStorage.setItem("lastEventId", id);
    navigate(`/dashboard/${id}`);
  };

  // Função para voltar ao último evento acessado
  const handleBackToEvent = () => {
    if (lastEventId) {
      // Verificar se o evento ainda existe na lista do usuário
      const eventExists = userEvents.some(event => event.id === lastEventId);
      if (eventExists) {
        navigate(`/dashboard/${lastEventId}`);
      } else {
        // Se o evento não existe mais, limpar o localStorage e não mostrar o botão
        localStorage.removeItem("lastEventId");
        setLastEventId(null);
      }
    }
  };

  const handleEventCreate = (event: Event) => {
    setCreatedEvent(event);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

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
        <Card className="bg-white/95 backdrop-blur-sm border border-purple-100/50 shadow-xl rounded-3xl overflow-hidden">
          <CardContent className="p-8">
            {/* Botão voltar para o evento */}
            {lastEventId && userEvents.length > 0 && !createdEvent && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mb-6 w-full border-purple-200 text-purple-600 hover:bg-purple-50" 
                onClick={handleBackToEvent}
              >
                ← Voltar para o evento
              </Button>
            )}
            
            {/* Formulário de criação de evento */}
            {!createdEvent && (
              <EventCreator onEventCreate={handleEventCreate} />
            )}
            
            {/* Tela de resumo após criar evento */}
            {createdEvent && (
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-400 via-lavender-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg mb-4">
                    <div className="text-2xl">{createdEvent.emoji}</div>
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-purple-800">
                    Evento criado com sucesso!
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Confira os principais detalhes da sua<br />
                    contagem regressiva especial:
                  </p>
                </div>
                
                <div className="bg-purple-50 rounded-xl p-6 mb-6">
                  <div className="text-3xl mb-3">{createdEvent.emoji}</div>
                  <div className="text-xl font-semibold mb-2 text-purple-800">{createdEvent.name}</div>
                  <div className="text-lg text-gray-600 mb-2">
                    {new Date(createdEvent.date).toLocaleDateString()} às {new Date(createdEvent.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-base text-gray-600 mb-2">
                    Tema: <span className="font-medium text-purple-700">{createdEvent.theme}</span>
                  </div>
                  {createdEvent.custom_message && (
                    <div className="text-base italic text-gray-600">"{createdEvent.custom_message}"</div>
                  )}
                </div>
                
                <Button
                  className="w-full py-4 rounded-xl bg-gradient-to-br from-purple-400 via-lavender-500 to-purple-600 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  onClick={() => navigate(`/desbloquear/${createdEvent.id}`)}
                >
                  Avançar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 