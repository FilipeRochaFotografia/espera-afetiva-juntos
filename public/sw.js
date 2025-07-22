// Service Worker para countdown persistente
const CACHE_NAME = 'espera-countdown-v1';

// Instalar service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker instalado');
  self.skipWaiting();
});

// Ativar service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker ativado');
  event.waitUntil(self.clients.claim());
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Background sync para countdown
self.addEventListener('sync', (event) => {
  if (event.tag === 'countdown-update') {
    event.waitUntil(updateCountdown());
  }
});

// Função para atualizar countdown
async function updateCountdown() {
  try {
    // Buscar eventos ativos do IndexedDB
    const events = await getActiveEvents();
    
    events.forEach(event => {
      const timeLeft = calculateTimeLeft(event.date);
      
      // Enviar notificação se necessário
      if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes <= 30) {
        showNotification(event);
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar countdown:', error);
  }
}

// Calcular tempo restante
function calculateTimeLeft(eventDate) {
  const now = new Date().getTime();
  const eventTime = new Date(eventDate).getTime();
  const difference = eventTime - now;

  if (difference > 0) {
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  }
  
  return { days: 0, hours: 0, minutes: 0, seconds: 0 };
}

// Buscar eventos ativos do IndexedDB
async function getActiveEvents() {
  // Implementar busca no IndexedDB
  return [];
}

// Mostrar notificação
function showNotification(event) {
  const options = {
    body: `Faltam apenas ${event.timeLeft} para ${event.name}!`,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: `countdown-${event.id}`,
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Ver Evento'
      },
      {
        action: 'dismiss',
        title: 'Fechar'
      }
    ]
  };

  self.registration.showNotification(`⏰ ${event.name}`, options);
}

// Lidar com cliques na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/dashboard/' + event.notification.tag.replace('countdown-', ''))
    );
  }
});

// Receber mensagens do app
self.addEventListener('message', (event) => {
  if (event.data.type === 'UPDATE_COUNTDOWN') {
    const { event: countdownEvent } = event.data;
    
    // Salvar evento atualizado no IndexedDB
    saveEventToIndexedDB(countdownEvent);
    
    // Verificar se precisa enviar notificação
    checkAndSendNotification(countdownEvent);
  }
});

// Salvar evento no IndexedDB
async function saveEventToIndexedDB(event) {
  if (!('indexedDB' in self)) return;

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

      const putRequest = store.put(event, event.id);
      putRequest.onsuccess = () => resolve(true);
      putRequest.onerror = () => reject(putRequest.error);
    };

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        const store = db.createObjectStore(storeName, { keyPath: 'id' });
        store.createIndex('date', 'date', { unique: false });
        store.createIndex('isActive', 'is_active', { unique: false });
      }
    };
  });
}

// Verificar e enviar notificação
function checkAndSendNotification(event) {
  const timeLeft = calculateTimeLeft(event.date);
  
  // Notificação quando faltar 1 hora
  if (timeLeft.days === 0 && timeLeft.hours === 1 && 
      timeLeft.minutes === 0 && timeLeft.seconds === 0) {
    showNotification(event, 'Falta apenas 1 hora! Prepare-se para o momento especial!');
  }
  // Notificação quando faltar 30 minutos
  else if (timeLeft.days === 0 && timeLeft.hours === 0 && 
           timeLeft.minutes === 30 && timeLeft.seconds === 0) {
    showNotification(event, 'Faltam apenas 30 minutos! A contagem está quase no fim!');
  }
  // Notificação quando o evento acabar
  else if (timeLeft.days === 0 && timeLeft.hours === 0 && 
           timeLeft.minutes === 0 && timeLeft.seconds === 0) {
    showNotification(event, 'O momento que você tanto esperava finalmente chegou!', '🎉');
  }
}

// Agendar atualizações periódicas
setInterval(() => {
  updateCountdown();
}, 60000); // Atualizar a cada minuto 