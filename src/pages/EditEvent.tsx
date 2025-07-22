import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EventCreator } from "@/components/EventCreator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Event } from "@/types/event";
import { supabase } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";

export default function EditEvent() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ name?: string; email: string } | null>(null);
  const navigate = useNavigate();

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

  const handleEventUpdate = (updatedEvent: Event) => {
    // Navegar de volta para o dashboard do evento
    navigate(`/dashboard/${updatedEvent.id}`);
  };

  const handleBack = () => {
    if (event) {
      navigate(`/dashboard/${event.id}`);
    } else {
      navigate('/criar');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-gentle px-4">
        <div className="w-full max-w-lg">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando evento...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-gentle px-4">
        <div className="w-full max-w-lg">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error || "Evento não encontrado"}</p>
                <Button onClick={handleBack} className="bg-gradient-to-br from-purple-400 via-lavender-500 to-purple-600 text-white">
                  Voltar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-gentle px-4">
      <div className="w-full max-w-lg">
        {/* Botão voltar */}
        <Button 
          variant="outline" 
          size="sm" 
          className="mb-4 w-full border-purple-200 text-purple-700 hover:bg-purple-50" 
          onClick={handleBack}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao evento
        </Button>

        {/* Card de edição */}
        <Card className="bg-white/80 backdrop-blur-sm border border-purple-100/50">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-semibold text-gray-800">
              Editar Evento
            </CardTitle>
            <p className="text-sm text-gray-600">
              Modifique os detalhes do seu evento
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <EventCreator 
              mode="edit" 
              initialEvent={event} 
              onEventCreate={handleEventUpdate}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 