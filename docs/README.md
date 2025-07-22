# 🤍 WeCount - Espera Afetiva Juntos

Uma aplicação web moderna para criar contadores regressivos românticos com mural colaborativo em tempo real.

![Status](https://img.shields.io/badge/status-MVP%20Completo-brightgreen)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-Latest-green)

## 📊 Status do Projeto

**MVP:** ✅ **COMPLETO**  
**Beta:** 🚧 **EM DESENVOLVIMENTO**  
**V1.0:** 📝 **PENDENTE**  

## ✨ Funcionalidades Implementadas

### 🎯 Sistema de Autenticação
- **Login/Registro** com Supabase Auth
- **Recuperação de senha** por email
- **Confirmação de email** obrigatória
- **Sessões persistentes** com refresh automático
- **Interface moderna** com gradientes roxos

### 🎯 Contador Regressivo
- **Design personalizado** com emojis e mensagens românticas
- **Persistência local** com IndexedDB
- **Compartilhamento** via Web Share API
- **Notificações desktop** quando ativo
- **Interface responsiva** mobile-first
- **Gradiente ultra sutil** nos cards (quase branco)

### 💬 Mural Colaborativo
- **Posts em tempo real** com Supabase
- **Fotos e mensagens flexíveis** (proporção 4:5)
- **Sistema de reações inteligente** (8 emojis: ❤️, 😍, 🥰, 👏, 🎉, 💕, ✨, 🔥)
- **Uma reação por usuário** com toggle inteligente
- **Animação heartBeat** para reações (0.6s)
- **Edição e exclusão** com confirmação
- **Visualização inteligente** (3 últimas + "Ver todas")
- **Posts apenas com foto** (sem necessidade de mensagem)
- **Upload real** para Supabase Storage

### 🎨 Interface Moderna
- **Design responsivo** mobile-first
- **Gradientes roxos/lavanda** e bordas arredondadas
- **Animações suaves** e feedback visual
- **Modais elegantes** com UX otimizada
- **Sistema de cores** consistente
- **Sombras e profundidade** em elementos chave

### 🔐 Sistema de Ativação
- **Modal de ativação** elegante
- **Valor único** R$ 8,90 por evento
- **Benefícios claros** apresentados
- **Navegação intuitiva** para dashboard

## 🚀 Tecnologias

- **Frontend:** React 18 + TypeScript + Vite
- **UI:** Tailwind CSS + Shadcn/ui
- **Backend:** Supabase (Auth + Database + Real-time + Storage)
- **Storage:** IndexedDB (local) + Supabase Storage
- **Deploy:** Vercel/Netlify ready

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/espera-afetiva-juntos.git
cd espera-afetiva-juntos

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais do Supabase

# Execute em desenvolvimento
npm run dev
```

## 🔧 Configuração Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Configure as tabelas necessárias (veja `database_schema.sql`)
3. Ative o Real-time para `mural_posts` e `mural_reactions`
4. Configure as políticas de segurança (RLS)
5. Configure o bucket `mural-images` no Storage
6. Copie as credenciais para `.env.local`

### Variáveis de Ambiente

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

## 📱 Uso

### 1. Autenticação
- **Login** com email e senha
- **Registro** com confirmação de email
- **Recuperação** de senha por email

### 2. Criar Evento
- Defina data, emoji e mensagem personalizada
- Configure notificações desktop
- Salve no IndexedDB local
- **Interface simplificada** - formulário direto

### 3. Ativar Mural
- Compartilhe o link com convidados
- Mural fica disponível apenas para eventos ativos
- Real-time subscriptions ativadas
- **Modal de ativação** com valor único

### 4. Interagir
- **Posts:** Texto e/ou foto (4:5 ratio)
- **Reações:** 8 emojis com animação
- **Edição:** Botão no cabeçalho do post
- **Exclusão:** Com confirmação

### 5. Visualizar
- **3 últimas mensagens** por padrão
- **Botão "Ver todas"** quando há mais posts
- **Contador de reações** numérico
- **Timestamps** relativos

## 🔗 Implementação da Função Compartilhar

### Web Share API (Nativo)
```typescript
const handleShare = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: event.name,
        text: `Contando os dias para: ${event.name} ${event.emoji}`,
        url: window.location.href
      });
    } catch (error) {
      console.log('Erro ao compartilhar:', error);
    }
  } else {
    // Fallback para navegadores que não suportam Web Share API
    fallbackShare();
  }
};
```

### Fallback para Navegadores Antigos
```typescript
const fallbackShare = () => {
  const url = window.location.href;
  const text = `Contando os dias para: ${event.name} ${event.emoji}`;
  
  // Copiar para clipboard
  navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
    toast({
      title: "Link copiado!",
      description: "Cole o link onde quiser compartilhar.",
      duration: 2000,
    });
  });
};
```

### Compartilhamento em Redes Sociais
```typescript
const shareToSocial = (platform: 'whatsapp' | 'telegram' | 'facebook') => {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(`Contando os dias para: ${event.name} ${event.emoji}`);
  
  const shareUrls = {
    whatsapp: `https://wa.me/?text=${text}%20${url}`,
    telegram: `https://t.me/share/url?url=${url}&text=${text}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`
  };
  
  window.open(shareUrls[platform], '_blank', 'width=600,height=400');
};
```

## 🏗️ Arquitetura

```
src/
├── components/
│   ├── MuralCollaborativo.tsx    # ✅ Mural em tempo real
│   ├── CountdownPreview.tsx      # ✅ Contador regressivo
│   ├── EventCreator.tsx          # ✅ Criador de eventos
│   ├── ActivationModal.tsx       # ✅ Modal de ativação
│   └── ui/                       # ✅ Componentes Shadcn/ui
├── pages/
│   ├── Dashboard.tsx             # ✅ Dashboard principal
│   ├── Login.tsx                 # ✅ Autenticação
│   ├── CreateEvent.tsx           # ✅ Criação de eventos
│   ├── EditEvent.tsx             # ✅ Edição de eventos
│   ├── UnlockEvent.tsx           # ✅ Ativação de eventos
│   └── ResetPassword.tsx         # ✅ Recuperação de senha
├── hooks/
│   └── useCountdown.ts           # ✅ Lógica do contador
├── types/
│   └── event.ts                  # ✅ TypeScript interfaces
└── lib/
    ├── supabase.ts               # ✅ Cliente Supabase
    └── utils.ts                  # ✅ Utilitários
