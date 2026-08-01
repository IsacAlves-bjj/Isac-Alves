# Components

**Status: v0.3 em andamento — `clsSAPField`, `clsSAPGrid`,
`clsSAPButton`, `clsSAPCheckBox`, `clsSAPRadioButton`,
`clsSAPComboBox`, `clsSAPStatusBar`, `clsSAPTab` e `clsSAPTable`
entregues.**

Wrappers tipados sobre os componentes nativos do SAP GUI Scripting.
Antes desta camada, `clsSAP.Field(...)` retorna o objeto GUI nativo
(o que já funciona, pois `GuiTextField` já tem `.Text`, `GuiButton` já
tem `.Press`, etc.). Esta camada existe para adicionar valor por cima
disso: validação de tipo, mensagens de erro mais claras, atalhos e
comportamento consistente onde o SAP GUI Scripting é inconsistente
entre si (ex.: grids e árvores têm APIs bem mais verbosas que campos
de texto).

`clsSAP.Field(...)` continua existindo e retornando o objeto nativo
— nada foi removido, por compatibilidade com automações já escritas
contra ele. Cada wrapper tipado é acessado por um método novo na
fachada: `clsSAP.TypedField(Id)` devolve um `clsSAPField`,
`clsSAP.TypedGrid(Id)` devolve um `clsSAPGrid`, `clsSAP.TypedButton(Id)`
devolve um `clsSAPButton`, `clsSAP.TypedCheckBox(Id)`/
`clsSAP.TypedRadioButton(Id)` devolvem `clsSAPCheckBox`/
`clsSAPRadioButton`, `clsSAP.TypedComboBox(Id)` devolve um
`clsSAPComboBox`, `clsSAP.TypedStatusBar(Id)` devolve um
`clsSAPStatusBar`, `clsSAP.TypedTab(Id)` devolve um `clsSAPTab`,
`clsSAP.TypedTable(Id)` devolve um `clsSAPTable`.

## `clsSAPField` (entregue)

Wrapper para `GuiTextField` / `GuiCTextField`.

```vba
Dim SAP As New clsSAP
SAP.Connect
SAP.Transaction "VA02"

Dim Campo As clsSAPField
Set Campo = SAP.TypedField("wnd[0]/usr/ctxtVBAK-VBELN")

If Campo.IsChangeable Then
    Campo.Text = "0000012345"
End If

Debug.Print Campo.IsRequired, Campo.MaxLength, Campo.IsEmpty()
```

O que ele adiciona sobre o objeto nativo:
- Valida no `Init` que o componente resolvido é de fato um
  `GuiTextField`/`GuiCTextField`; se o `Id` apontar para outro tipo
  de componente (ex.: um botão), falha imediatamente com
  `clsSAPException` clara, em vez de um comportamento inesperado mais
  adiante no script.
- `Text` (let) valida `Changeable` antes de escrever, convertendo o
  erro críptico de COM de "campo desabilitado" em uma mensagem legível.
- Atalhos: `IsEmpty()`, `Clear()`, `SetFocus()`, `IsChangeable`,
  `IsRequired`, `MaxLength`, `Tooltip`, `ToString()`.
- `NativeObject()` como escape hatch para o objeto GUI cru, quando
  alguma propriedade rara não estiver coberta pelo wrapper.

Ver `Examples/Example_Components_Field.bas` e
`Tests/M_Test_Components.bas`.

## `clsSAPGrid` (entregue)

Wrapper para `GuiGridView` (ALV Grid Control) — o componente mais
verboso via scripting cru e o mais usado em relatórios/listas SD
(VA05, MB51, ME2M...).

```vba
Dim SAP As New clsSAP
SAP.Connect
SAP.Transaction "VA05"
' ... preencher tela de selecao e SAP.Execute antes de acessar a grid ...

Dim Grid As clsSAPGrid
Set Grid = SAP.TypedGrid("wnd[0]/usr/cntlGRID1/shellcont/shell")

Dim Pedidos As Collection
Set Pedidos = Grid.GetColumnValues("VBELN")   ' sem loop manual

If Not Grid.IsEmpty() Then
    Grid.DoubleClickCell 0, "VBELN"           ' abre o 1o documento da lista
End If
```

