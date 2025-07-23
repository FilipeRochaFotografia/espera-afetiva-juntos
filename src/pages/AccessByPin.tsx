import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Event } from "@/types/event";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Key, Users, Calendar, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AccessByPin() {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePinChange = (value: string) => {
    // Permitir apenas letras e números, máximo 6 caracteres
    const cleanValue = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6);
    setPin(cleanValue);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pin.length !== 6) {
      setError("O PIN deve ter 6 caracteres");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Buscar evento por PIN
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('pin', pin)
        .single();

      if (error || !data) {
        setError("PIN inválido ou evento não encontrado");
        setEvent(null);
      } else {
        setEvent(data as Event);
        toast({
          title: "Evento encontrado!",
          description: `Acessando: ${data.name}`,
          duration: 2000,
        });
        
        // Navegar para o dashboard do evento
        setTimeout(() => {
          navigate(`/dashboard/${data.id}`);
        }, 1000);
      }
    } catch (error) {
      setError("Erro ao buscar evento");
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = async () => {
    // Verificar se o usuário está logado e tem eventos
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      const { data: eventsData } = await supabase
        .from('events')
        .select('id, name, is_active')
        .eq('created_by', userData.user.id)
        .order('created_at', { ascending: false });
      
      if (eventsData && eventsData.length > 0) {
        // Usuário tem eventos, ir para dashboard do evento mais recente
        const latestEvent = eventsData[0];
        navigate(`/dashboard/${latestEvent.id}`);
      } else {
        // Usuário não tem eventos, ir para criar evento
        navigate('/criar');
      }
    } else {
      // Usuário não logado, ir para criar evento
      navigate('/criar');
    }
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
      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <Card className="bg-white/95 backdrop-blur-sm border border-purple-100/50 shadow-xl rounded-3xl overflow-hidden">
          <CardContent className="p-8">
            {/* Botão voltar */}
            <Button 
              variant="outline" 
              size="sm" 
              className="mb-6 w-full border-purple-200 text-purple-600 hover:bg-purple-50" 
              onClick={handleBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-400 via-lavender-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg mb-4">
                <Key className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-2 text-purple-800">
                Acessar Evento
              </h1>
              <p className="text-gray-600 leading-relaxed">
                Digite o PIN do evento para acessar a contagem regressiva e o mural colaborativo
              </p>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700" htmlFor="pin">
                  PIN do Evento
                </Label>
                <Input
                  id="pin"
                  type="text"
                  className="w-full text-center text-2xl font-bold tracking-widest border-gray-300 focus:border-purple-400 focus:ring-0 focus:outline-none rounded-xl py-4"
                  placeholder="000000"
                  value={pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  maxLength={6}
                  required
                />
                <p className="text-xs text-gray-500 text-center">
                  Digite o código de 6 caracteres fornecido pelo criador do evento
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || pin.length !== 6}
                className="w-full py-4 bg-gradient-to-br from-purple-400 via-lavender-500 to-purple-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Acessando..." : "Acessar Evento"}
              </Button>
            </form>

            {/* Informações */}
            <div className="mt-8 p-4 bg-purple-50 rounded-xl">
              <div className="flex items-center gap-2 text-sm text-purple-700 mb-3">
                <Users className="w-4 h-4" />
                <span>O que você pode fazer:</span>
              </div>
              <ul className="text-xs text-purple-600 space-y-1">
                <li>• Visualizar a contagem regressiva</li>
                <li>• Enviar mensagens no mural</li>
                <li>• Compartilhar fotos e reações</li>
                <li>• Participar da experiência colaborativa</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 