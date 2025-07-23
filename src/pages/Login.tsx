import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hourglass } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
      setError("Digite um e-mail válido.");
      return;
    }
    
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    if (showRegister) {
      // Criar conta
      if (!name.trim()) {
        setError("Digite seu nome.");
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          data: { name },
          emailRedirectTo: `${window.location.origin}/criar`
        }
      });
      
      if (error) {
        console.error("Erro no cadastro:", error);
        
        // Mensagens de erro mais amigáveis
        if (error.message.includes("User already registered")) {
          setError("Este e-mail já está cadastrado. Tente fazer login.");
        } else if (error.message.includes("Password should be at least")) {
          setError("A senha deve ter pelo menos 6 caracteres.");
        } else if (error.message.includes("Invalid email")) {
          setError("Digite um e-mail válido.");
        } else {
          setError("Erro ao criar conta. Tente novamente.");
        }
      } else {
        // Verificar se o email foi enviado
        if (data.user && !data.user.email_confirmed_at) {
          setEmailSent(true);
          setError("Verifique seu e-mail para confirmar sua conta antes de continuar.");
          setLoading(false);
          return;
        }
        
        // O trigger handle_new_user() deve criar automaticamente o perfil
        // Se o usuário foi criado com sucesso, navegar para criar evento
        if (data.user) {
          console.log("Usuário criado com sucesso:", data.user.id);
          
          // Verificar se o perfil foi criado na tabela users
          setTimeout(async () => {
            const { data: profileData, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single();
            
            if (profileError || !profileData) {
              console.log("Perfil não encontrado, criando manualmente...");
              // Criar perfil manualmente se o trigger falhou
              const { error: insertError } = await supabase
              .from('users')
              .insert({
                id: data.user.id,
                name: name,
                email: email,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            
              if (insertError) {
                console.error("Erro ao criar perfil manualmente:", insertError);
              } else {
                console.log("Perfil criado manualmente com sucesso");
          }
        }
          }, 1000); // Aguardar 1 segundo para o trigger executar
        }
        
        // Para novos usuários, sempre ir para criar evento
        navigate("/criar");
      }
    } else {
      // Fazer login
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setError("E-mail ou senha inválidos. Verifique suas credenciais.");
        } else {
          setError("Erro ao fazer login. Tente novamente.");
        }
      } else {
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
      }
    }
    
    setLoading(false);
  };

  const handleBackToLogin = () => {
    setShowRegister(false);
    setError("");
    setName("");
    setEmailSent(false);
  };

  const handleResendEmail = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });
    
    if (error) {
      setError("Erro ao reenviar e-mail. Tente novamente.");
    } else {
      setError("E-mail reenviado! Verifique sua caixa de entrada.");
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError("Digite seu e-mail para recuperar a senha.");
      return;
    }

    setLoading(true);
    
    // Primeiro, verificar se o usuário existe
    const { data: userData } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single();
    
    if (!userData) {
      setError("E-mail não encontrado. Verifique se está correto ou crie uma conta.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      console.error("Erro na recuperação:", error);
      if (error.message.includes("User not found")) {
        setError("E-mail não encontrado no sistema de autenticação.");
      } else {
        setError("Erro ao enviar e-mail de recuperação. Tente novamente.");
      }
    } else {
      setError("✅ E-mail de recuperação enviado! Verifique sua caixa de entrada e pasta de spam.");
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
              {showRegister ? "Crie sua conta" : "Acesse sua conta"}
            </h1>
            
            {/* Descrição */}
            <p className="text-gray-600 mb-6 leading-relaxed">
              {showRegister 
                ? "Junte-se ao WeCount e transforme suas esperas em momentos especiais" 
                : "Bem-vindo de volta ao WeCount"
              }
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {/* Email */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700" htmlFor="email">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  className="w-full border-gray-300 focus:border-purple-400 focus:ring-0 focus:outline-none rounded-lg"
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700" htmlFor="password">
                  {showRegister ? "Crie uma senha" : "Senha"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  className="w-full border-gray-300 focus:border-purple-400 focus:ring-0 focus:outline-none rounded-lg"
                  placeholder={showRegister ? "Crie uma senha" : "Digite sua senha"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                {!showRegister && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={loading}
                      className="text-sm text-purple-600 hover:text-purple-700 underline transition-colors disabled:opacity-50"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                )}
              </div>

              {/* Name (only for register) */}
              {showRegister && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700" htmlFor="name">
                    Nome completo
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    className="w-full border-gray-300 focus:border-purple-400 focus:ring-0 focus:outline-none rounded-lg"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm text-center">
                    {error}
                  </p>
                  {emailSent && (
                    <div className="mt-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleResendEmail}
                        disabled={loading}
                        className="w-full text-purple-600 border-purple-200 hover:bg-purple-50"
                      >
                        {loading ? "Reenviando..." : "Reenviar e-mail de confirmação"}
                      </Button>
                      <div className="mt-2 text-xs text-gray-500 text-center">
                        Não recebeu o e-mail? Verifique sua pasta de spam.
                      </div>
                    </div>
                  )}
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
                    {showRegister ? "Criando conta..." : "Entrando..."}
                  </div>
                ) : (
                  showRegister ? "Criar conta" : "Entrar"
                )}
              </Button>

              {/* Toggle Register/Login */}
              <div className="text-center">
                {showRegister ? (
                  <button
                    type="button"
                    className="text-sm text-purple-600 hover:text-purple-700 underline transition-colors"
                    onClick={handleBackToLogin}
                  >
                    ← Já tenho uma conta
                  </button>
                ) : (
                  <button
                    type="button"
                    className="text-sm text-purple-600 hover:text-purple-700 underline transition-colors"
                    onClick={() => setShowRegister(true)}
                  >
                    Não tenho uma conta
                  </button>
                )}
              </div>
            </form>

            {/* Footer */}
            <div className="text-center pt-4 border-t border-gray-200 mt-6">
              <p className="text-xs text-gray-500">
                Ao continuar, você concorda com nossos{" "}
                <a href="#" className="text-purple-600 hover:underline">Termos de Uso</a>
                {" "}e{" "}
                <a href="#" className="text-purple-600 hover:underline">Política de Privacidade</a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 