O que ele adiciona sobre o objeto nativo:
- Valida no `Init` que o componente resolvido é de fato um
  `GuiGridView`; falha imediatamente com `clsSAPException` clara se
  o `Id` apontar para outro tipo de componente.
- Valida o índice de linha em todo método que recebe `Row`
  (`GetCellValue`, `SetCellValue`, `SetCurrentCell`, `SelectRow`,
  `DoubleClickCell`), convertendo o erro críptico de COM de "linha
  fora do intervalo" em uma mensagem legível com o total de linhas.
- `GetColumnValues(ColumnId)` — elimina o loop manual `For i = 0 To
  RowCount - 1 ... GetCellValue` que se repete em praticamente toda
  automação que consolida dados de uma ALV grid.
- Atalhos: `SelectRow`, `SelectAll`, `ClearSelection`, `IsEmpty()`,
  `ColumnIds()`, `ToString()`.
- `NativeObject()` como escape hatch para o objeto GUI cru (ex.: menu
  de contexto, ainda não coberto pelo wrapper).

**Ainda não coberto por esta versão:** menu de contexto
(`SelectContextMenuItem`) e seleção/ordenação de coluna
(`SelectColumn`). Ficam para uma próxima iteração, se o uso real
exigir — mantido fora por enquanto para não adicionar métodos cuja
assinatura exata não pôde ser validada contra uma sessão SAP real
durante o desenvolvimento.

Ver `Examples/Example_Components_Grid.bas` e
`Tests/M_Test_Components.bas`.

## `clsSAPButton` (entregue)

Wrapper para `GuiButton`. Componente simples, mas de altíssimo volume
de uso (confirmar popups, salvar, avançar telas).

```vba
Dim Botao As clsSAPButton
Set Botao = SAP.TypedButton("wnd[1]/usr/btnSPOP-OPTION1")

Debug.Print Botao.Text, Botao.IsDefault
Botao.Press
```

O que ele adiciona sobre o objeto nativo:
- Valida no `Init` que o componente resolvido é de fato um
  `GuiButton`; falha imediatamente com `clsSAPException` clara se o
  `Id` apontar para outro tipo de componente.
- `Press()` com erro padronizado em vez de erro cru de COM (ex.:
  botão desabilitado ou tela já fechada).
- `IsDefault` — reflete `Emphasized`, o botão em destaque que o
  Enter aciona por padrão (útil para confirmar popups genéricos sem
  conhecer o `Id` exato de antemão).

Ver `Examples/Example_Components_Button.bas` e
`Tests/M_Test_Components.bas`.

## `clsSAPCheckBox` e `clsSAPRadioButton` (entregues)

Wrappers para `GuiCheckBox` e `GuiRadioButton`. Praticamente
idênticos em estrutura (ambos giram em torno de uma propriedade
`Selected` booleana), entregues juntos por isso.

```vba
Dim Bloqueio As clsSAPCheckBox
Set Bloqueio = SAP.TypedCheckBox("wnd[0]/usr/chkVBAK-FAKSK")
If Not Bloqueio.Selected Then Bloqueio.Check

Dim OrdemNormal As clsSAPRadioButton
Set OrdemNormal = SAP.TypedRadioButton("wnd[0]/usr/rdoVBAK-AUART_1")
OrdemNormal.Select
```

O que eles adicionam sobre o objeto nativo:
- Valida no `Init` que o componente resolvido é do tipo certo
  (`GuiCheckBox`/`GuiRadioButton`); falha imediatamente com
  `clsSAPException` clara caso contrário.
- `clsSAPCheckBox`: atalhos de intenção clara `Check()`, `Uncheck()`,
  `Toggle()`, em vez de `.Selected = True/False` espalhado pelo
  código.
- `clsSAPRadioButton`: atalho `Select()` (só faz sentido marcar um
  radio button, nunca desmarcar isoladamente — a troca de opção
  dentro do grupo é responsabilidade do próprio SAP).
