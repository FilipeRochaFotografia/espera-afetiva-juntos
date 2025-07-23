import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Clock } from "lucide-react";
import { Event } from "@/types/event";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import "./EventCreator.css";

interface EventCreatorProps {
  onEventCreate: (event: Event) => void;
  mode?: 'create' | 'edit';
  initialEvent?: Event;
}

const themes = [
  {
    id: "romantic",
    name: "Casal",
    emoji: "🤍",
    gradient: "bg-white shadow-lg",
  },
  {
    id: "baby",
    name: "Bebê",
    emoji: "👶",
    gradient: "bg-white shadow-lg",
  },
  {
    id: "travel",
    name: "Viagem",
    emoji: "✈️",
    gradient: "bg-white shadow-lg",
  },
  {
    id: "graduation",
    name: "Formatura",
    emoji: "🎓",
    gradient: "bg-white shadow-lg",
  },
  { id: "other", name: "Outro", emoji: "✨", gradient: "bg-white/60" },
];

const emojis = ["💖", "👶", "✈️", "🎓", "💍", "🍼", "🥳", "🎉", "🗓️", "⏳", "🌍", "🏠"];

export const EventCreator = ({ onEventCreate, mode = 'create', initialEvent }: EventCreatorProps) => {
  const [name, setName] = useState(initialEvent?.name || "");
  const [date, setDate] = useState(initialEvent?.date ? new Date(initialEvent.date).toISOString().split('T')[0] : "");
  const [time, setTime] = useState(initialEvent?.date ? new Date(initialEvent.date).toTimeString().slice(0, 5) : "");
  const [selectedTheme, setSelectedTheme] = useState(() => {
    if (initialEvent?.theme) {
      const theme = themes.find(t => t.name === initialEvent.theme);
      return theme || themes[0];
    }
    return themes[0];
  });
  const [customTheme, setCustomTheme] = useState(initialEvent?.theme && !themes.find(t => t.name === initialEvent.theme) ? initialEvent.theme : "");
  const [selectedEmoji, setSelectedEmoji] = useState(initialEvent?.emoji || "🤍");
  const [customMessage, setCustomMessage] = useState(initialEvent?.custom_message || "");
  const [dateError, setDateError] = useState<string | null>(null);

  // Função para validar se a data é válida
  const validateEventDate = (selectedDate: string, selectedTime: string): { isValid: boolean; error?: string } => {
    if (!selectedDate || !selectedTime) {
      return { isValid: false, error: "Data e horário são obrigatórios" };
    }

    const eventDate = new Date(`${selectedDate}T${selectedTime}`);
    const now = new Date();
    
    // Verificar se a data é no passado
    if (eventDate <= now) {
      return { isValid: false, error: "A data do evento não pode ser no passado" };
    }
    
    // Verificar se a data é muito próxima (menos de 1 hora)
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000); // 1 hora
    if (eventDate <= oneHourFromNow) {
      return { isValid: false, error: "O evento deve ser pelo menos 1 hora no futuro" };
    }
    
    return { isValid: true };
  };

  // Função para obter a data mínima (hoje)
  const getMinDate = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Função para obter o horário mínimo (1 hora a partir de agora)
  const getMinTime = (): string => {
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
    return oneHourFromNow.toTimeString().slice(0, 5);
  };

  // Função para validar data em tempo real
  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    if (newDate && time) {
      const validation = validateEventDate(newDate, time);
      setDateError(validation.isValid ? null : validation.error || null);
    } else {
      setDateError(null);
    }
  };

  // Função para validar hora em tempo real
  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    if (date && newTime) {
      const validation = validateEventDate(date, newTime);
      setDateError(validation.isValid ? null : validation.error || null);
    } else {
      setDateError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !date || !time) return;
    
    // Validar data e horário
    const validation = validateEventDate(date, time);
    if (!validation.isValid) {
      toast({
        title: "Data inválida",
        description: validation.error,
        variant: "destructive"
      });
      return;
    }
    
    const eventDate = new Date(`${date}T${time}`);
    const themeName = selectedTheme.id === "other" && customTheme.trim() ? customTheme.trim() : selectedTheme.name;
    // Pega usuário autenticado
    const { data: userData, error: authError } = await supabase.auth.getUser();
    console.log('EventCreator - Auth check:', { userData, authError });
    
    const user = userData?.user;
    if (!user) {
      console.error('EventCreator - Usuário não autenticado');
      toast({
        title: "Você precisa estar logado para criar um evento.",
        variant: "destructive"
      });
      return;
    }
    
    console.log('EventCreator - Usuário autenticado:', user.id, user.email);

    if (mode === 'edit' && initialEvent) {
      // Modo edição - atualizar evento existente
      const { data, error } = await supabase
        .from("events")
        .update({
          name,
          date: eventDate,
          emoji: selectedEmoji,
          theme: themeName,
          custom_message: customMessage || "",
        })
        .eq("id", initialEvent.id)
        .select()
        .single();
      
      if (!error && data) {
        toast({
          title: "Evento atualizado com sucesso!",
          description: `Seu evento '${name}' foi atualizado.`,
          variant: "default"
        });
        onEventCreate(data as Event);
      } else {
        toast({
          title: "Erro ao atualizar evento",
          description: error?.message || "Tente novamente.",
          variant: "destructive"
        });
      }
    } else {
      // Modo criação - criar novo evento
      const event: Partial<Event> & { created_by: string } = {
        name,
        date: eventDate,
        emoji: selectedEmoji,
        theme: themeName,
        custom_message: customMessage || "",
        created_by: user.id,
      };
      
      console.log('EventCreator - Criando evento:', event);
      
      // Salvar no Supabase
      const { data, error } = await supabase
        .from("events")
        .insert([event])
        .select()
        .single();
        
      console.log('EventCreator - Resultado da criação:', { data, error });
      if (!error && data) {
        toast({
          title: "Evento criado com sucesso!",
          description: `Seu evento '${name}' foi salvo.`,
          variant: "default"
        });
        onEventCreate(data as Event);
      } else {
        toast({
          title: "Erro ao criar evento",
          description: error?.message || "Tente novamente.",
          variant: "destructive"
        });
      }
    }
  };

  return (
          <section className="w-full">
        <div className="text-center mb-6 flex flex-col items-center px-8">
        <h2 className="text-xl font-bold mb-2 text-purple-800 whitespace-nowrap">
          {mode === 'edit' ? 'Edite sua contagem regressiva' : 'Crie sua contagem regressiva'}
        </h2>
        <p className="text-gray-600">
          {mode === 'edit' ? 'Modifique os detalhes da sua contagem regressiva' : (
            <>
              Transforme cada segundo em<br />
              uma experiência única!
            </>
          )}
        </p>
      </div>
      <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="event-name" className="text-sm font-medium text-gray-700">Nome do evento *</Label>
              <Input
                id="event-name"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 25))}
                placeholder="Ex: Nosso reencontro, Nascimento do bebê..."
                maxLength={25}
                className="w-full border-gray-300 focus:border-purple-400 focus:ring-0 focus:outline-none rounded-lg shadow-sm"
              />
              <div className="text-xs text-gray-500 text-right">
                {name.length}/25 caracteres
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event-date" className="text-sm font-medium text-gray-700">Data *</Label>
                <div className="relative">
                  <Input
                    id="event-date"
                    type="date"
                    value={date}
                    min={getMinDate()}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full border-gray-300 focus:border-purple-400 focus:ring-0 focus:outline-none rounded-lg pr-10 cursor-pointer shadow-sm"
                  />
                  <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-time" className="text-sm font-medium text-gray-700">Horário *</Label>
                <div className="relative">
                  <Input
                    id="event-time"
                    type="time"
                    value={time}
                    min={getMinTime()}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="w-full border-gray-300 focus:border-purple-400 focus:ring-0 focus:outline-none rounded-lg pr-10 cursor-pointer shadow-sm"
                  />
                  <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
            
            {/* Mensagem de erro da data */}
            {dateError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600 flex items-center">
                  <span className="mr-2">⚠️</span>
                  {dateError}
                </p>
              </div>
            )}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Escolha o tema do seu momento</Label>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-2">
                {themes.slice(0, 4).map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSelectedTheme(theme)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all h-24 md:h-28 text-lg font-medium shadow-md hover:shadow-lg
                      ${selectedTheme.id === theme.id ? 'border-purple-400 bg-purple-50 shadow-xl scale-105' : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'}
                      bg-white`}
                  >
                    <span className="text-3xl mb-1">{theme.emoji}</span>
                    <span className="text-purple-700">{theme.name}</span>
                  </button>
                ))}
              </div>
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTheme(themes[4])}
                  className={`w-full flex items-center justify-center p-3 rounded-xl border-2 transition-all text-base font-medium shadow-md hover:shadow-lg
                    ${selectedTheme.id === 'other' ? 'border-purple-400 bg-purple-50 shadow-xl scale-105' : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'}
                    bg-white text-gray-700`}
                >
                  Outro (digite seu tema)
                </button>
                {selectedTheme.id === 'other' && (
                  <Input
                    className="mt-2 w-full border-gray-300 focus:border-purple-400 focus:ring-0 focus:outline-none rounded-lg shadow-sm"
                    placeholder="Digite o tema do seu momento"
                    value={customTheme}
                    onChange={e => setCustomTheme(e.target.value)}
                    autoFocus
                  />
                )}
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Emoji principal</Label>
              <div className="grid grid-cols-4 gap-3">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`p-4 rounded-lg text-2xl transition-all hover:scale-110 aspect-square flex items-center justify-center shadow-md hover:shadow-lg
                      ${selectedEmoji === emoji ? 'bg-purple-100 border-2 border-purple-400 shadow-xl scale-110' : 'bg-white border border-gray-200 hover:bg-purple-50 hover:border-purple-300'}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-message" className="text-sm font-medium text-gray-700">Mensagem personalizada (opcional)</Label>
              <Input
                id="custom-message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value.slice(0, 35))}
                placeholder="Ex: Faltam apenas... para estarmos juntos novamente!"
                maxLength={35}
                className="w-full border-gray-300 focus:border-purple-400 focus:ring-0 focus:outline-none rounded-lg shadow-sm"
              />
              <div className="text-xs text-gray-500 text-right">
                {customMessage.length}/35 caracteres
              </div>
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full py-4 rounded-xl bg-gradient-to-br from-purple-400 via-lavender-500 to-purple-600 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!name || !date || !time || (selectedTheme.id === 'other' && !customTheme.trim()) || !!dateError}
            >
              <CalendarIcon className="w-5 h-5 mr-2" />
              {mode === 'edit' ? 'Atualizar Evento' : 'Criar Contagem Regressiva'}
            </Button>
          </form>
        </div>
      </section>
    );
};