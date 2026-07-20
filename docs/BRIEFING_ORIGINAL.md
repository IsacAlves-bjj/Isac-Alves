# Briefing Técnico – FrameworkX

**Documento Mestre de Engenharia — Versão 1.0**

Este é o briefing original fornecido pelo usuário, preservado na
íntegra como fonte de verdade sobre escopo e intenção do projeto.
`CLAUDE.md`, na raiz do repositório, é o resumo operacional deste
documento para o agente de desenvolvimento.

---

## 1. Objetivo do Projeto

Construir uma biblioteca/framework profissional em VBA para SAP GUI
Scripting que sirva como base para qualquer automação SAP
desenvolvida em Excel/VBA.

O objetivo NÃO é criar apenas um conjunto de macros.
O objetivo é criar uma plataforma de desenvolvimento reutilizável.

O Framework deverá reduzir drasticamente:
- código repetitivo;
- manutenção;
- tempo de desenvolvimento;
- tempo de testes;
- erros de automação.

O Framework deverá esconder praticamente toda a complexidade do SAP
GUI Scripting.

## 2. Motivação

O usuário possui dezenas de automações SAP. Grande parte do código
possui `session.FindById(...)` repetido centenas ou milhares de
vezes. Isso gera manutenção difícil, baixa reutilização, código
extenso, pouca padronização e alto risco de quebra. O Framework
deverá eliminar esse problema.

## 3. Situação atual

Existe um kit inicial denominado FrameworkX v0.1, com os arquivos
`clsSAP.cls`, `clsSAPSession.cls`, `clsSAPField.cls`, `M_Test.bas`,
`FrameworkX_Guia.docx`.

Após análise técnica: arquitetura 9/10, implementação 2/10. O
Framework atual é apenas um MVP. Diversos métodos retornam `Nothing`/
`False` sem implementação real.

Conclusão: a arquitetura pode servir como inspiração. O código
deverá ser praticamente reescrito.

## 4. Objetivo arquitetural

O Framework deverá possuir baixo acoplamento, alta coesão, orientação
a objetos e encapsulamento completo do SAP GUI. O desenvolvedor não
deverá escrever `session.FindById(...)` diretamente.

## 5. Arquitetura desejada

```
FrameworkX
├── Core
├── Services
├── Components
├── Utils
├── Extensions
├── Tests
└── Examples
```

## 6. Core

Responsável por: conexão SAP, sessões, objetos, cache, eventos,
configuração, engine, tratamento de erros.

## 7. Services

Logger, Smart Wait, Performance, Diagnostics, Exception, Transactions,
Navigation, Cache.

## 8. Components

Wrappers para: GuiTextField, GuiButton, GuiGridView, GuiTableControl,
GuiShell, GuiTree, GuiMenu, GuiTab, GuiStatusBar, GuiCheckBox,
GuiRadioButton, GuiComboBox.

## 9. Extensions

Bibliotecas específicas. Inicialmente SD. Depois: MM, FI, Excel,
Outlook, Arquivos, Relatórios.

## 10. Objetivo principal

O desenvolvedor deverá escrever algo parecido com:

```vba
SAP.Connect
SAP.Transaction "VA03"
SAP.Field("VBAK-VBELN").Text = Pedido
SAP.Execute
```

e nunca `session.FindById(...)`.

## 11. Objetivos técnicos

O Framework deverá: detectar SAP automaticamente; detectar múltiplas
conexões; detectar múltiplas sessões; recuperar automaticamente a
sessão correta; esperar telas carregarem; eliminar Sleep sempre que
possível; encapsular FindById; possuir cache; possuir logger; possuir
diagnósticos; possuir tratamento padronizado de exceções; possuir
documentação; possuir testes; possuir exemplos.

## 12. Princípios obrigatórios

Option Explicit obrigatório; sem código duplicado; tratamento de erro
obrigatório; compatível VBA7; compatível Office 32 bits; compatível
Office 64 bits; classes pequenas; uma responsabilidade por classe;
métodos curtos; código legível.

## 13. Convenções

Classes: `clsSAP`, `clsSAPConnection`, `clsSAPSession`,
`clsSAPLogger`, `clsSAPField`, `clsSAPException`, `clsSAPTransaction`,
`clsSAPWait`, `clsSAPGrid`, `clsSAPTable`.

Módulos: `M_Main`, `M_Test`, `M_Utils`, `M_API`.

## 14. Funcionalidades previstas

**Core:** Conectar, Desconectar, IsConnected, GetSession, Reconnect.

**Navigation:** Transaction(), Back(), Execute(), Refresh().

**Objects:** Field(), Button(), Grid(), Tree(), Menu(), Window(),
StatusBar().

**Logger:** Info, Warning, Error, Debug, Trace.

**Smart Wait:** WaitReady(), WaitBusy(), WaitObject(), WaitStatus().

**Diagnostics:** Inspector, SessionDump, ObjectDump, Performance.

**Utils:** Strings, Datas, Arquivos, Pastas, Outlook, Excel,
Conversões.

## 15. Testes

Cada módulo deverá possuir: teste positivo, teste negativo, teste de
erro, teste de performance.

## 16. Critérios de aceite

Nenhum código poderá entrar no projeto sem: compilar; Option
Explicit; tratamento de erro; comentários; documentação; exemplo; sem
duplicação; reutilizável; revisado.

## 17. Roadmap

- Versão 0.2 — Core
- Versão 0.3 — Components
- Versão 0.5 — Services
- Versão RC — Testes, Documentação, Exemplos
- Versão 1.0 — Release profissional

## 18. Contexto do usuário (muito importante)

O Framework será utilizado em ambiente corporativo. Características
do ambiente: SAP ECC (módulo SD como foco inicial); desenvolvimento
em Excel/VBA com SAP GUI Scripting; objetivo de reutilizar o
framework em diversas automações reais, incluindo geração de
relatórios, integrações com Outlook, manipulação de arquivos e
consolidação de dados; o usuário possui diversas automações
existentes e deseja substituir gradualmente chamadas diretas a
`session.FindById(...)` por uma API organizada; foco principal em
ganho de produtividade, redução de manutenção e padronização do
código.

## 19. Diretrizes para o agente de desenvolvimento (Claude/Codex)

O agente deverá atuar como engenheiro de software, não apenas como
gerador de código. Para cada módulo desenvolvido, deverá:

1. Analisar a arquitetura existente.
2. Refatorar quando necessário.
3. Evitar duplicação.
4. Implementar tratamento de erros consistente.
5. Produzir código reutilizável.
6. Documentar classes e métodos.
7. Criar exemplos de uso.
8. Validar coerência com o restante do framework.
9. Priorizar simplicidade e manutenção de longo prazo.

O desenvolvimento deverá ser incremental, com entregas utilizáveis,
preservando compatibilidade entre versões e evitando retrabalho.
