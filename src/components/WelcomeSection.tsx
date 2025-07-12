import { Clock, Users, Camera, MessageCircle } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

export const WelcomeSection = () => {
  return (
    <section className="text-center py-16">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Image */}
        <div className="relative mb-12">
          <div className="relative rounded-3xl overflow-hidden shadow-glow">
            <img 
              src={heroImage} 
              alt="Momentos especiais compartilhados" 
              className="w-full h-64 md:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-romantic bg-clip-text text-transparent leading-tight">
            Transforme a espera em
            <br />
            <span className="bg-gradient-sunset bg-clip-text text-transparent">
              conexão especial
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Crie contagens regressivas emocionais para os momentos mais importantes da sua vida. 
            Compartilhe com quem você ama e construam memórias juntos enquanto aguardam.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mt-12">
          <div className="flex flex-col items-center p-6 bg-card rounded-2xl shadow-card border border-border/50 hover:shadow-soft transition-all duration-300 hover:-translate-y-1">
            <div className="bg-gradient-romantic p-3 rounded-xl mb-4">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Contador Especial</h3>
            <p className="text-sm text-muted-foreground text-center">
              Visualize o tempo restante de forma linda e emocional
            </p>
          </div>

          <div className="flex flex-col items-center p-6 bg-card rounded-2xl shadow-card border border-border/50 hover:shadow-soft transition-all duration-300 hover:-translate-y-1">
            <div className="bg-gradient-baby p-3 rounded-xl mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Compartilhamento</h3>
            <p className="text-sm text-muted-foreground text-center">
              Convide pessoas especiais para viverem a espera juntas
            </p>
          </div>

          <div className="flex flex-col items-center p-6 bg-card rounded-2xl shadow-card border border-border/50 hover:shadow-soft transition-all duration-300 hover:-translate-y-1">
            <div className="bg-gradient-travel p-3 rounded-xl mb-4">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Mural de Memórias</h3>
            <p className="text-sm text-muted-foreground text-center">
              Compartilhem fotos, mensagens e momentos especiais
            </p>
          </div>

          <div className="flex flex-col items-center p-6 bg-card rounded-2xl shadow-card border border-border/50 hover:shadow-soft transition-all duration-300 hover:-translate-y-1">
            <div className="bg-gradient-sunset p-3 rounded-xl mb-4">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Interação Afetiva</h3>
            <p className="text-sm text-muted-foreground text-center">
              Troquem mensagens carinhosas e reações especiais
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};