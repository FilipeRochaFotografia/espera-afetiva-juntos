import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Key, ArrowLeft, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export default function ChooseAction() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hasEvents, setHasEvents] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserEvents = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from("events")
          .select("id")
          .eq("created_by", user.id)
          .limit(1);
        
        setHasEvents(data && data.length > 0);
      } catch (error) {
        console.error("Erro ao verificar eventos:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUserEvents();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
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
          <CardContent className="p-8 text-center">
            {/* Ícone/Ilustração central */}
            <div className="relative mb-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-400 via-lavender-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <Plus className="w-8 h-8 text-white" />
              </div>
              {/* Aura/glow effect */}
              <div className="absolute inset-0 w-16 h-16 mx-auto bg-gradient-to-br from-purple-400/30 via-lavender-500/30 to-purple-600/30 rounded-full blur-xl animate-pulse"></div>
            </div>

            {/* Título principal */}
            <h1 className="text-2xl font-bold mb-2 text-purple-800">
              {hasEvents ? "O que você gostaria de fazer?" : "Bem-vindo ao WeCount! 🎉"}
            </h1>
            
            {/* Descrição */}
            <p className="text-gray-600 mb-6 leading-relaxed">
              {hasEvents 
                ? "Escolha uma das opções abaixo" 
                : "O que você gostaria de fazer agora?"
              }
            </p>

            {/* Action Buttons */}
            <div className="space-y-4">
              {/* Manage Events Button - Only show if user has events */}
              {hasEvents && (
                <Button 
                  onClick={() => {
                    localStorage.setItem("forceCreate", "true");
                    navigate("/criar");
                  }}
                  variant="outline"
                  className="w-full py-4 border-green-300 text-green-700 hover:bg-green-50 rounded-xl font-semibold"
                >
                  <Calendar className="w-5 h-5 mr-3" />
                  Gerenciar meus eventos
                </Button>
              )}

              {/* Create Event Button */}
              <Button 
                onClick={() => {
                  sessionStorage.setItem("fromChooseAction", "true");
                  navigate("/criar");
                }}
                className="w-full py-4 rounded-xl bg-gradient-to-br from-purple-400 via-lavender-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-3" />
                {hasEvents ? "Criar Novo Evento" : "Criar Evento"}
              </Button>

              {/* Join Event Button */}
              <Button 
                onClick={() => navigate("/acessar-pin")}
                variant="outline"
                className="w-full py-4 border-blue-300 text-blue-700 hover:bg-blue-50 rounded-xl font-semibold"
              >
                <Key className="w-5 h-5 mr-3" />
                Acessar com PIN
              </Button>
            </div>

            {/* Back to Login */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/login")}
                className="text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 