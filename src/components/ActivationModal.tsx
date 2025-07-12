import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, Heart, Users, MessageCircle, Camera, Download } from "lucide-react";
import { Event } from "@/types/event";

interface ActivationModalProps {
  event: Event | null;
  onClose: () => void;
}

export const ActivationModal = ({ event, onClose }: ActivationModalProps) => {
  if (!event) return null;

  const handleActivate = () => {
    // Aqui seria integrado o sistema de pagamento
    alert("🚀 Em breve! Sistema de pagamento será integrado aqui.");
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center bg-gradient-romantic bg-clip-text text-transparent">
            Ative seu momento especial
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview do evento */}
          <Card className="bg-gradient-gentle border-border/50">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-2">{event.emoji}</div>
              <h3 className="text-xl font-semibold">{event.name}</h3>
              <p className="text-muted-foreground">
                {event.date.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </CardContent>
          </Card>

          {/* Explicação dos benefícios */}
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">
              Transforme sua espera em uma experiência compartilhada
            </h3>
            <p className="text-muted-foreground">
              Com apenas <strong className="text-primary">R$ 9</strong>, você desbloqueia todas as funcionalidades 
              colaborativas e transforma a ansiedade da espera em momentos de conexão.
            </p>
          </div>

          {/* Lista de benefícios */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Compartilhamento ilimitado</h4>
                  <p className="text-sm text-muted-foreground">
                    Convide quantas pessoas quiser para viverem a espera juntas
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Mural colaborativo completo</h4>
                  <p className="text-sm text-muted-foreground">
                    Mensagens, fotos, vídeos e interações em tempo real
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
                  <Camera className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Galeria de memórias</h4>
                  <p className="text-sm text-muted-foreground">
                    Todas as fotos e vídeos organizados automaticamente
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
                  <Download className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Álbum final exportável</h4>
                  <p className="text-sm text-muted-foreground">
                    Baixe um lindo álbum com toda a jornada da espera
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Temas exclusivos</h4>
                  <p className="text-sm text-muted-foreground">
                    Acesso a designs e personalizações especiais
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Backup por 1 ano</h4>
                  <p className="text-sm text-muted-foreground">
                    Suas memórias ficam seguras e acessíveis
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Preços */}
          <Card className="bg-gradient-romantic text-white border-0">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold mb-2">R$ 9,00</div>
              <p className="text-sm opacity-90 mb-4">Pagamento único por evento</p>
              <div className="flex items-center justify-center gap-2 text-sm">
                <Check className="w-4 h-4" />
                <span>Acesso vitalício ao evento</span>
              </div>
            </CardContent>
          </Card>

          {/* Botões de ação */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleActivate}
              size="lg"
              className="flex-1 bg-gradient-romantic hover:shadow-glow transition-all duration-300"
            >
              <Heart className="w-5 h-5 mr-2" />
              Ativar por R$ 9,00
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              size="lg"
              className="border-border/50 hover:bg-muted/50"
            >
              <X className="w-5 h-5 mr-2" />
              Talvez mais tarde
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            💡 Dica: Você pode criar e personalizar gratuitamente. O pagamento é necessário apenas para compartilhar.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};