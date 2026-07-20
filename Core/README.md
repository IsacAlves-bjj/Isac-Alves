# Core

Camada fundacional do FrameworkX. É a única camada autorizada a falar
diretamente com o SAP GUI Scripting (`GetObject("SAPGUI")`,
`session.FindById(...)`). Todas as demais camadas (Services,
Components, Extensions) e todo código do usuário devem passar por
aqui.

## Status: v0.2 — entregue nesta rodada

| Arquivo | Responsabilidade |
|---|---|
| `clsSAPException.cls` | Erro padronizado do Framework (número, classe, método, campo, timestamp) |
| `clsSAPConnection.cls` | Localiza o SAP GUI, obtém o motor de scripting, conecta a uma conexão aberta |
| `clsSAPSession.cls` | Encapsula a `GuiSession`; único ponto autorizado a chamar `FindById`; cache de componentes; `WaitReady` |
| `clsSAP.cls` | Fachada pública (`SAP.Connect`, `SAP.Transaction`, `SAP.Field`, `SAP.Execute`) — é o que o desenvolvedor instancia |
| `M_WinAPI.bas` | Declarações `Sleep`/`GetTickCount` compatíveis com Office 32 e 64 bits |

## Regra de ouro

`session.FindById(...)` só pode aparecer dentro de `clsSAPSession`.
Se você está escrevendo `FindById` em qualquer outro lugar do
projeto (Components, Extensions, ou pior, no código do usuário),
pare — a API já deveria oferecer um caminho por `clsSAP.Field(...)`.

## O que ainda NÃO está aqui

- **Logger completo** (níveis, arquivo, e-mail em erro crítico) — vem em `Services` (v0.5). O Core só tem um `Debug.Print` mínimo controlado por `SAP.DebugMode`.
- **Smart Wait completo** (`WaitObject`, `WaitStatus`) — vem em `Services` (v0.5). O Core só tem `WaitReady` (poll em `session.Busy`).
- **Wrappers tipados de componente** — `clsSAPField` (campos de texto) já foi entregue em `Components` (v0.3), acessível via `SAP.TypedField(Id)`; os demais (`clsSAPGrid`, `clsSAPButton`, etc.) ainda faltam. Ver `Components/README.md`. `SAP.Field(...)` continua retornando o objeto SAP GUI nativo (`GuiTextField`, `GuiButton`...), que já expõe `.Text`, `.Press` etc., para quem não precisar da validação extra.

## Dependências

Nenhuma externa. Apenas `Microsoft Scripting Runtime` (para
`Scripting.Dictionary`, usado no cache de `clsSAPSession`) — referência
padrão em qualquer projeto VBA, geralmente já disponível via late
binding com `CreateObject`.