- Comum aos dois: `Text`, `Tooltip`, `IsChangeable`, `ToString()`,
  `NativeObject()` como escape hatch.

Ver `Examples/Example_Components_CheckBox.bas`,
`Examples/Example_Components_RadioButton.bas` e
`Tests/M_Test_Components.bas`.

## `clsSAPComboBox` (entregue)

Wrapper para `GuiComboBox`.

```vba
Dim TipoOrdem As clsSAPComboBox
Set TipoOrdem = SAP.TypedComboBox("wnd[0]/usr/cmbVBAK-AUART")

Debug.Print TipoOrdem.Key, TipoOrdem.Text

If TipoOrdem.HasKey("TA") Then
    TipoOrdem.Key = "TA"
End If
```

O que ele adiciona sobre o objeto nativo:
- Valida no `Init` que o componente resolvido é de fato um
  `GuiComboBox`; falha imediatamente com `clsSAPException` clara se
  o `Id` apontar para outro tipo de componente.
- `Key` (let) valida `Changeable` e a existência da chave na lista
  antes de selecionar, convertendo o erro críptico de COM de "chave
  inválida" em uma mensagem clara que lista as chaves válidas.
- `HasKey(Key)` — verifica a existência de uma chave antes de
  atribuir, sem precisar descobrir via exceção.
- `EntryKeys()` — todas as chaves válidas da lista, na ordem nativa.
- `Text`, `IsChangeable`, `ToString()`, `NativeObject()` como escape
  hatch.

Ver `Examples/Example_Components_ComboBox.bas` e
`Tests/M_Test_Components.bas`.

## `clsSAPStatusBar` (entregue)

Wrapper para `GuiStatusbar` (a barra de mensagens no rodapé,
`wnd[0]/sbar`). Provavelmente o wrapper de maior valor prático para
automações robustas: permite checar se uma ação produziu erro/aviso
em vez de assumir que deu certo.

```vba
SAP.Execute

Dim StatusBar As clsSAPStatusBar
Set StatusBar = SAP.TypedStatusBar("wnd[0]/sbar")

If StatusBar.IsError() Then
    Debug.Print "Falhou: " & StatusBar.Text
    Exit Sub
End If
```

O que ele adiciona sobre o objeto nativo:
- Valida no `Init` que o componente resolvido é de fato uma
  `GuiStatusbar`.
- `IsError()`, `IsWarning()`, `IsSuccess()`, `HasMessage()` — em vez
  de comparar `MessageType` manualmente contra `"E"`/`"W"`/`"S"` pelo
  código todo.
- `Text`, `MessageType` (cru), `ToString()`, `NativeObject()` como
  escape hatch.

**Nota de implementação importante:** diferente dos demais
componentes (que seguem PascalCase — `GuiTextField`, `GuiButton`...),
o `Type` nativo da barra de status é `"GuiStatusbar"` (com "b"
minúsculo) — uma inconsistência conhecida da própria API do SAP, não
um erro de digitação neste wrapper. Se a validação de tipo falhar
inesperadamente no seu ambiente, confirme o `Type` exato via
`NativeObject().Type` antes de reportar bug — é justamente o tipo de
detalhe que só se confirma com 100% de certeza contra uma sessão SAP
real, o que recomendo fazer via
`Test_TypedStatusBar_ComSessaoReal_Integracao` antes de depender
disso em produção.

