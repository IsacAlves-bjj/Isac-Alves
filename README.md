# FrameworkX

Framework VBA para SAP GUI Scripting — plataforma de desenvolvimento
reutilizável para automações SAP em Excel/VBA, no lugar de
`session.FindById(...)` repetido em cada automação.

> Se você é um agente de desenvolvimento (Claude Code ou outro)
> assumindo este projeto, **leia `CLAUDE.md` primeiro**. Este README
> é só a visão rápida para humanos.

## Status

**v0.2 (Core) entregue. v0.3 (Components) em andamento —
`clsSAPField`, `clsSAPGrid`, `clsSAPButton`, `clsSAPCheckBox`,
`clsSAPRadioButton`, `clsSAPComboBox`, `clsSAPStatusBar` e
`clsSAPTab` entregues.** Ver `CLAUDE.md` para o roadmap completo,
`Core/README.md` e `Components/README.md` para o detalhe do que está
pronto.

## Estrutura

```
Core/          camada fundacional (única que fala com FindById)
Services/      Logger, SmartWait, Performance... (v0.5, não iniciado)
Components/    wrappers tipados de campo/grid/tabela... (v0.3, não iniciado)
Utils/         utilitários genéricos (Strings, Datas, Outlook, Excel...)
Extensions/    bibliotecas de domínio (SD, depois MM/FI...)
Tests/         testes por módulo
Examples/      exemplos de uso por módulo
docs/          briefing original e documentação de apoio
```

## Como importar no seu projeto VBA

1. Abra o VBA IDE (`Alt+F11`) no seu `.xlsm`.
2. Clique com o botão direito no Project Explorer > Import File.
3. Importe todos os arquivos `.cls` e `.bas` de `Core/` (e das
   demais camadas conforme forem sendo desenvolvidas).
4. Referencie `Microsoft Scripting Runtime` se ainda não estiver
   marcado (Ferramentas > Referências) — usado no cache interno de
   `clsSAPSession`.
5. Rode `M_Test_Core.RunAllCoreTests` no Immediate Window para
   validar a instalação.

## API rápida (Core, v0.2)

```vba
Dim SAP As New clsSAP
SAP.DebugMode = True   ' opcional, imprime log no Immediate Window

If SAP.Connect() Then
    SAP.Transaction "VA03"
    SAP.Field("wnd[0]/usr/ctxtVBAK-VBELN").Text = "0000012345"
    SAP.Execute
    SAP.WaitReady

    Dim Cliente As String
    Cliente = SAP.Field("wnd[0]/usr/.../txtVBAK-KUNNR").Text

    SAP.Disconnect
End If
```

Veja `Examples/Example_Core_Usage.bas` para o exemplo completo.

## API rápida (Components, v0.3)

`SAP.Field(...)` continua retornando o objeto GUI nativo. Para campos
de texto, `SAP.TypedField(...)` retorna um `clsSAPField` com validação
extra (tipo do componente, campo habilitado antes de escrever):

```vba
Dim Campo As clsSAPField
Set Campo = SAP.TypedField("wnd[0]/usr/ctxtVBAK-VBELN")

If Campo.IsChangeable Then
    Campo.Text = "0000012345"
End If

Debug.Print Campo.IsRequired, Campo.MaxLength, Campo.IsEmpty()
```

Veja `Examples/Example_Components_Field.bas` e `Components/README.md`.

Para grids ALV, `SAP.TypedGrid(...)` retorna um `clsSAPGrid`:

```vba
Dim Grid As clsSAPGrid
Set Grid = SAP.TypedGrid("wnd[0]/usr/cntlGRID1/shellcont/shell")

Dim Pedidos As Collection
Set Pedidos = Grid.GetColumnValues("VBELN")   ' sem loop manual
```

Veja `Examples/Example_Components_Grid.bas`.

Para botões, `SAP.TypedButton(...)` retorna um `clsSAPButton`:

```vba
Dim Botao As clsSAPButton
Set Botao = SAP.TypedButton("wnd[1]/usr/btnSPOP-OPTION1")
Botao.Press
```

Veja `Examples/Example_Components_Button.bas`.

Para caixas de seleção e radio buttons, `SAP.TypedCheckBox(...)`/
`SAP.TypedRadioButton(...)`:

```vba
Dim Bloqueio As clsSAPCheckBox
Set Bloqueio = SAP.TypedCheckBox("wnd[0]/usr/chkVBAK-FAKSK")
If Not Bloqueio.Selected Then Bloqueio.Check
```

Veja `Examples/Example_Components_CheckBox.bas` e
`Examples/Example_Components_RadioButton.bas`.

Para combo boxes, `SAP.TypedComboBox(...)` valida a chave antes de
selecionar:

```vba
Dim TipoOrdem As clsSAPComboBox
Set TipoOrdem = SAP.TypedComboBox("wnd[0]/usr/cmbVBAK-AUART")
If TipoOrdem.HasKey("TA") Then TipoOrdem.Key = "TA"
```

Veja `Examples/Example_Components_ComboBox.bas`.

Para checar se uma ação produziu erro/aviso, `SAP.TypedStatusBar(...)`:

```vba
SAP.Execute
If SAP.TypedStatusBar("wnd[0]/sbar").IsError() Then
    Debug.Print "Falhou: " & SAP.TypedStatusBar("wnd[0]/sbar").Text
End If
```

Veja `Examples/Example_Components_StatusBar.bas`.

Para abas, `SAP.TypedTab(...)` retorna um `clsSAPTab` (`Selected` é
somente leitura; para ativar, use `Select()`):

```vba
Dim AbaDadosGerais As clsSAPTab
Set AbaDadosGerais = SAP.TypedTab("wnd[0]/usr/tabsTS/tabpG1")
If Not AbaDadosGerais.Selected Then AbaDadosGerais.Select
```

Veja `Examples/Example_Components_Tab.bas`.
