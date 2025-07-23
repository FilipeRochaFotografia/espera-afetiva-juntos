# WeCount - Contagens Regressivas Emocionais

Transforme a espera em conexão especial. Crie contagens regressivas emocionais e compartilhe momentos únicos com quem você ama.

## 🚀 Funcionalidades Implementadas

### ✅ **Autenticação e Usuários**
- Sistema completo de registro e login
- Persistência de sessão (usuário permanece logado)
- Recuperação de senha por email
- Perfis de usuário automáticos
- Proteção de rotas com autenticação

### ✅ **Criação e Gerenciamento de Eventos**
- Criação de contagens regressivas personalizadas
- Temas pré-definidos (Casal, Bebê, Viagem, Formatura)
- Emojis personalizáveis
- Mensagens personalizadas
- Edição de eventos existentes
- Ativação/desativação de eventos

### ✅ **Sistema de PIN para Compartilhamento**
- PIN único de 6 caracteres para cada evento
- Acesso público a eventos via PIN
- Compartilhamento via WhatsApp, Telegram, Facebook
- Link direto do app incluído no compartilhamento
- Visualização de eventos sem necessidade de conta

### ✅ **Mural Colaborativo**
- Posts de texto e imagens
- Reações com emojis (❤️, 😍, 🥰, 👏, 🎉, 💕, ✨, 🔥)
- Upload de imagens com compressão automática
- Edição e exclusão de posts próprios
- Real-time updates (atualizações em tempo real)
- Preview de imagens otimizada

### ✅ **Interface e UX**
- Design mobile-first responsivo
- Gradientes elegantes (purple/lavender)
- Animações suaves e transições
- Loading states e feedback visual
- Modais com scroll otimizado
- PWA (Progressive Web App) completo

### ✅ **Navegação Inteligente**
- Página de escolha para novos usuários
- Redirecionamento automático baseado em eventos
- Gerenciamento de múltiplos eventos
- Acesso rápido ao último evento

## 🛠️ Tecnologias Utilizadas

### **Frontend**
- **React 18** - Biblioteca principal
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS
- **Shadcn/ui** - Componentes UI
- **Lucide React** - Ícones
- **React Router DOM** - Roteamento
- **React Query** - Gerenciamento de estado

### **Backend**
- **Supabase** - Backend as a Service
  - Autenticação
  - Banco de dados PostgreSQL
  - Storage para imagens
  - Real-time subscriptions
  - Row Level Security (RLS)

### **Ferramentas**
- **ESLint** - Linting
- **SWC** - Compilador rápido
- **browser-image-compression** - Compressão de imagens

## 📱 PWA Features

- **Instalação** - Pode ser instalado como app
- **Offline** - Service worker para cache
- **Push notifications** - Preparado para notificações
- **Manifest** - Configuração de app
- **Theme color** - Cor consistente no sistema

## 🔐 Segurança

- **Row Level Security (RLS)** - Políticas de acesso ao banco
- **Autenticação JWT** - Tokens seguros
- **Validação de dados** - Frontend e backend
- **Upload seguro** - Validação de imagens
- **Políticas de acesso** - Controle granular

## 🚧 Próximas Implementações

### 🔄 **Pull to Refresh** (Próximo)
- Atualização manual do mural
- Indicador visual de refresh
- Sincronização de dados

### 💳 **Sistema de Pagamento** (Próximo)
- Integração com gateway de pagamento
- Planos premium
- Recursos exclusivos
- Gerenciamento de assinaturas

### 🧪 **Testes** (Próximo)
- Testes unitários
- Testes de integração
- Testes E2E
- Cobertura de código

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta Supabase

### Instalação
```bash
# Clonar repositório
git clone https://github.com/FilipeRochaFotografia/espera-afetiva-juntos.git
cd espera-afetiva-juntos

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp env.example .env.local
# Editar .env.local com suas credenciais do Supabase

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

### Configuração Supabase
1. Criar projeto no Supabase
2. Seguir o guia completo em [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)
3. Executar scripts SQL em ordem:
   - `docs/database_schema.sql`
   - `docs/add_pin_to_events_fixed.sql`
   - `docs/fix_all_rls_complete.sql`
4. Configurar storage buckets
5. Ativar real-time subscriptions

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (shadcn/ui)
│   └── ...             # Componentes específicos
├── pages/              # Páginas da aplicação
├── hooks/              # Custom hooks
├── lib/                # Utilitários e configurações
├── types/              # Definições TypeScript
└── contexts/           # Contextos React

docs/
├── INDEX.md            # Índice da documentação
├── CHECKLIST.md        # Checklist completo (INDISPENSÁVEL)
├── PROGRESS_SUMMARY.md # Resumo de progresso
├── NEXT_STEPS.md       # Próximos passos
├── TECHNICAL_DOCS.md   # Documentação técnica
└── *.sql              # Scripts do banco de dados
```

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build produção
npm run preview      # Preview build
npm run lint         # Linting
npm run type-check   # Verificação TypeScript
```

## 📊 Status do Projeto

- ✅ **MVP Completo** - Funcionalidades básicas implementadas
- ✅ **PWA Funcional** - App instalável e offline
- ✅ **Real-time** - Atualizações em tempo real
- ✅ **Segurança** - RLS e autenticação robusta
- 🔄 **Pull to Refresh** - Em desenvolvimento
- 💳 **Pagamento** - Planejado
- 🧪 **Testes** - Planejado

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📚 Documentação

Para documentação completa, consulte a pasta [docs/](docs/) que contém:

- **[INDEX.md](docs/INDEX.md)** - Índice organizado de toda documentação
- **[CHECKLIST.md](docs/CHECKLIST.md)** - Checklist completo (INDISPENSÁVEL)
- **[PROGRESS_SUMMARY.md](docs/PROGRESS_SUMMARY.md)** - Resumo de progresso
- **[NEXT_STEPS.md](docs/NEXT_STEPS.md)** - Próximos passos
- **[TECHNICAL_DOCS.md](docs/TECHNICAL_DOCS.md)** - Documentação técnica

## 📞 Suporte

Para suporte, envie um email para [contato@wecount.app](mailto:contato@wecount.app) ou abra uma issue no GitHub.

---

**WeCount** - Transformando esperas em momentos especiais ❤️ 