```

## 🎯 Funcionalidades Principais

### Sistema de Autenticação
- ✅ Login/Registro com Supabase Auth
- ✅ Confirmação de email obrigatória
- ✅ Recuperação de senha por email
- ✅ Sessões persistentes
- ✅ Interface moderna e responsiva

### Sistema de Posts
- ✅ Criação com texto e/ou foto
- ✅ Validação flexível (texto OU foto)
- ✅ Proporção 4:5 para fotos
- ✅ Real-time updates
- ✅ Edição e exclusão
- ✅ Upload real para Supabase Storage

### Sistema de Reações
- ✅ 8 emojis disponíveis
- ✅ Uma reação por usuário
- ✅ Toggle inteligente
- ✅ Animação heartBeat
- ✅ Diferenciação visual

### Sistema de Compartilhamento
- ✅ Web Share API nativo
- ✅ Fallback para navegadores antigos
- ✅ Compartilhamento em redes sociais
- ✅ Copiar link para clipboard
- ✅ Interface de opções

### Sistema de Ativação
- ✅ Modal elegante com benefícios
- ✅ Valor único R$ 8,90
- ✅ Navegação intuitiva
- ✅ Interface moderna

### Interface
- ✅ Design moderno e responsivo
- ✅ Modais elegantes
- ✅ Animações suaves
- ✅ Feedback visual
- ✅ Mobile-first
- ✅ Gradientes roxos/lavanda
- ✅ Sombras e profundidade

## 📊 Métricas de Sucesso

### Engajamento
- **Posts por evento:** Meta: 10+ posts
- **Reações por post:** Meta: 5+ reações
- **Tempo de sessão:** Meta: 5+ minutos
- **Retenção:** Meta: 70% retorno

### Performance
- **Core Web Vitals:** LCP < 2.5s ✅
- **Mobile score:** > 90 ✅
- **Accessibility:** WCAG 2.1 AA ✅

## 🚧 Próximas Funcionalidades

### Beta (Em Desenvolvimento)
- [x] Upload real de imagens (Supabase Storage) ✅
- [x] Otimização e compressão de imagens ✅
- [x] CDN e lazy loading ✅
- [x] Sistema de autenticação completo ✅
- [x] Modal de ativação elegante ✅
- [x] Interface simplificada de criação ✅
- [ ] Notificações push (Service Workers)
- [ ] Analytics básico (Google Analytics)
- [ ] Testes de usuário

### V1.1 (Pendente)
- [ ] Temas personalizáveis (cores e estilos)
- [ ] Modo offline (Service Workers)
- [ ] Gestos touch para reações
- [ ] Pull-to-refresh no mural
- [ ] Sistema de pagamentos integrado

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- [Supabase](https://supabase.com) - Backend e real-time
- [Shadcn/ui](https://ui.shadcn.com) - Componentes UI
- [Tailwind CSS](https://tailwindcss.com) - Framework CSS
- [Vite](https://vitejs.dev) - Build tool

---

**Desenvolvido com 🤍 para casais românticos**
