import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hourglass, CheckCircle, AlertCircle } from "lucide-react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se o usuário está autenticado para reset
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Link inválido ou expirado. Solicite um novo link de recuperação.");
      }
    };
    
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      console.error("Erro ao atualizar senha:", error);
      setError("Erro ao atualizar senha. Tente novamente.");
    } else {
      setSuccess(true);
      setTimeout(async () => {
        // Verificar se o usuário já tem eventos criados
        const { data: eventsData } = await supabase
          .from('events')
          .select('id, name, is_active')
          .eq('created_by', (await supabase.auth.getUser()).data.user?.id)
          .order('created_at', { ascending: false });
        
        if (eventsData && eventsData.length > 0) {
          // Usuário tem eventos, ir para dashboard do evento mais recente
          const latestEvent = eventsData[0];
          navigate(`/dashboard/${latestEvent.id}`);
        } else {
          // Usuário não tem eventos, ir para criar evento
          navigate("/criar");
        }
      }, 2000);
    }

    setLoading(false);
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
          <CardContent className="p-8 text-center">
            {/* Ícone/Ilustração central */}
            <div className="relative mb-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-400 via-lavender-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <Hourglass className="w-8 h-8 text-white" />
              </div>
              {/* Aura/glow effect */}
              <div className="absolute inset-0 w-16 h-16 mx-auto bg-gradient-to-br from-purple-400/30 via-lavender-500/30 to-purple-600/30 rounded-full blur-xl animate-pulse"></div>
            </div>

            {/* Título principal */}
            <h1 className="text-2xl font-bold mb-2 text-purple-800">
              {success ? "Senha Atualizada!" : "Redefinir Senha"}
            </h1>
            
            {/* Descrição */}
            <p className="text-gray-600 mb-6 leading-relaxed">
              {success 
                ? "Sua senha foi atualizada com sucesso. Redirecionando..." 
                : "Digite sua nova senha para continuar"
              }
            </p>

            {success ? (
              <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
                <CheckCircle className="w-5 h-5" />
                <span>Senha atualizada com sucesso!</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                {/* Nova Senha */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700" htmlFor="password">
                    Nova Senha
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    className="w-full border-gray-300 focus:border-purple-400 focus:ring-0 focus:outline-none rounded-lg"
                    placeholder="Digite sua nova senha"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Confirmar Senha */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700" htmlFor="confirmPassword">
                    Confirmar Nova Senha
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    className="w-full border-gray-300 focus:border-purple-400 focus:ring-0 focus:outline-none rounded-lg"
                    placeholder="Confirme sua nova senha"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-gradient-to-br from-purple-400 via-lavender-500 to-purple-600 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Atualizando senha...
                    </div>
                  ) : (
                    "Atualizar Senha"
                  )}
                </Button>
              </form>
            )}

            {/* Voltar ao Login */}
            <div className="text-center mt-6">
              <button
                type="button"
                className="text-sm text-purple-600 hover:text-purple-700 underline transition-colors"
                onClick={() => navigate("/")}
              >
                ← Voltar ao login
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 