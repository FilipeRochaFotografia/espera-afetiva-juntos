import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, Edit, Calendar, Users, MessageCircle, Camera } from "lucide-react";
import { Event } from "@/types/event";

interface CountdownPreviewProps {
  event: Event;
  onShare: () => void;
  onEdit: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const getThemeGradient = (theme: string) => {
  const gradients = {
    romantic: "bg-gradient-romantic",
    baby: "bg-gradient-baby", 
    travel: "bg-gradient-travel",
    sunset: "bg-gradient-sunset",
  };
  return gradients[theme as keyof typeof gradients] || "bg-gradient-romantic";
};

export const CountdownPreview = ({ event, onShare, onEdit }: CountdownPreviewProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const eventTime = event.date.getTime();
      const difference = eventTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [event.date]);

  const themeGradient = getThemeGradient(event.theme);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header da contagem */}
      <div className={`${themeGradient} rounded-3xl p-8 text-white text-center shadow-glow`}>
        <div className="text-6xl mb-4 animate-bounce">{event.emoji}</div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{event.name}</h1>
        {event.customMessage && (
          <p className="text-lg opacity-90 mb-6">{event.customMessage}</p>
        )}
        
        <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
          <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
            <div className="text-3xl md:text-4xl font-bold">{timeLeft.days}</div>
            <div className="text-sm opacity-75">Dias</div>
          </div>
          <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
            <div className="text-3xl md:text-4xl font-bold">{timeLeft.hours}</div>
            <div className="text-sm opacity-75">Horas</div>
          </div>
          <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
            <div className="text-3xl md:text-4xl font-bold">{timeLeft.minutes}</div>
            <div className="text-sm opacity-75">Minutos</div>
          </div>
          <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
            <div className="text-3xl md:text-4xl font-bold">{timeLeft.seconds}</div>
            <div className="text-sm opacity-75">Segundos</div>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={onShare}
          size="lg"
          className="bg-gradient-romantic hover:shadow-glow transition-all duration-300"
        >
          <Share2 className="w-5 h-5 mr-2" />
          Compartilhar e Ativar Mural
        </Button>
        <Button
          variant="outline"
          onClick={onEdit}
          size="lg"
          className="border-primary/20 hover:bg-primary/5"
        >
          <Edit className="w-5 h-5 mr-2" />
          Editar Evento
        </Button>
      </div>

      {/* Preview do mural (mockup) */}
      <Card className="shadow-soft border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Mural Colaborativo
            <span className="text-sm text-muted-foreground font-normal ml-2">
              (disponível após ativação)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center text-muted-foreground py-12 border-2 border-dashed border-border rounded-2xl">
            <div className="space-y-4">
              <div className="flex justify-center gap-4 text-4xl opacity-50">
                <MessageCircle className="w-12 h-12" />
                <Camera className="w-12 h-12" />
                <Users className="w-12 h-12" />
              </div>
              <h3 className="text-lg font-medium">Compartilhe momentos especiais</h3>
              <p className="max-w-md mx-auto">
                Após ativar, você e seus convidados poderão trocar mensagens carinhosas, 
                compartilhar fotos e criar memórias juntos durante a espera.
              </p>
            </div>
          </div>

          {/* Exemplos de interações */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20">
              <MessageCircle className="w-6 h-6 text-primary mb-2" />
              <h4 className="font-medium mb-1">Mensagens</h4>
              <p className="text-sm text-muted-foreground">
                Troquem recados carinhosos e palavras de incentivo
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-accent/20 to-accent/30 rounded-xl border border-accent/30">
              <Camera className="w-6 h-6 text-accent-foreground mb-2" />
              <h4 className="font-medium mb-1">Fotos & Vídeos</h4>
              <p className="text-sm text-muted-foreground">
                Compartilhem momentos do dia a dia enquanto esperam
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-secondary/30 to-secondary/40 rounded-xl border border-secondary/40">
              <Users className="w-6 h-6 text-secondary-foreground mb-2" />
              <h4 className="font-medium mb-1">Reações</h4>
              <p className="text-sm text-muted-foreground">
                Reajam com emojis especiais e demonstrem carinho
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};