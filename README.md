# 🚗 DetailPro SaaS
### Plataforma Completa de Gestão para Estéticas Automotivas

![DetailPro Banner](https://img.shields.io/badge/DetailPro-SaaS-0EA5E9?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Firebase](https://img.shields.io/badge/Firebase-10-orange?style=for-the-badge&logo=firebase)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)

---

## 📋 Índice
- [Visão Geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Instalação](#instalação)
- [Configuração Firebase](#configuração-firebase)
- [Deploy Vercel](#deploy-vercel)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Collections Firestore](#collections-firestore)
- [Sistema de Planos](#sistema-de-planos)

---

## 🎯 Visão Geral

DetailPro SaaS é uma plataforma **multi-tenant** completa para gestão de estéticas automotivas. Cada empresa tem seus dados completamente isolados, com controle de acesso por roles e planos de assinatura.

---

## 🛠️ Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14 (App Router) |
| Banco de Dados | Firebase Firestore |
| Autenticação | Firebase Authentication |
| Armazenamento | Firebase Storage |
| Hospedagem | Vercel |
| Interface | TailwindCSS |
| Gráficos | Chart.js + React-ChartJS-2 |
| Calendário | FullCalendar |
| Estado Global | Zustand |
| Forms | React Hook Form + Zod |

---

## ✅ Funcionalidades

### 🏢 Multi-Tenant
- Cada empresa tem dados completamente isolados
- Campo `companyId` em todas as collections
- Regras de segurança Firestore por empresa

### 👤 Autenticação & Usuários
- Login / Cadastro / Reset de senha
- Roles: `admin`, `manager`, `employee`, `finance`
- Controle de permissões baseado em roles

### 📊 Dashboard
- Estatísticas em tempo real
- Agendamentos do dia
- Faturamento diário e mensal
- Gráficos de receita vs despesas
- Serviços mais vendidos

### 👥 Clientes
- CRUD completo
- Histórico de serviços
- Link WhatsApp direto
- Busca em tempo real

### 🚗 Veículos
- Vinculado ao cliente
- Histórico de serviços por veículo
- Controle de quilometragem

### 🔧 Serviços
- Catálogo de serviços personalizável
- Categorias: lavagem, polimento, vitrificação, etc.
- Duração e preços

### 📅 Agenda
- Calendário interativo (FullCalendar)
- Visualizações: mensal, semanal, diária, lista
- Status: agendado, em andamento, concluído, cancelado

### 👨‍🔧 Funcionários
- Cadastro completo
- Controle de produtividade
- Comissões

### 📦 Estoque
- Controle de produtos
- Alertas de estoque baixo
- Ajuste rápido de quantidade

### 💰 Financeiro
- Fluxo de caixa (receitas e despesas)
- Filtros por período
- Resumo: receita, despesa, lucro

### 💼 Planos SaaS
- Starter, Professional, Premium
- Trial gratuito de 14 dias
- Limites por plano

---

## 🏗️ Arquitetura Multi-Tenant

```
Firebase Firestore
│
├── companies/{companyId}          ← Dados da empresa
├── users/{userId}                 ← companyId vinculado
├── clients/{clientId}             ← companyId + dados do cliente
├── vehicles/{vehicleId}           ← companyId + clientId
├── services/{serviceId}           ← companyId + catálogo
├── appointments/{appointmentId}   ← companyId + agendamento
├── employees/{employeeId}         ← companyId + funcionário
├── products/{productId}           ← companyId + estoque
├── financial/{transactionId}      ← companyId + transação
├── subscriptions/{companyId}      ← plano da empresa
└── logs/{logId}                   ← companyId + auditoria
```

Isolamento garantido por:
1. Todas as queries filtram por `companyId`
2. Regras Firestore validam o `companyId` do usuário autenticado
3. Nenhuma query cross-company é possível

---

## 🚀 Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta Firebase
- Conta Vercel (para deploy)

### 1. Clone / extraia o projeto

```bash
cd detailpro-saas
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais Firebase.

### 4. Execute em desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## 🔥 Configuração Firebase

### Passo 1: Criar Projeto Firebase
1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Clique em "Adicionar projeto"
3. Nomeie: `detailpro-saas`
4. Ative o Google Analytics (opcional)

### Passo 2: Configurar Authentication
1. No menu lateral: **Authentication** → **Sign-in method**
2. Ative: **Email/Senha**

### Passo 3: Configurar Firestore
1. No menu lateral: **Firestore Database**
2. Clique em **Criar banco de dados**
3. Escolha: **Modo de produção**
4. Selecione região: `southamerica-east1` (São Paulo)

### Passo 4: Aplicar Regras de Segurança
1. Vá em **Firestore** → **Regras**
2. Copie o conteúdo de `firestore.rules`
3. Cole e publique

### Passo 5: Criar Índices
1. Vá em **Firestore** → **Índices**
2. Importe o arquivo `firestore.indexes.json`
   - Ou use Firebase CLI: `firebase deploy --only firestore:indexes`

### Passo 6: Configurar Storage
1. No menu lateral: **Storage**
2. Clique em **Começar**
3. Use as regras padrão (modo de produção)

### Passo 7: Obter Credenciais
1. Clique na engrenagem ⚙️ → **Configurações do projeto**
2. Role até **Seus aplicativos** → **SDK de configuração**
3. Copie os valores para `.env.local`

---

## ☁️ Deploy Vercel

### Via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy produção
vercel --prod
```

### Via Dashboard Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Clique em **New Project**
3. Importe o repositório GitHub
4. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
5. Clique em **Deploy**

### Configuração de Domínio
1. Em **Settings** → **Domains**
2. Adicione seu domínio customizado
3. Configure DNS conforme instruções da Vercel

### Atualizar Authorized Domains no Firebase
1. Firebase Console → Authentication → Settings
2. **Authorized domains** → Adicionar seu domínio Vercel

---

## 📁 Estrutura do Projeto

```
detailpro-saas/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── login/page.tsx          ← Login
│   │   │   └── register/page.tsx       ← Cadastro + Planos
│   │   ├── dashboard/
│   │   │   ├── layout.tsx              ← Layout com sidebar
│   │   │   └── page.tsx                ← Dashboard principal
│   │   ├── clients/page.tsx            ← CRUD Clientes
│   │   ├── vehicles/page.tsx           ← CRUD Veículos
│   │   ├── services/page.tsx           ← CRUD Serviços
│   │   ├── appointments/page.tsx       ← Agenda + Calendário
│   │   ├── employees/page.tsx          ← CRUD Funcionários
│   │   ├── products/page.tsx           ← CRUD Estoque
│   │   ├── financial/page.tsx          ← Financeiro
│   │   ├── reports/page.tsx            ← Relatórios
│   │   └── settings/page.tsx           ← Configurações
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx             ← Menu lateral
│   │   │   └── Header.tsx              ← Cabeçalho
│   │   ├── dashboard/                  ← Componentes do dashboard
│   │   ├── forms/                      ← Formulários reutilizáveis
│   │   └── ui/                         ← Componentes UI base
│   │
│   ├── lib/
│   │   ├── firebase/
│   │   │   ├── config.ts               ← Inicialização Firebase
│   │   │   ├── auth.ts                 ← Serviço de autenticação
│   │   │   └── firestore.ts            ← CRUD + queries
│   │   ├── hooks/
│   │   │   └── useAuth.ts              ← Hook de autenticação
│   │   ├── store.ts                    ← Estado global (Zustand)
│   │   └── utils/
│   │       └── index.ts                ← Utilitários
│   │
│   └── types/
│       └── index.ts                    ← TypeScript types
│
├── firestore.rules                     ← Regras de segurança
├── firestore.indexes.json              ← Índices compostos
├── vercel.json                         ← Config Vercel
├── .env.example                        ← Template de variáveis
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## 🗄️ Collections Firestore

### companies
```typescript
{
  id: string;
  name: string;
  email: string;
  phone: string;
  plan: 'starter' | 'professional' | 'premium';
  status: 'active' | 'inactive' | 'suspended' | 'trial';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### users
```typescript
{
  id: string;           // = Firebase Auth UID
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee' | 'finance';
  companyId: string;    // ← Chave de isolamento
  status: 'active' | 'inactive';
  createdAt: Timestamp;
}
```

### clients / vehicles / services / appointments / employees / products / financial
> Todos possuem `companyId` para isolamento multi-tenant.
> Ver `src/types/index.ts` para schema completo.

---

## 💳 Sistema de Planos

| Plano | Preço | Clientes | Funcionários | Features |
|-------|-------|----------|--------------|---------|
| Starter | R$ 97/mês | 100 | 2 | Agendamentos, Relatórios básicos |
| Professional | R$ 197/mês | 500 | 10 | + Estoque, Financeiro completo, Fotos |
| Premium | R$ 297/mês | Ilimitado | Ilimitado | + API, Suporte prioritário |

Todos os planos incluem **14 dias de trial gratuito**.

---

## 🔐 Roles e Permissões

| Recurso | admin | manager | employee | finance |
|---------|-------|---------|----------|---------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Clientes | ✅ | ✅ | ✅ | ✅ |
| Agenda | ✅ | ✅ | ✅ | ❌ |
| Funcionários | ✅ | ✅ | ❌ | ❌ |
| Financeiro | ✅ | ✅ | ❌ | ✅ |
| Configurações | ✅ | ❌ | ❌ | ❌ |

---

## 📞 Suporte

Para dúvidas ou sugestões, abra uma issue no repositório.

---

**DetailPro SaaS** © 2024 – Gestão Automotiva Profissional