**Ainda não coberto por esta versão:** `MessageId`/`MessageNumber`/
`MessageParameter1..4` (úteis para identificar uma mensagem
específica de forma programática, ex.: "é exatamente a mensagem
V4 042?"). Ficam para uma próxima iteração — use `NativeObject()`
enquanto isso.

Ver `Examples/Example_Components_StatusBar.bas` e
`Tests/M_Test_Components.bas`.

## `clsSAPTab` (entregue)

Wrapper para `GuiTab` (uma aba individual dentro de um
`GuiTabStrip`). Alternativa mais simples entre os componentes
restantes do v0.3, escolhida como próximo passo por ter menor risco
de hallucination de API do que `clsSAPTable`.

```vba
Dim SAP As New clsSAP
SAP.Connect
SAP.Transaction "VA02"

Dim AbaDadosGerais As clsSAPTab
Set AbaDadosGerais = SAP.TypedTab("wnd[0]/usr/tabsTAXI_TABSTRIP_OVERVIEW/tabpG1")

If Not AbaDadosGerais.Selected Then
    AbaDadosGerais.Select
End If
```

O que ele adiciona sobre o objeto nativo:
- Valida no `Init` que o componente resolvido é de fato um `GuiTab`;
  falha imediatamente com `clsSAPException` clara se o `Id` apontar
  para outro tipo de componente.
- `Select()` com erro padronizado em vez de erro cru de COM (ex.: aba
  desabilitada na tela atual).
- `Text`, `Tooltip`, `ToString()`, `NativeObject()` como escape hatch.

**Nota de implementação importante:** diferente de `clsSAPCheckBox`/
`clsSAPRadioButton`, aqui `Selected` é **somente leitura** — reflete
se esta é a aba atualmente ativa, mas a API nativa do SAP GUI
Scripting não permite ativar uma aba atribuindo `Selected = True`.
Para ativar, use `Select()`, que chama o método nativo `GuiTab.Select`
(não uma property let). Como já feito com `clsSAPGrid`/
`clsSAPStatusBar`, confirme esse comportamento contra uma sessão SAP
real via `Test_TypedTab_ComSessaoReal_Integracao` antes de depender
disso em produção.

Ver `Examples/Example_Components_Tab.bas` e
`Tests/M_Test_Components.bas`.

## `clsSAPTable` (entregue)

Wrapper para `GuiTableControl` — o "table control" clássico usado em
telas mais antigas de SD/MM (ex.: algumas variantes de overview de
itens em VA01/VA02, condições em VK11/VK12). Identificado no
`Components/README.md` anterior como o de maior ganho entre os
componentes restantes do v0.3 — mas também o de maior risco, pelos
motivos abaixo.

```vba
Dim SAP As New clsSAP
SAP.Connect
SAP.Transaction "VA02"

Dim Tabela As clsSAPTable
Set Tabela = SAP.TypedTable("wnd[0]/usr/tblSAPMV45ATCTRL_U_ERF_AUFTRAG")

Dim i As Long
For i = 0 To Tabela.RowCount - 1
    Debug.Print Tabela.GetCellValue(i, 0)   ' linha ABSOLUTA, sem se preocupar com rolagem
Next i
```

O que ele adiciona sobre o objeto nativo:
- Valida no `Init` que o componente resolvido é de fato um
  `GuiTableControl`; falha imediatamente com `clsSAPException` clara
  se o `Id` apontar para outro tipo de componente.
- Valida o índice de linha em todo método que recebe `Row`
  (`GetCellValue`, `SetCellValue`, `SelectRow`, `IsRowSelected`),
  convertendo o erro críptico de COM de "linha fora do intervalo" em
  uma mensagem legível com o total de linhas.
- `GetCellValue`/`SetCellValue` recebem sempre a linha **absoluta**
  (0 a `RowCount - 1`) e escondem a rolagem manual que a API nativa
  exige — ver nota de implementação abaixo. Sem o wrapper, cada
  automação teria que calcular `VerticalScrollbar.Position` e a linha
  relativa antes de toda leitura/escrita fora da janela visível.
- `SelectRow`/`IsRowSelected`/`ClearSelection` — seleção por linha
  absoluta via `GetAbsoluteRow`, que (diferente de `GetCell`) já
  trabalha com índice absoluto na API nativa.
- `ColumnTitles()` — títulos de exibição das colunas, na ordem
  nativa. Diferente de `clsSAPGrid.ColumnIds()`, aqui não existe um
  nome técnico de coluna — o acesso à célula é sempre por **índice**
  (0-based), não por string.
- `RowCount`, `VisibleRowCount`, `FirstVisibleRow`, `IsEmpty()`,
  `ToString()`, `NativeObject()` como escape hatch.

**Nota de implementação importante — risco de hallucination de API:**
diferente de `GuiGridView.GetCellValue`, que aceita a linha absoluta
da grid inteira, o método nativo `GuiTableControl.GetCell(Row, Col)`
só aceita a linha **relativa à janela atualmente visível** (0 a
`VisibleRowCount - 1`). É a mesma dor de `clsSAPGrid`, só que pior,
porque exige rolar a tabela manualmente (`VerticalScrollbar.Position`)
antes de ler ou escrever uma célula fora da janela visível — o motivo
pelo qual este wrapper foi cotado como o de maior risco de
hallucination entre os componentes restantes do v0.3. A implementação
atual (`ScrollToRow` interno) foi escrita a partir da API documentada
do SAP GUI Scripting, mas **não pôde ser validada contra uma sessão
SAP real neste ambiente de desenvolvimento**. Antes de depender disso
em produção, rode
`Test_TypedTable_ComSessaoReal_Integracao` (`Tests/M_Test_Components.bas`)
contra uma tela real com table control e confirme especialmente:
1. Se `GetCell` realmente espera linha relativa à visível (não
   absoluta);
2. Se `VerticalScrollbar.Position` aceita atribuição direta e reflete
   a rolagem imediatamente na leitura seguinte;
3. Se `Columns(i).Title` retorna o título de exibição esperado.

Como já feito com `clsSAPGrid`/`clsSAPStatusBar`/`clsSAPTab`, trate
qualquer divergência encontrada como prioridade antes de usar
`clsSAPTable` em automação de produção.

**Ainda não coberto por esta versão:** navegação de cursor
(`CurrentCol`/`CurrentRow`), rolagem horizontal
(`HorizontalScrollbar`) e seleção múltipla em lote (a API nativa do
table control clássico não expõe um `SelectAll` como
`GuiGridView.SelectAll` — `ClearSelection` percorre linha a linha).
Ficam para uma próxima iteração, se o uso real exigir.

Ver `Examples/Example_Components_Table.bas` e
`Tests/M_Test_Components.bas`.

## Classes previstas (restante do v0.3)

| Classe | Componente SAP GUI equivalente | Status |
|---|---|---|
| `clsSAPField` | `GuiTextField`, `GuiCTextField` | **Entregue** |
| `clsSAPGrid` | `GuiGridView` | **Entregue** |
| `clsSAPButton` | `GuiButton` | **Entregue** |
| `clsSAPCheckBox` | `GuiCheckBox` | **Entregue** |
| `clsSAPRadioButton` | `GuiRadioButton` | **Entregue** |
| `clsSAPComboBox` | `GuiComboBox` | **Entregue** |
| `clsSAPStatusBar` | `GuiStatusbar` | **Entregue** |
| `clsSAPTab` | `GuiTab` | **Entregue** |
| `clsSAPTable` | `GuiTableControl` | **Entregue (aguarda validação contra sessão SAP real — ver nota acima)** |
| `clsSAPShell` | `GuiShell` | Não iniciado |
| `clsSAPTree` | `GuiTree` | Não iniciado |
| `clsSAPMenu` | `GuiMenu` | Não iniciado |

## Diretriz de design

Cada wrapper deve:
1. Receber o componente nativo já resolvido por `clsSAPSession.GetComponent`
   (na prática, via `clsSAP.Typed<Componente>(Id)` — ver `TypedField`,
   `TypedGrid`, `TypedButton`, `TypedCheckBox`, `TypedRadioButton`,
   `TypedComboBox`, `TypedStatusBar`, `TypedTab` e `TypedTable` como
   referência de padrão a seguir para os próximos).
2. Validar o `Type` do componente nativo antes de expor métodos (ex.: `clsSAPGrid` deve confirmar que o objeto é de fato um `GuiGridView` e lançar `clsSAPException` clara se não for).
3. Nunca chamar `FindById` diretamente — sempre receber o objeto já resolvido pelo Core.
4. Converter todo erro para `clsSAPException` em todo método público (mesmo padrão do Core: `Init` recebe `Number`/`Description`/`ClassName`/`MethodName`/`FieldId`).
