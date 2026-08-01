# FrameworkX — Instruções para o agente de desenvolvimento

Este documento é o ponto de entrada para qualquer agente (Claude Code
ou outro) que assumir este projeto. Leia isto antes de tocar em
qualquer arquivo.

## 1. O que é este projeto

Uma biblioteca/framework profissional em **VBA** para **SAP GUI
Scripting**, usada como base de todas as automações SAP em Excel/VBA
do usuário. **Não é** um conjunto de macros — é uma plataforma de
desenvolvimento reutilizável, com o objetivo de esconder praticamente
toda a complexidade do SAP GUI Scripting atrás de uma API limpa.

API alvo que todo código de automação deve conseguir usar:

```vba
Dim SAP As New clsSAP
SAP.Connect
SAP.Transaction "VA03"
SAP.Field("wnd[0]/usr/ctxtVBAK-VBELN").Text = Pedido
SAP.Execute
```

E **nunca**:

```vba
session.FindById("wnd[0]/usr/ctxtVBAK-VBELN").Text = Pedido
```

O documento completo e original do briefing técnico está em
`docs/BRIEFING_ORIGINAL.md`. Este `CLAUDE.md` é um resumo operacional
dele — em caso de dúvida sobre intenção/escopo, o briefing original é
a fonte de verdade.

## 2. Estado atual do projeto

- **v0.1** (kit inicial, pré-existente): arquitetura conceitual 9/10,
  implementação 2/10 — vários métodos retornavam `Nothing`/`False`
  sem lógica real. Foi descartado como código; a ideia arquitetural
  serviu de inspiração.
- **v0.2 (Core) — entregue.** Reescrito do zero. Ver `Core/README.md`
  para o que está pronto e o que falta.
- **v0.3 (Components) — em andamento.** `clsSAPField` (campos de
  texto, via `SAP.TypedField(Id)`), `clsSAPGrid` (ALV Grid, via
  `SAP.TypedGrid(Id)`), `clsSAPButton` (botões, via
  `SAP.TypedButton(Id)`), `clsSAPCheckBox`/`clsSAPRadioButton`
  (caixas de seleção/radio buttons, via `SAP.TypedCheckBox(Id)`/
  `SAP.TypedRadioButton(Id)`), `clsSAPComboBox` (via
  `SAP.TypedComboBox(Id)`), `clsSAPStatusBar` (barra de mensagens,
  via `SAP.TypedStatusBar(Id)`), `clsSAPTab` (abas, via
  `SAP.TypedTab(Id)`) e `clsSAPTable` (table control clássico, via
  `SAP.TypedTable(Id)` — API implementada a partir da documentação do
  SAP GUI Scripting mas ainda **não validada contra sessão SAP real**,
  ver nota em `Components/README.md`) entregues. Ver
  `Components/README.md` para o padrão de design a seguir nos próximos
  wrappers (`clsSAPShell`, `clsSAPTree`, `clsSAPMenu`).
- **v0.5 (Services), Extensions, RC, v1.0** — ainda não iniciados.
  Ver seção 7 (Roadmap) abaixo.

**Seu primeiro passo ao assumir o projeto:** leia `Core/README.md`,
abra os 5 arquivos de `Core/` e rode mentalmente (ou peça para o
usuário rodar) `Tests/M_Test_Core.bas` para confirmar que o baseline
está íntegro antes de construir em cima dele.

## 3. Como você deve atuar (não negociável)

Você é um **engenheiro de software responsável por este framework**,
não um gerador de snippets. Para cada módulo que desenvolver:

1. Analise a arquitetura existente antes de escrever código novo.
2. Refatore quando necessário — não empilhe gambiarra sobre o que já
   existe.
3. Zero duplicação de código.
4. Tratamento de erro consistente em **todo** método público (sempre
   convertendo para `clsSAPException`, nunca deixando um erro cru do
   VBA escapar de uma classe do Framework).
5. Código reutilizável — pense em quem vai usar isso em uma
   automação real, não só no caso de teste.
6. Documente classes e métodos (comentário acima de cada método
   público explicando o que faz e por quê, não só o quê).
