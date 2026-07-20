# Extensions / SD

**Status: planejado — depois de Components (v0.3) e Services (v0.5).**

Biblioteca específica para o módulo SD (Sales & Distribution) do SAP,
construída sobre o Core + Components + Services. É aqui que entram
atalhos de alto nível para as transações que o usuário já automatiza
hoje (ex.: `VA01`, `VA02`, `VA03`), substituindo gradualmente o código
disperso nas automações existentes do usuário (ex.: criação de pedidos
de venda via VA01, geração de COA, etc.).

## Ordem de extensões prevista (briefing, seção 9)

1. **SD** (foco inicial)
2. MM
3. FI
4. Excel
5. Outlook
6. Arquivos
7. Relatórios

## Diretriz

Classes aqui devem ter nomes de domínio (ex.: `clsSDPedidoVenda`, não
`clsVA01Wrapper`), e devem depender apenas da API pública do Core/
Components/Services — nunca acessar `session.FindById` diretamente.
