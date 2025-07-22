import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, Edit, Calendar, Users, MessageCircle, Camera } from "lucide-react";
import { Event } from "@/types/event";
import { useCountdown } from "@/hooks/useCountdown";

interface CountdownPreviewProps {
  event: Event;
  onShare: () => void;
  onEdit: () => void;
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
  const { timeLeft, isFinished } = useCountdown(event);

  const themeGradient = getThemeGradient(event.theme);

  return (
    <div className="w-full space-y-6">
      {/* Header da contagem */}
      <div className="bg-gradient-to-br from-purple-400 via-lavender-500 to-purple-600 rounded-2xl p-6 text-white text-center shadow-xl">
        <div className="text-4xl mb-3">{event.emoji}</div>
        <h1 className="text-2xl font-bold mb-2">{event.name}</h1>
        {event.custom_message && (
          <p className="text-sm opacity-90 mb-4">{event.custom_message}</p>
        )}
        
        <div className="grid grid-cols-4 gap-3 max-w-xs mx-auto">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 backdrop-blur-sm flex flex-col items-center shadow-lg border border-purple-100 hover:shadow-xl transition-shadow duration-300">
            <div className="text-2xl font-bold leading-none text-purple-800">{timeLeft.days}</div>
            <div className="text-xs text-purple-600">Dias</div>
          </div>
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 backdrop-blur-sm flex flex-col items-center shadow-lg border border-purple-100 hover:shadow-xl transition-shadow duration-300">
            <div className="text-2xl font-bold leading-none text-purple-800">{timeLeft.hours}</div>
            <div className="text-xs text-purple-600">Horas</div>
          </div>
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 backdrop-blur-sm flex flex-col items-center shadow-lg border border-purple-100 hover:shadow-xl transition-shadow duration-300">
            <div className="text-2xl font-bold leading-none text-purple-800">{timeLeft.minutes}</div>
            <div className="text-xs text-purple-600">Min</div>
          </div>
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 backdrop-blur-sm flex flex-col items-center shadow-lg border border-purple-100 hover:shadow-xl transition-shadow duration-300">
            <div className="text-2xl font-bold leading-none text-purple-800">{timeLeft.seconds}</div>
            <div className="text-xs text-purple-600">Seg</div>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex flex-col gap-4">
        {event.is_active ? (
          <Button
            onClick={onShare}
            size="lg"
            className="bg-gradient-to-br from-purple-400 via-lavender-500 to-purple-600 hover:shadow-xl hover:scale-105 transition-all duration-300 py-3 text-base font-medium rounded-xl text-white shadow-lg"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>
        ) : (
        <Button
          onClick={onShare}
          size="lg"
            className="bg-gradient-to-br from-purple-400 via-lavender-500 to-purple-600 hover:shadow-xl hover:scale-105 transition-all duration-300 py-3 text-base font-medium rounded-xl text-white shadow-lg"
        >
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar e ativar
        </Button>
        )}
        <Button
          variant="outline"
          onClick={onEdit}
          size="lg"
          className="border-purple-100 hover:bg-purple-25 text-purple-600 py-3 text-base font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
        >
          <Edit className="w-4 h-4 mr-2" />
          Editar Evento
        </Button>
      </div>
    </div>
  );
};