7. Todo módulo novo vem com pelo menos um exemplo em `Examples/`.
8. Valide coerência com o resto do framework (convenções de nome,
   estilo de erro, uso de cache) antes de considerar um módulo
   pronto.
9. Priorize simplicidade e manutenção de longo prazo sobre
   engenhosidade.

Desenvolvimento **incremental**: cada entrega deve ser utilizável por
si só, preservando compatibilidade com versões anteriores. Não
reescreva Core inteiro para adicionar Components — estenda.

## 4. Arquitetura

```
FrameworkX/
├── Core/          → única camada que fala com session.FindById
├── Services/      → Logger, SmartWait, Performance, Diagnostics... (v0.5)
├── Components/    → wrappers tipados (clsSAPField, clsSAPGrid...) (v0.3)
├── Utils/         → Strings, Datas, Arquivos, Outlook, Excel...
├── Extensions/    → bibliotecas de domínio (SD primeiro, depois MM/FI...)
├── Tests/         → M_Test_<Módulo>.bas, 1 por módulo
├── Examples/       → Example_<Módulo>_<Cenário>.bas, 1+ por módulo
└── docs/          → briefing original e documentação de apoio
```

**Regra de ouro:** `session.FindById(...)` só pode existir dentro de
`Core/clsSAPSession.cls`. Se qualquer outra classe (Components,
Extensions) ou qualquer exemplo/automação do usuário chamar
`FindById` diretamente, isso é uma falha de arquitetura — corrija
expondo o caminho certo através de `clsSAP`/`clsSAPSession`.

## 5. Convenções obrigatórias

**Nomenclatura:**
- Classes: `clsSAP`, `clsSAPConnection`, `clsSAPSession`,
  `clsSAPLogger`, `clsSAPField`, `clsSAPException`,
  `clsSAPTransaction`, `clsSAPWait`, `clsSAPGrid`, `clsSAPTable`, etc.
- Módulos: `M_Main`, `M_Test_<Módulo>`, `M_Utils`, `M_API`,
  `M_WinAPI`.

**Princípios de código:**
- `Option Explicit` obrigatório em todo arquivo, sem exceção.
- Sem código duplicado.
- Tratamento de erro obrigatório em todo método público.
- Compatível com VBA7 (`#If VBA7 Then ... PtrSafe`).
- Compatível com Office 32 bits e 64 bits.
- Classes pequenas, uma responsabilidade por classe.
- Métodos curtos, nomes descritivos, código legível antes de código
  esperto.
- Módulos divididos para respeitar os limites de tamanho de módulo
  VBA — se uma classe está crescendo demais, é sinal de que ela tem
  mais de uma responsabilidade; separe.

## 6. Critérios de aceite (definição de "pronto")

Nenhum código entra no projeto sem:

- [ ] Compilar sem erros
- [ ] `Option Explicit` presente
- [ ] Tratamento de erro em todo método público (`clsSAPException`)
- [ ] Comentários explicando classes e métodos
- [ ] Entrada correspondente/atualizada em `README.md` da camada
- [ ] Pelo menos um exemplo em `Examples/`
- [ ] Testes cobrindo positivo, negativo, erro (e performance, quando
      fizer sentido) em `Tests/M_Test_<Módulo>.bas`
- [ ] Sem duplicação de código
- [ ] Revisado quanto à coerência com o restante do framework

## 7. Roadmap

| Versão | Escopo | Status |
|---|---|---|
| v0.1 | Kit inicial (arquitetura conceitual) | Descartado como código, mantido como inspiração |
| v0.2 | Core | Entregue — ver `Core/README.md` |
| **v0.3** | **Components** | **Em andamento — `clsSAPField`, `clsSAPGrid`, `clsSAPButton`, `clsSAPCheckBox`, `clsSAPRadioButton`, `clsSAPComboBox`, `clsSAPStatusBar`, `clsSAPTab` e `clsSAPTable` entregues, ver `Components/README.md`** |
| v0.5 | Services | Não iniciado |
| RC | Testes, documentação, exemplos consolidados | Não iniciado |
| v1.0 | Release profissional | Não iniciado |

