# 🎨 Atualização da Paleta de Cores - Documento de Planejamento

## 📋 Visão Geral

**Objetivo:** Migrar completamente do esquema atual (rosa/laranja) para uma nova paleta baseada em tons de roxo/lavanda, mantendo a elegância e modernidade da aplicação.

## 🎨 Nova Paleta de Cores

### Cores Principais Identificadas:
1. **Pure White** (`#FFFFFF`) - Branco puro
2. **Light Gray/Off-White** (`#F8F9FA`) - Cinza claro/quase branco
3. **Medium Purple** (`#8B5CF6`) - Roxo médio (mais saturado)
4. **Light Lavender** (`#C4B5FD`) - Lavanda claro
5. **Very Pale Lavender** (`#E9D5FF`) - Lavanda muito claro
6. **Extremely Pale Lavender** (`#F3F4F6`) - Lavanda extremamente claro

### Paleta Expandida para Desenvolvimento:

```css
/* Cores Base */
--white: #FFFFFF;
--off-white: #F8F9FA;
--medium-purple: #8B5CF6;
--light-lavender: #C4B5FD;
--pale-lavender: #E9D5FF;
--extreme-pale-lavender: #F3F4F6;

/* Gradientes */
--gradient-primary: linear-gradient(135deg, #8B5CF6 0%, #C4B5FD 100%);
--gradient-secondary: linear-gradient(135deg, #C4B5FD 0%, #E9D5FF 100%);
--gradient-subtle: linear-gradient(135deg, #E9D5FF 0%, #F3F4F6 100%);

/* Estados */
--purple-50: #F3F4F6;
--purple-100: #E9D5FF;
--purple-200: #C4B5FD;
--purple-300: #A78BFA;
--purple-400: #8B5CF6;
--purple-500: #7C3AED;
--purple-600: #6D28D9;
--purple-700: #5B21B6;
--purple-800: #4C1D95;
--purple-900: #2E1065;
```

## 🎯 Componentes a Serem Atualizados

### 1. **Layout Principal**
- [ ] Background principal (atual: rosa/laranja → novo: gradiente roxo)
- [ ] Header e navegação
- [ ] Cards e containers
- [ ] Botões principais

### 2. **Dashboard**
- [ ] Background gradient
- [ ] Card do evento
- [ ] Botões de ação (Compartilhar, Editar)
- [ ] Popover de configurações

### 3. **Mural Colaborativo**
- [ ] Header do mural
- [ ] Botão "Adicionar ao mural"
- [ ] Cards de posts
- [ ] Botões de reação
- [ ] Modais de criação/edição

### 4. **Componentes UI**
- [ ] Botões (primários, secundários, outline)
- [ ] Cards e containers
- [ ] Inputs e textareas
- [ ] Modais e dialogs
- [ ] Toasts e notificações

### 5. **Elementos Interativos**
- [ ] Hover states
- [ ] Focus states
- [ ] Loading states
- [ ] Animações e transições

## 📝 Estratégia de Implementação

### Fase 1: Configuração Base
1. **Atualizar Tailwind Config**
   - Definir novas cores customizadas
   - Configurar gradientes
   - Atualizar tema base

2. **Criar Variáveis CSS**
   - Definir paleta no CSS global
   - Configurar variáveis para uso consistente

### Fase 2: Componentes Core
1. **Layout Principal**
   - Background e estrutura base
   - Header e navegação

2. **Botões e Elementos Base**
   - Sistema de botões
   - Cards e containers

### Fase 3: Páginas Principais
1. **Dashboard**
   - Migração completa da página principal

2. **Mural Colaborativo**
   - Atualização de todos os elementos

### Fase 4: Componentes Específicos
1. **Modais e Dialogs**
2. **Formulários**
3. **Notificações**

### Fase 5: Refinamentos
1. **Animações e transições**
2. **Estados interativos**
3. **Responsividade**

## 🔧 Arquivos a Modificar

### Configuração:
- `tailwind.config.ts`
- `src/index.css`
- `src/App.css`

### Componentes Principais:
- `src/pages/Dashboard.tsx`
- `src/components/MuralCollaborativo.tsx`
- `src/components/CountdownPreview.tsx`
- `src/components/Header.tsx`

### Componentes UI:
- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/toast.tsx`

## 🎨 Diretrizes de Design

### Princípios:
1. **Consistência:** Usar a mesma paleta em toda a aplicação
2. **Hierarquia:** Roxo médio para elementos principais, tons mais claros para secundários
3. **Acessibilidade:** Manter contraste adequado
4. **Modernidade:** Gradientes sutis e transições suaves

### Uso das Cores:
- **Roxo Médio (`#8B5CF6`)**: Botões principais, elementos de destaque
- **Lavanda Claro (`#C4B5FD`)**: Botões secundários, hover states
- **Lavanda Pálido (`#E9D5FF`)**: Backgrounds sutis, borders
- **Branco/Off-white**: Textos, backgrounds principais
- **Gradientes**: Backgrounds principais, elementos especiais

## ✅ Critérios de Sucesso

### Funcional:
- [ ] Todas as cores aplicadas consistentemente
- [ ] Contraste adequado para acessibilidade
- [ ] Estados interativos funcionando
- [ ] Responsividade mantida

### Visual:
- [ ] Design moderno e elegante
- [ ] Transições suaves
- [ ] Hierarquia visual clara
- [ ] Coerência com a nova paleta

### Técnico:
- [ ] Build sem erros
- [ ] Performance mantida
- [ ] Código limpo e organizado
- [ ] Documentação atualizada

## 🚀 Próximos Passos

1. **Aprovação do planejamento**
2. **Configuração da paleta no Tailwind**
3. **Implementação fase por fase**
4. **Testes e refinamentos**
5. **Documentação final**

---

**Status:** 🚧 Implementação em andamento  
**Progresso:** Fase 1 e 2 concluídas  
**Próximo:** Fase 3 - Componentes específicos 