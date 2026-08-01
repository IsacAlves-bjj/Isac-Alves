# Changelog

## v0.3 — Components, em andamento (2026-07-18)

Início da camada Components, estendendo o Core sem alterar seu
comportamento existente (`SAP.Field(...)` continua retornando o
objeto nativo, para compatibilidade).

Adicionado (`clsSAPField`):
- `Components/clsSAPField.cls` — wrapper tipado para `GuiTextField`/
  `GuiCTextField`: validação de tipo no `Init`, erro claro ao escrever
  em campo desabilitado, atalhos (`IsEmpty`, `Clear`, `SetFocus`,
  `IsChangeable`, `IsRequired`, `MaxLength`, `Tooltip`, `ToString`,
  `NativeObject` como escape hatch)
- `Core/clsSAP.cls` — novo método `TypedField(Id)`, que resolve o
  componente via `clsSAPSession.GetComponent` e retorna um
  `clsSAPField` (coexiste com `Field()`, que não foi alterado)
- `Tests/clsFakeGuiTextField.cls` — duble de teste usado pelos testes
  de Components
- `Examples/Example_Components_Field.bas` — uso de `TypedField` em
  cenário real de VA02

Adicionado (`clsSAPGrid`):
- `Components/clsSAPGrid.cls` — wrapper tipado para `GuiGridView`
  (ALV Grid Control): validação de tipo no `Init`, validação de
  índice de linha em todo método que recebe `Row`, `GetColumnValues`
  (elimina o loop manual de leitura de coluna inteira), atalhos
  (`SelectRow`, `SelectAll`, `ClearSelection`, `SetCurrentCell`,
  `DoubleClickCell`, `PressToolbarButton`, `IsEmpty`, `ColumnIds`,
  `ToString`, `NativeObject` como escape hatch)
- `Core/clsSAP.cls` — novo método `TypedGrid(Id)`, análogo a
  `TypedField(Id)`
- `Tests/clsFakeGuiGridView.cls` — duble de teste usado pelos testes
  de Components
- `Examples/Example_Components_Grid.bas` — uso de `TypedGrid` em
  cenário real de VA05

Adicionado (`clsSAPButton`):
- `Components/clsSAPButton.cls` — wrapper tipado para `GuiButton`:
  validação de tipo no `Init`, `Press()` com erro padronizado,
  `IsDefault` (reflete `Emphasized`, o botão em destaque acionado
  pelo Enter), `Text`, `Tooltip`, `ToString`, `NativeObject` como
  escape hatch
- `Core/clsSAP.cls` — novo método `TypedButton(Id)`, análogo a
  `TypedField(Id)`/`TypedGrid(Id)`
- `Tests/clsFakeGuiButton.cls` — duble de teste usado pelos testes de
  Components
- `Examples/Example_Components_Button.bas` — confirmar popup e tratar
  erro de botão indisponível

Adicionado (`clsSAPCheckBox` e `clsSAPRadioButton`):
- `Components/clsSAPCheckBox.cls` — wrapper tipado para `GuiCheckBox`:
  validação de tipo no `Init`, atalhos `Check()`/`Uncheck()`/
  `Toggle()`, `Text`, `Tooltip`, `IsChangeable`, `ToString`,
  `NativeObject` como escape hatch
- `Components/clsSAPRadioButton.cls` — wrapper tipado para
  `GuiRadioButton`: validação de tipo no `Init`, atalho `Select()`,
  mesmos membros comuns de `clsSAPCheckBox`
- `Core/clsSAP.cls` — novos métodos `TypedCheckBox(Id)` e
  `TypedRadioButton(Id)`, análogos aos demais `Typed<X>`
- `Tests/clsFakeGuiCheckBox.cls` e `Tests/clsFakeGuiRadioButton.cls`
  — dubles de teste usados pelos testes de Components
- `Examples/Example_Components_CheckBox.bas` e
  `Examples/Example_Components_RadioButton.bas` — uso de
  `TypedCheckBox`/`TypedRadioButton` em cenários reais de VA02/VA01

Adicionado (`clsSAPComboBox`):
- `Components/clsSAPComboBox.cls` — wrapper tipado para
  `GuiComboBox`: validação de tipo no `Init`, `Key` (let) valida
  `Changeable` e a existência da chave na lista antes de selecionar
  (erro claro listando as chaves válidas em vez do erro críptico de
  COM de "chave inválida"), `HasKey`, `EntryKeys`, `Text`,
  `IsChangeable`, `ToString`, `NativeObject` como escape hatch
- `Core/clsSAP.cls` — novo método `TypedComboBox(Id)`, análogo aos
  demais `Typed<X>`
- `Tests/clsFakeGuiComboBox.cls` e `Tests/clsFakeGuiComboBoxEntry.cls`
  — dubles de teste usados pelos testes de Components
- `Examples/Example_Components_ComboBox.bas` — selecionar por chave
  com validação e tratar erro de chave inválida

Adicionado (`clsSAPStatusBar`):
- `Components/clsSAPStatusBar.cls` — wrapper tipado para
  `GuiStatusbar` (a barra de mensagens do rodapé, `wnd[0]/sbar`):
  validação de tipo no `Init` (nota: o `Type` nativo real é
  `"GuiStatusbar"`, com "b" minúsculo — inconsistência conhecida da
  própria API do SAP, documentada no `Components/README.md`),
  `IsError()`/`IsWarning()`/`IsSuccess()`/`HasMessage()`, `Text`,
  `MessageType`, `ToString`, `NativeObject` como escape hatch.
  Provavelmente o wrapper de maior valor prático entregue até aqui:
  permite checar se uma ação produziu erro/aviso em vez de assumir
  que deu certo
