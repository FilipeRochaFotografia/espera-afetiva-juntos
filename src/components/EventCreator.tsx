import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";
import { Event } from "@/types/event";

interface EventCreatorProps {
  onEventCreate: (event: Event) => void;
}

const themes = [
  { id: "romantic", name: "Casal", emoji: "💕", gradient: "bg-gradient-romantic" },
  { id: "baby", name: "Bebê", emoji: "👶", gradient: "bg-gradient-baby" },
  { id: "travel", name: "Viagem", emoji: "✈️", gradient: "bg-gradient-travel" },
  { id: "sunset", name: "Encontro", emoji: "🌅", gradient: "bg-gradient-sunset" },
];

const emojis = ["💕", "❤️", "🥰", "👶", "🍼", "✈️", "🌅", "🎉", "🎊", "🌟", "💎", "🌸"];

export const EventCreator = ({ onEventCreate }: EventCreatorProps) => {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [selectedTheme, setSelectedTheme] = useState(themes[0]);
  const [selectedEmoji, setSelectedEmoji] = useState("💕");
  const [customMessage, setCustomMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !date || !time) return;

    const eventDate = new Date(`${date}T${time}`);
    
    const event: Event = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      date: eventDate,
      emoji: selectedEmoji,
      theme: selectedTheme.id,
      customMessage: customMessage || undefined,
    };

    onEventCreate(event);
  };

  return (
    <section className="max-w-2xl mx-auto">
      <Card className="shadow-soft border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl bg-gradient-romantic bg-clip-text text-transparent">
            Crie seu momento especial
          </CardTitle>
          <p className="text-muted-foreground">
            Personalize cada detalhe da sua contagem regressiva
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="event-name">Nome do evento *</Label>
              <Input
                id="event-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Nosso reencontro, Nascimento do bebê..."
                className="bg-white/50 border-border/50 focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event-date">Data *</Label>
                <Input
                  id="event-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-white/50 border-border/50 focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-time">Horário *</Label>
                <Input
                  id="event-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="bg-white/50 border-border/50 focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Tema</Label>
              <div className="grid grid-cols-2 gap-3">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSelectedTheme(theme)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedTheme.id === theme.id
                        ? 'border-primary shadow-soft'
                        : 'border-border/50 hover:border-primary/50'
                    } ${theme.gradient} text-white`}
                  >
                    <div className="text-2xl mb-1">{theme.emoji}</div>
                    <div className="text-sm font-medium">{theme.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Emoji principal</Label>
              <div className="grid grid-cols-6 gap-2">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`p-3 rounded-lg text-2xl transition-all hover:scale-110 ${
                      selectedEmoji === emoji
                        ? 'bg-primary/20 shadow-soft scale-110'
                        : 'bg-white/50 hover:bg-primary/10'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-message">Mensagem personalizada (opcional)</Label>
              <Input
                id="custom-message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Ex: Faltam apenas... para estarmos juntos novamente!"
                className="bg-white/50 border-border/50 focus:border-primary"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-gradient-romantic hover:shadow-glow transition-all duration-300"
              disabled={!name || !date || !time}
            >
              <CalendarIcon className="w-5 h-5 mr-2" />
              Criar Contagem Regressiva
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
};