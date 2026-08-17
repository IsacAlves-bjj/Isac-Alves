# Deploy do PhysioApp — guia passo a passo

Este guia leva o painel web (backend + frontend) do "só roda no meu
computador" para um link de verdade, acessível de qualquer lugar —
etapa necessária tanto para a Dra. Gabrielly usar o painel no celular
quanto para o link de captação de leads (bio do Instagram) funcionar.

## 1. Visão geral

Três peças, hospedadas juntas no [Railway](https://railway.com):

| Peça | O que é | Pasta no repo |
|---|---|---|
| Banco de dados | Postgres gerenciado pelo Railway | — (serviço próprio) |
| Backend | API (Node/Express) | `PhysioApp/backend` |
| Web | Painel da fisioterapeuta (React, build estático) | `PhysioApp/web` |

O repositório (`isacalves-bjj/isac-alves`) tem outros projetos na raiz
(FrameworkX) — por isso cada serviço no Railway precisa apontar sua
**Root Directory** para a pasta certa (`PhysioApp/backend` ou
`PhysioApp/web`), passo detalhado abaixo.

## 2. Por que Railway (e não Vercel/Netlify)

Vercel e Netlify têm planos gratuitos ótimos, mas o "Hobby" deles **proíbe
uso comercial** nos termos de uso — e um link de captação de leads para
uma clínica conta como comercial. O Railway tem a mesma restrição no
plano Hobby, mas por ser só uma etapa de teste privado (você + Dra.
Gabrielly, sem tráfego público ainda), o Hobby ($5/mês) serve para agora.
**Antes de colocar o link na bio do Instagram** (tráfego público, uso
comercial de fato), o projeto precisa subir para o plano Pro
($20/mês) — é só trocar o plano no dashboard, não muda nada no código.

## 3. Passo a passo

### 3.1. Criar conta e projeto

1. Acesse [railway.com](https://railway.com) e crie uma conta (dá pra
   entrar direto com GitHub).
2. **New Project → Deploy from GitHub repo** → selecione
   `isacalves-bjj/isac-alves` (autorize o Railway a acessar o repo, se
   pedido).
3. Railway vai tentar criar um serviço automático a partir da raiz do
   repo — **pode cancelar/apagar esse serviço inicial**, vamos criar os
   três serviços certos manualmente nos próximos passos.

### 3.2. Banco de dados (Postgres)

1. No projeto, **+ New → Database → Add PostgreSQL**.
2. Pronto — o Railway já cria o banco e expõe uma variável interna
   `DATABASE_URL` que os outros serviços podem referenciar.

### 3.3. Serviço do backend

1. **+ New → GitHub Repo** → escolha `isacalves-bjj/isac-alves`
   novamente (pode adicionar o mesmo repo mais de uma vez, cada
   serviço com configuração própria).
2. Nas **Settings** desse serviço:
   - **Root Directory**: `PhysioApp/backend`
   - **Deploy → Custom Start Command**: deixe em branco (usa o `npm
     start` do `package.json`, que já roda as migrations e sobe o
     servidor).
3. Em **Variables**, adicione:
   - `DATABASE_URL` → clique em "Add Reference" e aponte para o
     Postgres criado no passo 3.2 (o Railway resolve isso sozinho, sem
     copiar/colar string de conexão).
   - `JWT_SECRET` → uma string aleatória longa (ex.: gere uma em
     [1password.com/password-generator](https://1password.com/password-generator)
     ou peça pro Railway mesmo sugerir um valor aleatório).
   - `PATIENT_OTP_DEV` → `123456` (por enquanto — trocar quando o SMS
     real de verificação do paciente for integrado).
   - `PORT` → não precisa definir, o Railway injeta automaticamente.
4. Em **Settings → Networking**, clique em **Generate Domain** — isso
   dá uma URL pública tipo
   `physioapp-backend-production.up.railway.app`. Copie essa URL, vai
   ser usada no próximo passo.
5. Aguarde o deploy terminar (acompanhe em **Deployments**).

### 3.4. Serviço do painel web

1. **+ New → GitHub Repo** → `isacalves-bjj/isac-alves` de novo.
2. **Settings**:
   - **Root Directory**: `PhysioApp/web`
3. **Variables**:
   - `VITE_API_URL` → a URL do backend gerada no passo 3.3.4, com
     `https://` na frente (ex.:
     `https://physioapp-backend-production.up.railway.app`).
     **Importante**: essa variável precisa estar configurada *antes*
     do primeiro deploy — ela é "assada" dentro do build, não dá pra
     trocar depois sem gerar um novo build.
4. **Settings → Networking → Generate Domain** — essa é a URL final do
   painel (a que a Dra. Gabrielly vai acessar/instalar no celular).
5. Aguarde o deploy.

### 3.5. Fechar o CORS

1. Volte no serviço **backend** → **Variables** → adicione:
   - `CORS_ORIGIN` → a URL do painel web gerada no passo 3.4.4, com
     `https://` (ex.: `https://physioapp-web-production.up.railway.app`).
2. Isso reinicia o backend automaticamente e passa a aceitar
   requisições só desse domínio — sem essa variável, ele aceita
   qualquer origem (ok para teste, não ideal para produção real).

### 3.6. Popular o banco (uma vez só)

O banco sobe vazio — sem isso não tem categorias de triagem nem login.

1. Instale a [Railway CLI](https://docs.railway.com/guides/cli) na sua
   máquina (`npm i -g @railway/cli`) e rode `railway login`.
2. `railway link` (escolha o projeto) e depois:
   ```
   railway run --service backend npm run seed
   ```
3. Isso cria o login padrão: `fisio@physioapp.local` / `mudar123` —
   **a primeira coisa a fazer depois de logar é trocar essa senha**
   (ainda não existe tela de "trocar senha" no painel — é o próximo
   item natural a construir antes de ir ao ar de verdade).

### 3.7. Testar

1. Abra a URL do painel web (passo 3.4.4) no navegador do celular.
2. Faça login com o usuário padrão.
3. No Android (Chrome): deve aparecer um banner ou opção no menu
   "Adicionar à tela inicial" / "Instalar app" — o manifest.webmanifest
   e o service worker já estão configurados para isso.
4. No iPhone (Safari): compartilhar → "Adicionar à Tela de Início" —
   funciona mesmo sem esse prompt automático (limitação do iOS, não
   do app).

## 4. Próximos passos (fora do escopo deste guia)

- **Domínio próprio** (ex.: `dragabriellygomes.com.br`): depois que o
  Railway estiver funcionando, é só registrar o domínio (ver
  orientação de custo já discutida) e apontar o DNS pra URL do
  Railway — o próprio Railway tem uma tela de "Custom Domain" que
  gera as instruções de DNS exatas.
- **Link de captação para a bio do Instagram**: hoje o painel web é
  só a área da fisioterapeuta (autenticada) — o fluxo de triagem do
  paciente está no app mobile (`PhysioApp/mobile`, Expo/React Native),
  que não gera um link de navegador sozinho. Publicar isso como link
  público é uma etapa separada (ex.: rodar `expo export --platform
  web` e publicar como um terceiro serviço), ainda não feita.
- **Trocar para o plano Pro do Railway** antes de divulgar o link
  publicamente (ver seção 2).
- **Revisão de LGPD**: antes de qualquer dado real de paciente entrar
  no sistema, os textos de consentimento/triagem precisam ser
  revisados e aprovados pela própria Dra. Gabrielly, como já
  combinado anteriormente.