- `Core/clsSAP.cls` — novo método `TypedStatusBar(Id)`, análogo aos
  demais `Typed<X>`
- `Tests/clsFakeGuiStatusBar.cls` — duble de teste usado pelos testes
  de Components
- `Examples/Example_Components_StatusBar.bas` — checar `IsError()`/
  `IsWarning()` após `Execute()` num fluxo de consulta de pedido

Adicionado (`clsSAPTab`):
- `Components/clsSAPTab.cls` — wrapper tipado para `GuiTab`: validação
  de tipo no `Init`, `Select()` com erro padronizado em vez de erro
  cru de COM, `Text`, `Tooltip`, `ToString`, `NativeObject` como
  escape hatch. Nota: `Selected` é somente leitura (diferente de
  `clsSAPCheckBox`/`clsSAPRadioButton`) — a API nativa não permite
  ativar uma aba atribuindo `Selected = True`, só via `Select()`,
  documentado no `Components/README.md`
- `Core/clsSAP.cls` — novo método `TypedTab(Id)`, análogo aos demais
  `Typed<X>`
- `Tests/clsFakeGuiTab.cls` — duble de teste usado pelos testes de
  Components
- `Examples/Example_Components_Tab.bas` — checar `Selected` e navegar
  para uma aba num fluxo de VA02

Adicionado (`clsSAPTable`):
- `Components/clsSAPTable.cls` — wrapper tipado para `GuiTableControl`
  (o "table control" clássico de telas mais antigas de SD/MM):
  validação de tipo no `Init`, validação de índice de linha em todo
  método que recebe `Row`, `GetCellValue`/`SetCellValue` por linha
  ABSOLUTA escondendo a rolagem manual (`VerticalScrollbar.Position`)
  que a API nativa exige para células fora da janela visível
  (diferença importante em relação a `clsSAPGrid`, documentada no
  `Components/README.md`), `SelectRow`/`IsRowSelected`/
  `ClearSelection`, `ColumnTitles`, `RowCount`, `VisibleRowCount`,
  `FirstVisibleRow`, `IsEmpty`, `ToString`, `NativeObject` como escape
  hatch. Identificado como o de maior ganho e também o de maior risco
  de hallucination de API entre os componentes restantes do v0.3 — a
  suposição de que `GetCell` usa linha relativa (não absoluta) não pôde
  ser validada contra uma sessão SAP real neste ambiente de
  desenvolvimento; ver nota de implementação no `Components/README.md`
  e rodar `Test_TypedTable_ComSessaoReal_Integracao` antes de depender
  disso em produção
- `Core/clsSAP.cls` — novo método `TypedTable(Id)`, análogo aos demais
  `Typed<X>`
- `Tests/clsFakeGuiTableControl.cls` (com `clsFakeGuiTableColumn.cls`,
  `clsFakeGuiTableColumns.cls`, `clsFakeGuiTableCell.cls`,
  `clsFakeGuiTableRow.cls` e `clsFakeGuiScrollbar.cls`) — dublês de
  teste usados pelos testes de Components, incluindo simulação do
  comportamento de rolagem
- `Examples/Example_Components_Table.bas` — ler todas as linhas por
  índice absoluto sem se preocupar com rolagem, selecionar linha, erro
  amigável em linha fora do intervalo

Comum:
- `Tests/M_Test_Components.bas` — testes positivo/negativo/erro/
  performance de `clsSAPField`, `clsSAPGrid`, `clsSAPButton`,
  `clsSAPCheckBox`, `clsSAPRadioButton`, `clsSAPComboBox`,
  `clsSAPStatusBar`, `clsSAPTab` e `clsSAPTable`, executáveis sem SAP
  aberto (dubles de teste imitam a interface nativa por late binding);
  testes de integração com sessão real ficam como `Sub` manual
  separada
- `Components/README.md` atualizado com o padrão de design a seguir
  para os próximos wrappers (`clsSAPShell`, `clsSAPTree`, `clsSAPMenu`)

## v0.2 — Core (2026-07-17)

Reescrita completa da camada Core a partir do briefing técnico,
descartando a implementação do kit v0.1 (mantendo apenas a inspiração
arquitetural).

Adicionado:
- `Core/clsSAPException.cls` — erro padronizado do Framework
- `Core/clsSAPConnection.cls` — descoberta e conexão ao SAP GUI
- `Core/clsSAPSession.cls` — encapsulamento de sessão, cache de
  componentes, único ponto autorizado de `FindById`
- `Core/clsSAP.cls` — fachada pública (`Connect`, `Transaction`,
  `Field`, `Execute`, `Back`, `Refresh`, `WaitReady`)
- `Core/M_WinAPI.bas` — declarações Sleep/GetTickCount compatíveis
  32/64 bits
- `Tests/M_Test_Core.bas` — testes positivo/negativo/erro/performance
  do Core
- `Examples/Example_Core_Usage.bas` — exemplo de uso ponta a ponta
- READMEs de todas as camadas (`Core`, `Services`, `Components`,
  `Utils`, `Extensions/SD`, `Tests`, `Examples`) documentando escopo
  atual e planejado
- `CLAUDE.md` — instruções operacionais para o agente de
  desenvolvimento assumir o projeto continuamente

## v0.1 — Kit inicial (pré-existente)

- `clsSAP.cls`, `clsSAPSession.cls`, `clsSAPField.cls`, `M_Test.bas`,
  `FrameworkX_Guia.docx`
- Avaliação: arquitetura 9/10, implementação 2/10 (métodos
  retornando `Nothing`/`False` sem lógica real)
- Descontinuado como código-fonte na v0.2