Sugestão de próximo passo natural: continuar **v0.3 — Components**.
`clsSAPField`, `clsSAPGrid`, `clsSAPButton`, `clsSAPCheckBox`,
`clsSAPRadioButton`, `clsSAPComboBox`, `clsSAPStatusBar`, `clsSAPTab` e
`clsSAPTable` já foram entregues — ver `Components/README.md`.
**Importante:** `clsSAPTable`/`GuiTableControl` foi implementado a
partir da API documentada do SAP GUI Scripting, mas a suposição
central (que `GetCell` usa linha relativa à janela visível, exigindo
rolagem manual via `VerticalScrollbar.Position`) ainda **não foi
validada contra uma sessão SAP real** — antes de usar em produção,
rode `Test_TypedTable_ComSessaoReal_Integracao` e confira as três
suposições de risco documentadas em `Components/clsSAPTable.cls` e
`Components/README.md`, como já feito com `clsSAPGrid`/
`clsSAPStatusBar`. Do que resta do v0.3, `clsSAPShell`/`clsSAPTree`/
`clsSAPMenu` são os de uso mais nichado e menor prioridade — bons
candidatos para a próxima rodada, ou avançar para v0.5 (Services) se
o usuário preferir.

## 8. Contexto de uso real (por que isso importa)

Este framework não é acadêmico — ele vai substituir código de
produção. Características do ambiente real:

- SAP ECC, módulo **SD** como foco inicial.
- Desenvolvimento em Excel/VBA com SAP GUI Scripting, plantas
  distintas (múltiplos ambientes SAP), integração com Outlook,
  manipulação de arquivos e consolidação de dados.
- O usuário tem diversas automações existentes cheias de
  `session.FindById(...)` repetido; o objetivo de longo prazo é
  migrá-las gradualmente para consumir `clsSAP` em vez de scripting
  cru — não é um projeto isolado, é infraestrutura para tudo que já
  existe e para tudo que vier depois.
- Prioridade real: produtividade, menos manutenção, padronização —
  não elegância acadêmica.

Ao tomar decisões de design ambíguas, prefira a opção que reduz
atrito para quem vai migrar uma automação real de `FindById` cru para
esta API, mesmo que isso signifique uma API um pouco menos "pura".

## 9. Como testar

Não há ambiente de CI para VBA. O fluxo é:

1. Abrir o arquivo `.xlsm`/projeto VBA de destino.
2. Importar os módulos/classes de `Core/` e `Components/` (e demais
   camadas conforme forem sendo desenvolvidas), incluindo os dubles
   `clsFakeGui*` de `Tests/`, via VBA IDE (Arquivo > Importar Arquivo,
   ou arrastar para o Project Explorer).
3. Rodar no Immediate Window (`Ctrl+G` para abrir):
   - `M_Test_Core.RunAllCoreTests` — testes do Core (v0.2).
   - `M_Test_Components.RunAllComponentsTests` — testes de Components
     (v0.3): `clsSAPField`, `clsSAPGrid`, `clsSAPButton`,
     `clsSAPCheckBox`, `clsSAPRadioButton`, `clsSAPComboBox`,
     `clsSAPStatusBar`, `clsSAPTab`, `clsSAPTable`.
   - Cada camada nova ganha seu próprio `M_Test_<Camada>.RunAll<Camada>Tests`
     — rode o de toda camada que você tocar, não só o da mais nova.
4. Testes que dependem de SAP aberto se auto-identificam e aparecem
   como `[SKIP]` quando o ambiente não está disponível — isso é
   esperado, não é falha. Testes de integração/performance que exigem
   estado externo (sessão conectada, tela específica) não entram no
   `RunAll...Tests()` automático — são `Sub` separadas, chamadas
   manualmente (ex.: `Test_TypedStatusBar_ComSessaoReal_Integracao`).

## 10. Arquivos de referência

- `docs/BRIEFING_ORIGINAL.md` — briefing técnico completo, fonte de
  verdade para escopo e intenção.
- `CHANGELOG.md` — histórico de versões entregues.
- `README.md` (raiz) — visão geral rápida do repositório.
