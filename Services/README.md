# Services

**Status: planejado para v0.5 — ainda não iniciado.**

Serviços transversais que qualquer parte do Framework (ou o código do
usuário) pode consumir. Diferente do Core, não lidam com a mecânica
crua do SAP GUI — orquestram funcionalidades por cima dele.

## Classes previstas

| Classe | Responsabilidade |
|---|---|
| `clsSAPLogger` | Log em níveis (Info/Warning/Error/Debug/Trace), destino arquivo e/ou Immediate, e-mail automático em erro crítico |
| `clsSAPSmartWait` | `WaitBusy()`, `WaitObject()`, `WaitStatus()` — espera inteligente além do `WaitReady` básico do Core |
| `clsSAPPerformance` | Medição de tempo por transação/rotina, para diagnosticar automações lentas |
| `clsSAPDiagnostics` | Inspector, `SessionDump`, `ObjectDump` — introspecção da árvore de tela para debug |
| `clsSAPExceptionHandler` | Política central de tratamento (retry, log automático, notificação) sobre `clsSAPException` |
| `clsSAPTransactionManager` | Orquestração de sequências de transações com rollback lógico |
| `clsSAPNavigation` | Atalhos de navegação de mais alto nível que os básicos já expostos em `clsSAP` |
| `clsSAPCache` | Cache compartilhado entre sessões/execuções (hoje o cache em `clsSAPSession` é por instância) |

## Pré-requisito

Não iniciar esta camada antes do Core (v0.2) estar estável e
validado em uso real, pois `clsSAPLogger` e `clsSAPSmartWait` vão se
apoiar diretamente nos pontos de extensão do Core (`clsSAP.DebugMode`,
`clsSAPSession.WaitReady`).
