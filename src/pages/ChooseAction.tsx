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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">
            {hasEvents ? "O que você gostaria de fazer?" : "Bem-vindo ao Momentos! 🎉"}
          </h1>
          <p className="text-gray-600">
            {hasEvents 
              ? "Escolha uma das opções abaixo" 
              : "O que você gostaria de fazer agora?"
            }
          </p>
        </div>

        {/* Action Cards */}
        <div className="space-y-4">
          {/* Manage Events Card - Only show if user has events */}
          {hasEvents && (
            <Card className="border-2 border-green-200 hover:border-green-300 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  Gerenciar meus eventos
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 text-sm mb-4">
                  Acesse e gerencie seus eventos existentes
                </p>
                <Button 
                  onClick={() => {
                    localStorage.setItem("forceCreate", "true");
                    navigate("/criar");
                  }}
                  variant="outline"
                  className="w-full border-green-300 text-green-700 hover:bg-green-50"
                >
                  Gerenciar Eventos
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Create Event Card */}
          <Card className="border-2 border-purple-200 hover:border-purple-300 transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Plus className="h-5 w-5 text-purple-600" />
                </div>
                {hasEvents ? "Criar novo evento" : "Criar meu evento"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-gray-600 text-sm mb-4">
                Crie uma contagem regressiva especial e compartilhe com quem você ama
              </p>
              <Button 
                onClick={() => {
                  sessionStorage.setItem("fromChooseAction", "true");
                  navigate("/criar");
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              >
                {hasEvents ? "Criar Novo Evento" : "Criar Evento"}
              </Button>
            </CardContent>
          </Card>

          {/* Join Event Card */}
          <Card className="border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Key className="h-5 w-5 text-blue-600" />
                </div>
                Entrar em um evento
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-gray-600 text-sm mb-4">
                Use um PIN para acessar um evento compartilhado com você
              </p>
              <Button 
                onClick={() => navigate("/acessar-pin")}
                variant="outline"
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                Acessar com PIN
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Back to Login */}
        <div className="text-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/login")}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao login
          </Button>
        </div>
      </div>
    </div>
  );
} 