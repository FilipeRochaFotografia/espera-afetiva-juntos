import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Event } from "@/types/event";
import { Share2, Copy, X, MessageCircle, Camera, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareModal({ event, isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  if (!isOpen) return null;

  const shareText = `Contando os dias para: ${event.name} ${event.emoji}`;
  const pinText = `PIN: ${event.pin}`;
  const appLink = `\nAcesse: ${window.location.origin}/acessar-pin`;
  const fullShareText = `${shareText}\n${pinText}${appLink}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullShareText);
      setCopied(true);
      toast({
        title: "Copiado!",
        description: "Texto copiado para a área de transferência",
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o texto",
        duration: 2000,
      });
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.name,
          text: fullShareText,
        });
      } catch (error) {
        console.log('Erro ao compartilhar:', error);
      }
    } else {
      copyToClipboard();
    }
  };

  const shareToSocial = (platform: 'whatsapp' | 'telegram' | 'facebook') => {
    const text = encodeURIComponent(fullShareText);
    
    const shareUrls = {
      whatsapp: `https://wa.me/?text=${text}`,
      telegram: `https://t.me/share/url?text=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?quote=${text}`
    };
    
    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <Card className="relative w-full max-w-md bg-white/95 backdrop-blur-sm border border-purple-100/50 shadow-xl rounded-3xl overflow-hidden">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 via-lavender-500 to-purple-600 rounded-full flex items-center justify-center">
                <Share2 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-purple-800">Compartilhar Evento</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Evento */}
          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 mb-6 text-center">
            <div className="text-3xl mb-2">{event.emoji}</div>
            <h4 className="text-lg font-bold text-purple-800 mb-1">{event.name}</h4>
            {event.custom_message && (
              <p className="text-sm text-gray-600 italic">"{event.custom_message}"</p>
            )}
          </div>

          {/* PIN */}
          <div className="bg-gradient-to-br from-purple-100 to-lavender-200 border-2 border-purple-300 rounded-xl p-4 mb-6 text-center">
            <div className="text-sm text-purple-700 mb-2">PIN do Evento</div>
            <div className="text-3xl font-bold text-purple-800 tracking-wider mb-2">
              {event.pin}
            </div>
            <p className="text-xs text-purple-600">
              Compartilhe este PIN para que outros<br />
              possam acessar o evento
            </p>
          </div>

          {/* Botões de ação */}
          <div className="space-y-3">
            <Button
              onClick={shareNative}
              className="w-full py-3 bg-gradient-to-br from-purple-400 via-lavender-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Compartilhar
            </Button>

            <Button
              onClick={copyToClipboard}
              variant="outline"
              className="w-full py-3 border-purple-200 text-purple-600 hover:bg-purple-50 rounded-xl"
            >
              <Copy className="w-5 h-5 mr-2" />
              {copied ? "Copiado!" : "Copiar PIN"}
            </Button>

            {/* Redes sociais */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={() => shareToSocial('whatsapp')}
                variant="outline"
                size="sm"
                className="py-2 border-purple-200 text-purple-600 hover:bg-purple-50 rounded-lg"
              >
                WhatsApp
              </Button>
              <Button
                onClick={() => shareToSocial('telegram')}
                variant="outline"
                size="sm"
                className="py-2 border-purple-200 text-purple-600 hover:bg-purple-50 rounded-lg"
              >
                Telegram
              </Button>
              <Button
                onClick={() => shareToSocial('facebook')}
                variant="outline"
                size="sm"
                className="py-2 border-purple-200 text-purple-600 hover:bg-purple-50 rounded-lg"
              >
                Facebook
              </Button>
            </div>
          </div>

          {/* Informações adicionais */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Users className="w-4 h-4" />
              <span>Qualquer pessoa com o PIN pode:</span>
            </div>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• Visualizar a contagem regressiva</li>
              <li>• Enviar mensagens no mural</li>
              <li>• Compartilhar fotos e reações</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 