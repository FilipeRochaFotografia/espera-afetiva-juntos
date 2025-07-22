import { useState, useEffect, useCallback } from 'react';
import { Event } from '@/types/event';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownData {
  event: Event;
  timeLeft: TimeLeft;
  isFinished: boolean;
}

export const useCountdown = (event: Event) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isFinished, setIsFinished] = useState(false);

  // Calcular tempo restante
  const calculateTimeLeft = useCallback(() => {
    const now = new Date().getTime();
    const eventDateObj = typeof event.date === 'string' ? new Date(event.date) : event.date;
    const eventTime = eventDateObj.getTime();
    const difference = eventTime - now;

    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds };
    } else {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
  }, [event.date]);

  // Salvar evento no IndexedDB para countdown persistente
  const saveEventForCountdown = useCallback(async () => {
    if (!('indexedDB' in window)) return;

    const dbName = 'EsperaCountdownDB';
    const dbVersion = 1;
    const storeName = 'events';

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);

        const countdownData: CountdownData & { id: string } = {
          id: event.id,
          event,
          timeLeft: calculateTimeLeft(),
          isFinished: false
        };

        const putRequest = store.put(countdownData);
        putRequest.onsuccess = () => resolve(true);
        putRequest.onerror = () => reject(putRequest.error);
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(storeName)) {
          const store = db.createObjectStore(storeName, { keyPath: 'id' });
          store.createIndex('eventId', 'event.id', { unique: true });
          store.createIndex('date', 'event.date', { unique: false });
          store.createIndex('isActive', 'event.is_active', { unique: false });
        }
      };
    });
  }, [event, calculateTimeLeft]);

  // Solicitar permissão para notificações
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return Notification.permission === 'granted';
  }, []);

  // Enviar notificação
  const sendNotification = useCallback((title: string, body: string) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `countdown-${event.id}`,
        requireInteraction: true
      });
    }
  }, [event.id]);

  // Atualizar countdown
  const updateCountdown = useCallback(() => {
    const newTimeLeft = calculateTimeLeft();
    setTimeLeft(newTimeLeft);

    // Verificar se o evento acabou
    if (newTimeLeft.days === 0 && newTimeLeft.hours === 0 && 
        newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
      setIsFinished(true);
      
      // Enviar notificação de evento finalizado
      sendNotification(
        `🎉 ${event.name} chegou!`,
        'O momento que você tanto esperava finalmente chegou!'
      );
    }
    // Notificação quando faltar 1 hora
    else if (newTimeLeft.days === 0 && newTimeLeft.hours === 1 && 
             newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
      sendNotification(
        `⏰ ${event.name}`,
        'Falta apenas 1 hora! Prepare-se para o momento especial!'
      );
    }
    // Notificação quando faltar 30 minutos
    else if (newTimeLeft.days === 0 && newTimeLeft.hours === 0 && 
             newTimeLeft.minutes === 30 && newTimeLeft.seconds === 0) {
      sendNotification(
        `⏰ ${event.name}`,
        'Faltam apenas 30 minutos! A contagem está quase no fim!'
      );
    }
  }, [calculateTimeLeft, event.name, event.id, sendNotification]);

  // Inicializar countdown
  useEffect(() => {
    // Salvar evento no IndexedDB
    saveEventForCountdown();
    
    // Solicitar permissão para notificações
    requestNotificationPermission();
    
    // Atualizar imediatamente
    updateCountdown();
    
    // Configurar intervalo de atualização
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [saveEventForCountdown, requestNotificationPermission, updateCountdown]);

  // Sincronizar com Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'UPDATE_COUNTDOWN',
        event: {
          ...event,
          timeLeft: calculateTimeLeft()
        }
      });
    }
  }, [event, calculateTimeLeft]);

  return {
    timeLeft,
    isFinished,
    updateCountdown,
    sendNotification
  };
}; 