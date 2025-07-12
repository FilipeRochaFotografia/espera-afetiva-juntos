import { useState } from "react";
import { Header } from "@/components/Header";
import { WelcomeSection } from "@/components/WelcomeSection";
import { EventCreator } from "@/components/EventCreator";
import { CountdownPreview } from "@/components/CountdownPreview";
import { ActivationModal } from "@/components/ActivationModal";
import { Event } from "@/types/event";

const Index = () => {
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [showActivation, setShowActivation] = useState(false);

  const handleEventCreate = (event: Event) => {
    setCurrentEvent(event);
  };

  const handleShareEvent = () => {
    setShowActivation(true);
  };

  return (
    <div className="min-h-screen bg-gradient-gentle">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {!currentEvent ? (
          <>
            <WelcomeSection />
            <EventCreator onEventCreate={handleEventCreate} />
          </>
        ) : (
          <CountdownPreview 
            event={currentEvent} 
            onShare={handleShareEvent}
            onEdit={() => setCurrentEvent(null)}
          />
        )}
      </main>

      {showActivation && (
        <ActivationModal 
          event={currentEvent}
          onClose={() => setShowActivation(false)}
        />
      )}
    </div>
  );
};

export default Index;
