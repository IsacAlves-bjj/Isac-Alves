Attribute VB_Name = "M_Test_Components"
Option Explicit

'==========================================================
' M_Test_Components
' Testes de Components (v0.3). Cobrem os quatro tipos exigidos
' pelo briefing: positivo, negativo, de erro e de performance.
'
' Ao contrario de M_Test_Core, a maioria destes testes NAO depende
' de uma sessao SAP real: clsSAPField, clsSAPGrid, clsSAPButton,
' clsSAPCheckBox, clsSAPRadioButton, clsSAPComboBox,
' clsSAPStatusBar e clsSAPTab acessam seu componente nativo por late
' binding (As Object), entao dubles de teste (clsFakeGuiTextField,
' clsFakeGuiGridView, clsFakeGuiButton, clsFakeGuiCheckBox,
' clsFakeGuiRadioButton, clsFakeGuiComboBox, clsFakeGuiStatusBar,
' clsFakeGuiTab) que imitam a interface nativa sao suficientes para
' validar toda a logica dos wrappers. Isso os torna rapidos e
' executaveis em qualquer maquina, com ou sem SAP aberto.
'
' Excecao: os testes Test_Typed<X>_ComSessaoReal_Integracao, que
' validam a integracao real clsSAP.Typed... -> clsSAPSession.
' GetComponent -> wrapper contra uma tela SAP de verdade. Ficam de
' fora de RunAllComponentsTests (dependem de estado externo: sessao
' conectada e Id valido para o ambiente).
'==========================================================

Public Sub RunAllComponentsTests()
    Debug.Print String(60, "=")
    Debug.Print "FrameworkX - Testes de Components - " & Now
    Debug.Print String(60, "=")

    Test_Field_Init_Positivo
    Test_Field_Init_TipoInvalido_Negativo
    Test_Field_Init_ComponenteNulo_Negativo
    Test_Field_TextGet_Positivo
    Test_Field_TextLet_Positivo
    Test_Field_TextLet_CampoDesabilitado_Erro
    Test_Field_IsEmpty_Positivo
    Test_Field_Clear_Positivo
    Test_Field_PropriedadesAuxiliares_Positivo
    Test_Field_SetFocus_Positivo
    Test_Field_ToString_Positivo
    Test_Field_Performance_OverheadDoWrapper

    Test_Grid_Init_Positivo
    Test_Grid_Init_TipoInvalido_Negativo
    Test_Grid_Init_ComponenteNulo_Negativo
    Test_Grid_RowCount_ColumnCount_Positivo
    Test_Grid_GetCellValue_Positivo
    Test_Grid_GetCellValue_LinhaForaDoIntervalo_Erro
    Test_Grid_SetCellValue_Positivo
    Test_Grid_SetCellValue_LinhaForaDoIntervalo_Erro
    Test_Grid_GetColumnValues_Positivo
    Test_Grid_SelectRow_Positivo
    Test_Grid_SelectRow_ForaDoIntervalo_Erro
    Test_Grid_ClearSelection_Positivo
    Test_Grid_SelectAll_Positivo
    Test_Grid_SetCurrentCell_Positivo
    Test_Grid_DoubleClickCell_Positivo
    Test_Grid_PressToolbarButton_Positivo
    Test_Grid_IsEmpty_Positivo
    Test_Grid_ToString_Positivo
    Test_Grid_Performance_GetColumnValues

    Test_Button_Init_Positivo
    Test_Button_Init_TipoInvalido_Negativo
    Test_Button_Init_ComponenteNulo_Negativo
    Test_Button_Text_Tooltip_IsDefault_Positivo
    Test_Button_Press_Positivo
    Test_Button_Press_Erro
    Test_Button_ToString_Positivo

    Test_CheckBox_Init_Positivo
    Test_CheckBox_Init_TipoInvalido_Negativo
    Test_CheckBox_Init_ComponenteNulo_Negativo
    Test_CheckBox_Selected_Positivo
    Test_CheckBox_CheckUncheckToggle_Positivo
    Test_CheckBox_Selected_Erro
    Test_CheckBox_ToString_Positivo

    Test_RadioButton_Init_Positivo
    Test_RadioButton_Init_TipoInvalido_Negativo
    Test_RadioButton_Init_ComponenteNulo_Negativo
    Test_RadioButton_Selected_Positivo
    Test_RadioButton_Select_Positivo
    Test_RadioButton_Selected_Erro
    Test_RadioButton_ToString_Positivo

    Test_ComboBox_Init_Positivo
    Test_ComboBox_Init_TipoInvalido_Negativo
    Test_ComboBox_Init_ComponenteNulo_Negativo
    Test_ComboBox_Key_Get_Positivo
    Test_ComboBox_Key_Let_Positivo
    Test_ComboBox_Key_Let_ChaveInvalida_Erro
    Test_ComboBox_Key_Let_Desabilitado_Erro
    Test_ComboBox_HasKey_Positivo
    Test_ComboBox_EntryKeys_Positivo
    Test_ComboBox_ToString_Positivo

    Test_StatusBar_Init_Positivo
    Test_StatusBar_Init_TipoInvalido_Negativo
    Test_StatusBar_Init_ComponenteNulo_Negativo
    Test_StatusBar_SemMensagem_Positivo
    Test_StatusBar_IsError_Positivo
    Test_StatusBar_IsWarning_Positivo
    Test_StatusBar_IsSuccess_Positivo
    Test_StatusBar_ToString_Positivo

    Test_Tab_Init_Positivo
    Test_Tab_Init_TipoInvalido_Negativo
    Test_Tab_Init_ComponenteNulo_Negativo
    Test_Tab_Selected_Positivo
    Test_Tab_Select_Positivo
    Test_Tab_Select_Erro
    Test_Tab_ToString_Positivo

    Debug.Print String(60, "=")
    Debug.Print "Testes concluidos. Verifique [FAIL] acima, se houver."
    Debug.Print String(60, "=")
End Sub

' ---- Teste positivo: Init aceita GuiTextField e GuiCTextField ----
Private Sub Test_Field_Init_Positivo()
    Dim fake As New clsFakeGuiTextField
    fake.Type = "GuiTextField"
    fake.Text = "0000012345"

    Dim fld As New clsSAPField
    fld.Init fake, "wnd[0]/usr/ctxtVBAK-VBELN"

    Assert fld.Id = "wnd[0]/usr/ctxtVBAK-VBELN", "Init/Id armazena o FieldId informado"
    Assert fld.Text = "0000012345", "Init aceita GuiTextField e expoe o Text nativo"

    Dim fakeC As New clsFakeGuiTextField
    fakeC.Type = "GuiCTextField"
    Dim fldC As New clsSAPField
    fldC.Init fakeC, "wnd[0]/usr/ctxtVBAP-MATNR"
    Assert fldC.Id = "wnd[0]/usr/ctxtVBAP-MATNR", "Init tambem aceita GuiCTextField"
End Sub

' ---- Teste negativo: Init deve recusar tipos incompativeis (ex.: botao) ----
Private Sub Test_Field_Init_TipoInvalido_Negativo()
    Dim fake As New clsFakeGuiTextField
    fake.Type = "GuiButton"

    Dim fld As New clsSAPField
    On Error Resume Next
    fld.Init fake, "wnd[0]/tbar[1]/btn[0]"
    Assert Err.Number <> 0, "Init deve falhar para componente que nao e campo de texto"
    On Error GoTo 0
End Sub

' ---- Teste negativo: Init deve recusar componente nulo ----
Private Sub Test_Field_Init_ComponenteNulo_Negativo()
    Dim fld As New clsSAPField
    On Error Resume Next
    fld.Init Nothing, "wnd[0]/usr/campo"
    Assert Err.Number <> 0, "Init deve falhar quando o componente nativo e Nothing"
    On Error GoTo 0
End Sub

' ---- Teste positivo: Text (get) reflete o valor nativo ----
Private Sub Test_Field_TextGet_Positivo()
    Dim fake As New clsFakeGuiTextField
    fake.Text = "Valor Nativo"

    Dim fld As New clsSAPField
    fld.Init fake, "campo1"

    Assert fld.Text = "Valor Nativo", "Text (get) reflete o valor do componente nativo"
End Sub

' ---- Teste positivo: Text (let) escreve no componente nativo quando habilitado ----
Private Sub Test_Field_TextLet_Positivo()
    Dim fake As New clsFakeGuiTextField
    fake.Changeable = True

    Dim fld As New clsSAPField
    fld.Init fake, "campo1"
    fld.Text = "Novo Valor"

    Assert fake.Text = "Novo Valor", "Text (let) grava no componente nativo quando Changeable=True"
End Sub

' ---- Teste de erro: escrever em campo desabilitado deve virar clsSAPException,
'      nunca deixar o codigo prosseguir silenciosamente ----
Private Sub Test_Field_TextLet_CampoDesabilitado_Erro()
    Dim fake As New clsFakeGuiTextField
    fake.Changeable = False

    Dim fld As New clsSAPField
    fld.Init fake, "campo1"

    On Error Resume Next
    fld.Text = "Nao deveria gravar"
    Assert Err.Number <> 0, "Text (let) deve falhar de forma controlada em campo desabilitado"
    On Error GoTo 0

    Assert fake.Text <> "Nao deveria gravar", "Valor nao deve ser gravado no nativo quando desabilitado"
End Sub

' ---- Teste positivo: IsEmpty ----
Private Sub Test_Field_IsEmpty_Positivo()
    Dim fake As New clsFakeGuiTextField
    fake.Text = "   "

    Dim fld As New clsSAPField
    fld.Init fake, "campo1"

    Assert fld.IsEmpty() = True, "IsEmpty deve considerar string so com espacos como vazia"

    fake.Text = "X"
    Assert fld.IsEmpty() = False, "IsEmpty deve ser False quando ha conteudo"
End Sub

' ---- Teste positivo: Clear ----
Private Sub Test_Field_Clear_Positivo()
    Dim fake As New clsFakeGuiTextField
    fake.Changeable = True
    fake.Text = "Algo"

    Dim fld As New clsSAPField
    fld.Init fake, "campo1"
    fld.Clear

    Assert fake.Text = "", "Clear deve limpar o texto no componente nativo"
End Sub

' ---- Teste positivo: IsChangeable, IsRequired, MaxLength, Tooltip ----
Private Sub Test_Field_PropriedadesAuxiliares_Positivo()
    Dim fake As New clsFakeGuiTextField
    fake.Changeable = False
    fake.Required = True
    fake.MaxLength = 10
    fake.Tooltip = "Numero do pedido"

    Dim fld As New clsSAPField
    fld.Init fake, "campo1"

    Assert fld.IsChangeable = False, "IsChangeable reflete o nativo"
    Assert fld.IsRequired = True, "IsRequired reflete o nativo"
    Assert fld.MaxLength = 10, "MaxLength reflete o nativo"
    Assert fld.Tooltip = "Numero do pedido", "Tooltip reflete o nativo"
End Sub

' ---- Teste positivo: SetFocus repassa a chamada ao nativo ----
Private Sub Test_Field_SetFocus_Positivo()
    Dim fake As New clsFakeGuiTextField
    Dim fld As New clsSAPField
    fld.Init fake, "campo1"

    fld.SetFocus

    Assert fake.SetFocusCalls = 1, "SetFocus deve repassar a chamada ao componente nativo"
End Sub

' ---- Teste positivo: ToString contem Id e Text ----
Private Sub Test_Field_ToString_Positivo()
    Dim fake As New clsFakeGuiTextField
    fake.Text = "ABC"

    Dim fld As New clsSAPField
    fld.Init fake, "wnd[0]/usr/campoX"

    Dim s As String
    s = fld.ToString()

    Assert InStr(s, "wnd[0]/usr/campoX") > 0, "ToString contem o Id do campo"
    Assert InStr(s, "ABC") > 0, "ToString contem o Text atual"
End Sub

' ---- Teste de performance: o overhead do wrapper sobre o acesso
'      nativo deve ser irrelevante (nao deve degradar por ordens de
'      grandeza). Limite generoso para evitar falso-negativo em
'      maquinas lentas - o objetivo e pegar regressao grave, nao
'      microbenchmark preciso. ----
Private Sub Test_Field_Performance_OverheadDoWrapper()
    Const ITER As Long = 2000

    Dim fake As New clsFakeGuiTextField
    fake.Text = "X"

    Dim fld As New clsSAPField
    fld.Init fake, "campo1"

    Dim i As Long, tmp As String
    Dim t0 As Long, t1 As Long, t2 As Long

    t0 = GetTickCount()
    For i = 1 To ITER
        tmp = fake.Text
    Next i
    t1 = GetTickCount()

    For i = 1 To ITER
        tmp = fld.Text
    Next i
    t2 = GetTickCount()

    Dim nativeMs As Long, wrapperMs As Long
    nativeMs = t1 - t0
    wrapperMs = t2 - t1

    Debug.Print "  Acesso nativo (" & ITER & "x): " & nativeMs & " ms"
    Debug.Print "  Acesso via clsSAPField (" & ITER & "x): " & wrapperMs & " ms"

    Assert wrapperMs <= (nativeMs + 200) * 10, "Overhead do wrapper deve ser proximo do nativo, nao ordens de grandeza maior"
End Sub

' ---- Teste de integracao com SAP real: clsSAP.TypedField ponta a
'      ponta. Requer sessao ja conectada e um Id valido para o
'      ambiente de teste; por depender de estado externo, nao entra
'      em RunAllComponentsTests - chame manualmente. ----
Public Sub Test_TypedField_ComSessaoReal_Integracao(ByVal SAP As clsSAP, ByVal FieldId As String)
    Dim fld As clsSAPField
    Set fld = SAP.TypedField(FieldId)

    Assert Not fld Is Nothing, "TypedField deve retornar um clsSAPField valido"
    Assert fld.Id = FieldId, "TypedField.Id deve ser o Id informado"
    Debug.Print "  Text atual: '" & fld.Text & "' | Changeable=" & fld.IsChangeable & " | Required=" & fld.IsRequired
End Sub

' ================== clsSAPGrid ==================
' clsFakeGuiGridView vem pre-carregado com 3 linhas x colunas
' MATNR/MENGE (MAT-001/10, MAT-002/20, MAT-003/30) - ver
' Tests/clsFakeGuiGridView.cls.

' ---- Teste positivo: Init aceita GuiGridView ----
Private Sub Test_Grid_Init_Positivo()
    Dim fake As New clsFakeGuiGridView

    Dim grid As New clsSAPGrid
    grid.Init fake, "wnd[0]/usr/cntlGRID/shellcont/shell"

    Assert grid.Id = "wnd[0]/usr/cntlGRID/shellcont/shell", "Init/Id armazena o FieldId informado"
End Sub

' ---- Teste negativo: Init deve recusar tipos incompativeis ----
Private Sub Test_Grid_Init_TipoInvalido_Negativo()
    Dim fake As New clsFakeGuiGridView
    fake.Type = "GuiTextField"

    Dim grid As New clsSAPGrid
    On Error Resume Next
    grid.Init fake, "wnd[0]/usr/campo"
    Assert Err.Number <> 0, "Init deve falhar para componente que nao e GuiGridView"
    On Error GoTo 0
End Sub

' ---- Teste negativo: Init deve recusar componente nulo ----
Private Sub Test_Grid_Init_ComponenteNulo_Negativo()
    Dim grid As New clsSAPGrid
    On Error Resume Next
    grid.Init Nothing, "wnd[0]/usr/grid"
    Assert Err.Number <> 0, "Init deve falhar quando o componente nativo e Nothing"
    On Error GoTo 0
End Sub

' ---- Teste positivo: RowCount e ColumnCount refletem o nativo ----
Private Sub Test_Grid_RowCount_ColumnCount_Positivo()
    Dim fake As New clsFakeGuiGridView
    Dim grid As New clsSAPGrid
    grid.Init fake, "grid1"

    Assert grid.RowCount = 3, "RowCount deve refletir o nativo (3 linhas de teste)"
    Assert grid.ColumnCount = 2, "ColumnCount deve refletir o nativo (2 colunas de teste)"
End Sub

' ---- Teste positivo: GetCellValue le o valor correto ----
Private Sub Test_Grid_GetCellValue_Positivo()
    Dim fake As New clsFakeGuiGridView
    Dim grid As New clsSAPGrid
    grid.Init fake, "grid1"

    Assert grid.GetCellValue(0, "MATNR") = "MAT-001", "GetCellValue deve ler o valor nativo da linha/coluna"
    Assert grid.GetCellValue(2, "MENGE") = "30", "GetCellValue deve ler valores de linhas diferentes"
End Sub

' ---- Teste de erro: linha fora do intervalo deve virar clsSAPException,
'      nunca deixar o codigo prosseguir silenciosamente nem estourar
'      erro cru de COM ----
Private Sub Test_Grid_GetCellValue_LinhaForaDoIntervalo_Erro()
    Dim fake As New clsFakeGuiGridView
    Dim grid As New clsSAPGrid
    grid.Init fake, "grid1"

    On Error Resume Next
    Dim v As String
    v = grid.GetCellValue(99, "MATNR")
    Assert Err.Number <> 0, "GetCellValue deve falhar de forma controlada para linha fora do intervalo"
    On Error GoTo 0
End Sub

' ---- Teste positivo: SetCellValue grava no componente nativo ----
Private Sub Test_Grid_SetCellValue_Positivo()
    Dim fake As New clsFakeGuiGridView
    Dim grid As New clsSAPGrid
    grid.Init fake, "grid1"

    grid.SetCellValue 1, "MENGE", "999"

    Assert fake.GetCellValue(1, "MENGE") = "999", "SetCellValue deve gravar o valor no nativo (via ModifyCell)"
End Sub

' ---- Teste de erro: SetCellValue tambem valida o intervalo de linha ----
Private Sub Test_Grid_SetCellValue_LinhaForaDoIntervalo_Erro()
    Dim fake As New clsFakeGuiGridView
    Dim grid As New clsSAPGrid
    grid.Init fake, "grid1"

    On Error Resume Next
    grid.SetCellValue 99, "MENGE", "1"
    Assert Err.Number <> 0, "SetCellValue deve falhar de forma controlada para linha fora do intervalo"
    On Error GoTo 0
End Sub

' ---- Teste positivo: GetColumnValues le a coluna inteira, elimina
'      o loop manual que o usuario teria que escrever ----
Private Sub Test_Grid_GetColumnValues_Positivo()
    Dim fake As New clsFakeGuiGridView
    Dim grid As New clsSAPGrid
    grid.Init fake, "grid1"

    Dim valores As Collection
    Set valores = grid.GetColumnValues("MATNR")

    Assert valores.Count = 3, "GetColumnValues deve retornar uma entrada por linha"
    Assert valores(1) = "MAT-001", "GetColumnValues deve preservar a ordem das linhas (1a posicao)"
    Assert valores(3) = "MAT-003", "GetColumnValues deve preservar a ordem das linhas (ultima posicao)"
End Sub

' ---- Teste positivo: SelectRow seleciona a linha no nativo ----
Private Sub Test_Grid_SelectRow_Positivo()
    Dim fake As New clsFakeGuiGridView
    Dim grid As New clsSAPGrid
    grid.Init fake, "grid1"

    grid.SelectRow 2

    Assert fake.SelectedRows = "2", "SelectRow deve gravar a linha como SelectedRows no nativo"
End Sub

' ---- Teste de erro: SelectRow tambem valida o intervalo de linha ----
Private Sub Test_Grid_SelectRow_ForaDoIntervalo_Erro()
    Dim fake As New clsFakeGuiGridView
    Dim grid As New clsSAPGrid
    grid.Init fake, "grid1"

    On Error Resume Next
    grid.SelectRow 50
    Assert Err.Number <> 0, "SelectRow deve falhar de forma controlada para linha fora do intervalo"
    On Error GoTo 0
End Sub

' ---- Teste positivo: ClearSelection limpa SelectedRows no nativo ----
Private Sub Test_Grid_ClearSelection_Positivo()
    Dim fake As New clsFakeGuiGridView
    fake.SelectedRows = "0,1,2"

    Dim grid As New clsSAPGrid
    grid.Init fake, "grid1"
    grid.ClearSelection

    Assert fake.SelectedRows = "", "ClearSelection deve limpar SelectedRows no nativo"
End Sub

' ---- Teste positivo: SelectAll repassa a chamada ao nativo ----
Private Sub Test_Grid_SelectAll_Positivo()
    Dim fake As New clsFakeGuiGridView
    Dim grid As New clsSAPGrid
    grid.Init fake, "grid1"

    grid.SelectAll

    Assert fake.SelectAllCalls = 1, "SelectAll deve repassar a chamada ao componente nativo"
End Sub

' ---- Teste positivo: SetCurrentCell atualiza CurrentCellRow/Column ----
Private Sub Test_Grid_SetCurrentCell_Positivo()
    Dim fake As New clsFakeGuiGridView
    Dim grid As New clsSAPGrid
    grid.Init fake, "grid1"

    grid.SetCurrentCell 1, "MENGE"

    Assert grid.CurrentCellRow = 1, "SetCurrentCell deve atualizar CurrentCellRow no nativo"
    Assert grid.CurrentCellColumn = "MENGE", "SetCurrentCell deve atualizar CurrentCellColumn no nativo"
End Sub

' ---- Teste positivo: DoubleClickCell posiciona a celula e da duplo-clique ----
Private Sub Test_Grid_DoubleClickCell_Positivo()
    Dim fake As New clsFakeGuiGridView
    Dim grid As New clsSAPGrid
    grid.Init fake, "grid1"

    grid.DoubleClickCell 2, "MATNR"

    Assert fake.CurrentCellRow = 2, "DoubleClickCell deve posicionar a celula atual antes do duplo-clique"
    Assert fake.DoubleClickCalls = 1, "DoubleClickCell deve repassar o duplo-clique ao nativo"
End Sub

' ---- Teste positivo: PressToolbarButton repassa o Id ao nativo ----
Private Sub Test_Grid_PressToolbarButton_Positivo()
    Dim fake As New clsFakeGuiGridView
    Dim grid As New clsSAPGrid
    grid.Init fake, "grid1"

    grid.PressToolbarButton "&REFRESH"

    Assert fake.LastToolbarButton = "&REFRESH", "PressToolbarButton deve repassar o Id do botao ao nativo"
End Sub

' ---- Teste positivo: IsEmpty reflete RowCount = 0 ----
Private Sub Test_Grid_IsEmpty_Positivo()
    Dim fake As New clsFakeGuiGridView
    Dim grid As New clsSAPGrid
    grid.Init fake, "grid1"

    Assert grid.IsEmpty() = False, "IsEmpty deve ser False quando ha linhas (3 na fixture)"

    fake.RowCount = 0
    Assert grid.IsEmpty() = True, "IsEmpty deve ser True quando RowCount = 0"
End Sub

' ---- Teste positivo: ToString contem Id e RowCount ----
Private Sub Test_Grid_ToString_Positivo()
    Dim fake As New clsFakeGuiGridView
    Dim grid As New clsSAPGrid
    grid.Init fake, "wnd[0]/usr/cntlGRID/shellcont/shell"

    Dim s As String
    s = grid.ToString()

    Assert InStr(s, "wnd[0]/usr/cntlGRID/shellcont/shell") > 0, "ToString contem o Id da grid"
    Assert InStr(s, "3") > 0, "ToString contem o RowCount atual"
End Sub

' ---- Teste de performance: GetColumnValues sobre uma grid maior nao
'      deve degradar de forma anormal (limite generoso, o objetivo e
'      pegar regressao grave, nao microbenchmark preciso). ----
Private Sub Test_Grid_Performance_GetColumnValues()
    Const ROWS As Long = 500

    Dim fake As New clsFakeGuiGridView
    fake.RowCount = ROWS

    Dim grid As New clsSAPGrid
    grid.Init fake, "grid1"

    Dim t0 As Long, t1 As Long
    t0 = GetTickCount()

    Dim valores As Collection
    Set valores = grid.GetColumnValues("MATNR")

    t1 = GetTickCount()

    Debug.Print "  GetColumnValues em grid de " & ROWS & " linhas: " & (t1 - t0) & " ms"

    Assert valores.Count = ROWS, "GetColumnValues deve retornar uma entrada por linha mesmo em grid maior"
    Assert (t1 - t0) < 5000, "GetColumnValues nao deve degradar de forma anormal em grid de " & ROWS & " linhas"
End Sub

' ---- Teste de integracao com SAP real: clsSAP.TypedGrid ponta a
'      ponta. Requer sessao ja conectada e um Id de grid valido para
'      o ambiente de teste (ex.: uma ALV da VA05); por depender de
'      estado externo, nao entra em RunAllComponentsTests - chame
'      manualmente. ----
Public Sub Test_TypedGrid_ComSessaoReal_Integracao(ByVal SAP As clsSAP, ByVal GridId As String)
    Dim grid As clsSAPGrid
    Set grid = SAP.TypedGrid(GridId)

    Assert Not grid Is Nothing, "TypedGrid deve retornar um clsSAPGrid valido"
    Assert grid.Id = GridId, "TypedGrid.Id deve ser o Id informado"
    Debug.Print "  RowCount=" & grid.RowCount & " ColumnCount=" & grid.ColumnCount
End Sub

' ================== clsSAPButton ==================

' ---- Teste positivo: Init aceita GuiButton ----
Private Sub Test_Button_Init_Positivo()
    Dim fake As New clsFakeGuiButton
    fake.Text = "Continuar"

    Dim btn As New clsSAPButton
    btn.Init fake, "wnd[1]/usr/btnSPOP-OPTION1"

    Assert btn.Id = "wnd[1]/usr/btnSPOP-OPTION1", "Init/Id armazena o FieldId informado"
    Assert btn.Text = "Continuar", "Init aceita GuiButton e expoe o Text nativo"
End Sub

' ---- Teste negativo: Init deve recusar tipos incompativeis ----
Private Sub Test_Button_Init_TipoInvalido_Negativo()
    Dim fake As New clsFakeGuiButton
    fake.Type = "GuiTextField"

    Dim btn As New clsSAPButton
    On Error Resume Next
    btn.Init fake, "wnd[0]/usr/campo"
    Assert Err.Number <> 0, "Init deve falhar para componente que nao e botao"
    On Error GoTo 0
End Sub

' ---- Teste negativo: Init deve recusar componente nulo ----
Private Sub Test_Button_Init_ComponenteNulo_Negativo()
    Dim btn As New clsSAPButton
    On Error Resume Next
    btn.Init Nothing, "wnd[0]/usr/botao"
    Assert Err.Number <> 0, "Init deve falhar quando o componente nativo e Nothing"
    On Error GoTo 0
End Sub

' ---- Teste positivo: Text, Tooltip e IsDefault refletem o nativo ----
Private Sub Test_Button_Text_Tooltip_IsDefault_Positivo()
    Dim fake As New clsFakeGuiButton
    fake.Text = "Sim"
    fake.Tooltip = "Confirmar exclusao"
    fake.Emphasized = True

    Dim btn As New clsSAPButton
    btn.Init fake, "btn1"

    Assert btn.Text = "Sim", "Text reflete o nativo"
    Assert btn.Tooltip = "Confirmar exclusao", "Tooltip reflete o nativo"
    Assert btn.IsDefault = True, "IsDefault reflete Emphasized do nativo"
End Sub

' ---- Teste positivo: Press repassa a chamada ao nativo ----
Private Sub Test_Button_Press_Positivo()
    Dim fake As New clsFakeGuiButton
    Dim btn As New clsSAPButton
    btn.Init fake, "btn1"

    btn.Press

    Assert fake.PressCalls = 1, "Press deve repassar a chamada ao componente nativo"
End Sub

' ---- Teste de erro: falha ao acionar o botao (ex.: desabilitado na
'      tela atual) deve virar clsSAPException, nunca erro cru de COM ----
Private Sub Test_Button_Press_Erro()
    Dim fake As New clsFakeGuiButton
    fake.FailOnPress = True

    Dim btn As New clsSAPButton
    btn.Init fake, "btn1"

    On Error Resume Next
    btn.Press
    Assert Err.Number <> 0, "Press deve falhar de forma controlada quando o nativo lanca erro"
    On Error GoTo 0
End Sub

' ---- Teste positivo: ToString contem Id e Text ----
Private Sub Test_Button_ToString_Positivo()
    Dim fake As New clsFakeGuiButton
    fake.Text = "OK"

    Dim btn As New clsSAPButton
    btn.Init fake, "wnd[1]/usr/btnOK"

    Dim s As String
    s = btn.ToString()

    Assert InStr(s, "wnd[1]/usr/btnOK") > 0, "ToString contem o Id do botao"
    Assert InStr(s, "OK") > 0, "ToString contem o Text atual"
End Sub

' ---- Teste de integracao com SAP real: clsSAP.TypedButton ponta a
'      ponta. Requer sessao ja conectada e um Id de botao valido para
'      o ambiente de teste; por depender de estado externo, nao entra
'      em RunAllComponentsTests - chame manualmente. ----
Public Sub Test_TypedButton_ComSessaoReal_Integracao(ByVal SAP As clsSAP, ByVal ButtonId As String)
    Dim btn As clsSAPButton
    Set btn = SAP.TypedButton(ButtonId)

    Assert Not btn Is Nothing, "TypedButton deve retornar um clsSAPButton valido"
    Assert btn.Id = ButtonId, "TypedButton.Id deve ser o Id informado"
    Debug.Print "  Text='" & btn.Text & "' | IsDefault=" & btn.IsDefault
End Sub

' ================== clsSAPCheckBox ==================

' ---- Teste positivo: Init aceita GuiCheckBox ----
Private Sub Test_CheckBox_Init_Positivo()
    Dim fake As New clsFakeGuiCheckBox
    fake.Text = "Bloqueado para faturamento"

    Dim chk As New clsSAPCheckBox
    chk.Init fake, "wnd[0]/usr/chkVBAK-FAKSK"

    Assert chk.Id = "wnd[0]/usr/chkVBAK-FAKSK", "Init/Id armazena o FieldId informado"
    Assert chk.Text = "Bloqueado para faturamento", "Init aceita GuiCheckBox e expoe o Text nativo"
End Sub

' ---- Teste negativo: Init deve recusar tipos incompativeis ----
Private Sub Test_CheckBox_Init_TipoInvalido_Negativo()
    Dim fake As New clsFakeGuiCheckBox
    fake.Type = "GuiRadioButton"

    Dim chk As New clsSAPCheckBox
    On Error Resume Next
    chk.Init fake, "wnd[0]/usr/campo"
    Assert Err.Number <> 0, "Init deve falhar para componente que nao e caixa de selecao"
    On Error GoTo 0
End Sub

' ---- Teste negativo: Init deve recusar componente nulo ----
Private Sub Test_CheckBox_Init_ComponenteNulo_Negativo()
    Dim chk As New clsSAPCheckBox
    On Error Resume Next
    chk.Init Nothing, "wnd[0]/usr/chk"
    Assert Err.Number <> 0, "Init deve falhar quando o componente nativo e Nothing"
    On Error GoTo 0
End Sub

' ---- Teste positivo: Selected (get/let) reflete o nativo ----
Private Sub Test_CheckBox_Selected_Positivo()
    Dim fake As New clsFakeGuiCheckBox
    Dim chk As New clsSAPCheckBox
    chk.Init fake, "chk1"

    Assert chk.Selected = False, "Selected deve iniciar False (padrao do duble)"

    chk.Selected = True
    Assert fake.Selected = True, "Selected (let) deve gravar no nativo"
    Assert chk.Selected = True, "Selected (get) deve refletir o nativo apos gravar"
End Sub

' ---- Teste positivo: Check/Uncheck/Toggle sao atalhos para Selected ----
Private Sub Test_CheckBox_CheckUncheckToggle_Positivo()
    Dim fake As New clsFakeGuiCheckBox
    Dim chk As New clsSAPCheckBox
    chk.Init fake, "chk1"

    chk.Check
    Assert fake.Selected = True, "Check deve marcar a caixa (Selected=True) no nativo"

    chk.Uncheck
    Assert fake.Selected = False, "Uncheck deve desmarcar a caixa (Selected=False) no nativo"

    chk.Toggle
    Assert fake.Selected = True, "Toggle deve inverter Selected (False -> True)"

    chk.Toggle
    Assert fake.Selected = False, "Toggle deve inverter Selected de novo (True -> False)"
End Sub

' ---- Teste de erro: falha ao alterar Selected (ex.: desabilitada na
'      tela atual) deve virar clsSAPException, nunca erro cru de COM ----
Private Sub Test_CheckBox_Selected_Erro()
    Dim fake As New clsFakeGuiCheckBox
    fake.FailOnSelectedLet = True

    Dim chk As New clsSAPCheckBox
    chk.Init fake, "chk1"

    On Error Resume Next
    chk.Selected = True
    Assert Err.Number <> 0, "Selected (let) deve falhar de forma controlada quando o nativo lanca erro"
    On Error GoTo 0
End Sub

' ---- Teste positivo: ToString contem Id e Selected ----
Private Sub Test_CheckBox_ToString_Positivo()
    Dim fake As New clsFakeGuiCheckBox
    fake.Selected = True

    Dim chk As New clsSAPCheckBox
    chk.Init fake, "wnd[0]/usr/chkX"

    Dim s As String
    s = chk.ToString()

    Assert InStr(s, "wnd[0]/usr/chkX") > 0, "ToString contem o Id da caixa de selecao"
    Assert InStr(s, "True") > 0, "ToString contem o Selected atual"
End Sub

' ---- Teste de integracao com SAP real: clsSAP.TypedCheckBox ponta a
'      ponta. Requer sessao ja conectada e um Id valido para o
'      ambiente de teste; por depender de estado externo, nao entra
'      em RunAllComponentsTests - chame manualmente. ----
Public Sub Test_TypedCheckBox_ComSessaoReal_Integracao(ByVal SAP As clsSAP, ByVal FieldId As String)
    Dim chk As clsSAPCheckBox
    Set chk = SAP.TypedCheckBox(FieldId)

    Assert Not chk Is Nothing, "TypedCheckBox deve retornar um clsSAPCheckBox valido"
    Assert chk.Id = FieldId, "TypedCheckBox.Id deve ser o Id informado"
    Debug.Print "  Text='" & chk.Text & "' | Selected=" & chk.Selected
End Sub

' ================== clsSAPRadioButton ==================

' ---- Teste positivo: Init aceita GuiRadioButton ----
Private Sub Test_RadioButton_Init_Positivo()
    Dim fake As New clsFakeGuiRadioButton
    fake.Text = "Ordem normal"

    Dim opt As New clsSAPRadioButton
    opt.Init fake, "wnd[0]/usr/rdoVBAK-AUART_1"

    Assert opt.Id = "wnd[0]/usr/rdoVBAK-AUART_1", "Init/Id armazena o FieldId informado"
    Assert opt.Text = "Ordem normal", "Init aceita GuiRadioButton e expoe o Text nativo"
End Sub

' ---- Teste negativo: Init deve recusar tipos incompativeis ----
Private Sub Test_RadioButton_Init_TipoInvalido_Negativo()
    Dim fake As New clsFakeGuiRadioButton
    fake.Type = "GuiCheckBox"

    Dim opt As New clsSAPRadioButton
    On Error Resume Next
    opt.Init fake, "wnd[0]/usr/campo"
    Assert Err.Number <> 0, "Init deve falhar para componente que nao e radio button"
    On Error GoTo 0
End Sub

' ---- Teste negativo: Init deve recusar componente nulo ----
Private Sub Test_RadioButton_Init_ComponenteNulo_Negativo()
    Dim opt As New clsSAPRadioButton
    On Error Resume Next
    opt.Init Nothing, "wnd[0]/usr/rdo"
    Assert Err.Number <> 0, "Init deve falhar quando o componente nativo e Nothing"
    On Error GoTo 0
End Sub

' ---- Teste positivo: Selected (get/let) reflete o nativo ----
Private Sub Test_RadioButton_Selected_Positivo()
    Dim fake As New clsFakeGuiRadioButton
    Dim opt As New clsSAPRadioButton
    opt.Init fake, "rdo1"

    Assert opt.Selected = False, "Selected deve iniciar False (padrao do duble)"

    opt.Selected = True
    Assert fake.Selected = True, "Selected (let) deve gravar no nativo"
End Sub

' ---- Teste positivo: Select e atalho para Selected = True ----
Private Sub Test_RadioButton_Select_Positivo()
    Dim fake As New clsFakeGuiRadioButton
    Dim opt As New clsSAPRadioButton
    opt.Init fake, "rdo1"

    opt.Select

    Assert fake.Selected = True, "Select deve marcar a opcao (Selected=True) no nativo"
End Sub

' ---- Teste de erro: falha ao selecionar (ex.: opcao desabilitada na
'      tela atual) deve virar clsSAPException, nunca erro cru de COM ----
Private Sub Test_RadioButton_Selected_Erro()
    Dim fake As New clsFakeGuiRadioButton
    fake.FailOnSelectedLet = True

    Dim opt As New clsSAPRadioButton
    opt.Init fake, "rdo1"

    On Error Resume Next
    opt.Select
    Assert Err.Number <> 0, "Select deve falhar de forma controlada quando o nativo lanca erro"
    On Error GoTo 0
End Sub

' ---- Teste positivo: ToString contem Id e Selected ----
Private Sub Test_RadioButton_ToString_Positivo()
    Dim fake As New clsFakeGuiRadioButton
    fake.Selected = True

    Dim opt As New clsSAPRadioButton
    opt.Init fake, "wnd[0]/usr/rdoX"

    Dim s As String
    s = opt.ToString()

    Assert InStr(s, "wnd[0]/usr/rdoX") > 0, "ToString contem o Id do radio button"
    Assert InStr(s, "True") > 0, "ToString contem o Selected atual"
End Sub

' ---- Teste de integracao com SAP real: clsSAP.TypedRadioButton ponta
'      a ponta. Requer sessao ja conectada e um Id valido para o
'      ambiente de teste; por depender de estado externo, nao entra
'      em RunAllComponentsTests - chame manualmente. ----
Public Sub Test_TypedRadioButton_ComSessaoReal_Integracao(ByVal SAP As clsSAP, ByVal FieldId As String)
    Dim opt As clsSAPRadioButton
    Set opt = SAP.TypedRadioButton(FieldId)

    Assert Not opt Is Nothing, "TypedRadioButton deve retornar um clsSAPRadioButton valido"
    Assert opt.Id = FieldId, "TypedRadioButton.Id deve ser o Id informado"
    Debug.Print "  Text='" & opt.Text & "' | Selected=" & opt.Selected
End Sub

' ================== clsSAPComboBox ==================
' clsFakeGuiComboBox vem pre-carregado com 3 entradas: 01/Ordem
' normal, 02/Ordem urgente, 03/Ordem de amostra - selecao inicial
' "01". Ver Tests/clsFakeGuiComboBox.cls.

' ---- Teste positivo: Init aceita GuiComboBox ----
Private Sub Test_ComboBox_Init_Positivo()
    Dim fake As New clsFakeGuiComboBox

    Dim cb As New clsSAPComboBox
    cb.Init fake, "wnd[0]/usr/cmbVBAK-AUART"

    Assert cb.Id = "wnd[0]/usr/cmbVBAK-AUART", "Init/Id armazena o FieldId informado"
End Sub

' ---- Teste negativo: Init deve recusar tipos incompativeis ----
Private Sub Test_ComboBox_Init_TipoInvalido_Negativo()
    Dim fake As New clsFakeGuiComboBox
    fake.Type = "GuiTextField"

    Dim cb As New clsSAPComboBox
    On Error Resume Next
    cb.Init fake, "wnd[0]/usr/campo"
    Assert Err.Number <> 0, "Init deve falhar para componente que nao e combo box"
    On Error GoTo 0
End Sub

' ---- Teste negativo: Init deve recusar componente nulo ----
Private Sub Test_ComboBox_Init_ComponenteNulo_Negativo()
    Dim cb As New clsSAPComboBox
    On Error Resume Next
    cb.Init Nothing, "wnd[0]/usr/cmb"
    Assert Err.Number <> 0, "Init deve falhar quando o componente nativo e Nothing"
    On Error GoTo 0
End Sub

' ---- Teste positivo: Key (get) e Text refletem a selecao nativa ----
Private Sub Test_ComboBox_Key_Get_Positivo()
    Dim fake As New clsFakeGuiComboBox
    Dim cb As New clsSAPComboBox
    cb.Init fake, "cmb1"

    Assert cb.Key = "01", "Key (get) deve refletir a selecao inicial do duble"
    Assert cb.Text = "Ordem normal", "Text deve refletir o texto da entrada selecionada"
End Sub

' ---- Teste positivo: Key (let) seleciona uma entrada valida ----
Private Sub Test_ComboBox_Key_Let_Positivo()
    Dim fake As New clsFakeGuiComboBox
    Dim cb As New clsSAPComboBox
    cb.Init fake, "cmb1"

    cb.Key = "02"

    Assert fake.Key = "02", "Key (let) deve gravar a chave no nativo"
    Assert cb.Text = "Ordem urgente", "Text deve acompanhar a nova selecao"
End Sub

' ---- Teste de erro: chave inexistente deve virar clsSAPException
'      clara, nunca erro cru de COM ----
Private Sub Test_ComboBox_Key_Let_ChaveInvalida_Erro()
    Dim fake As New clsFakeGuiComboBox
    Dim cb As New clsSAPComboBox
    cb.Init fake, "cmb1"

    On Error Resume Next
    cb.Key = "99"
    Assert Err.Number <> 0, "Key (let) deve falhar de forma controlada para chave inexistente"
    Assert InStr(Err.Description, "99") > 0, "Erro deve mencionar a chave invalida informada"
    On Error GoTo 0

    Assert fake.Key = "01", "Chave nao deve ser alterada no nativo quando invalida"
End Sub

' ---- Teste de erro: combo box desabilitado tambem deve falhar de
'      forma controlada, antes mesmo de checar a chave ----
Private Sub Test_ComboBox_Key_Let_Desabilitado_Erro()
    Dim fake As New clsFakeGuiComboBox
    fake.Changeable = False

    Dim cb As New clsSAPComboBox
    cb.Init fake, "cmb1"

    On Error Resume Next
    cb.Key = "02"
    Assert Err.Number <> 0, "Key (let) deve falhar de forma controlada quando desabilitado"
    On Error GoTo 0

    Assert fake.Key = "01", "Chave nao deve ser alterada no nativo quando desabilitado"
End Sub

' ---- Teste positivo: HasKey ----
Private Sub Test_ComboBox_HasKey_Positivo()
    Dim fake As New clsFakeGuiComboBox
    Dim cb As New clsSAPComboBox
    cb.Init fake, "cmb1"

    Assert cb.HasKey("02") = True, "HasKey deve ser True para chave existente"
    Assert cb.HasKey("99") = False, "HasKey deve ser False para chave inexistente"
End Sub

' ---- Teste positivo: EntryKeys lista todas as chaves na ordem nativa ----
Private Sub Test_ComboBox_EntryKeys_Positivo()
    Dim fake As New clsFakeGuiComboBox
    Dim cb As New clsSAPComboBox
    cb.Init fake, "cmb1"

    Dim chaves As Collection
    Set chaves = cb.EntryKeys()

    Assert chaves.Count = 3, "EntryKeys deve retornar uma chave por entrada (3 na fixture)"
    Assert chaves(1) = "01", "EntryKeys deve preservar a ordem nativa (1a posicao)"
    Assert chaves(3) = "03", "EntryKeys deve preservar a ordem nativa (ultima posicao)"
End Sub

' ---- Teste positivo: ToString contem Id, Key e Text ----
Private Sub Test_ComboBox_ToString_Positivo()
    Dim fake As New clsFakeGuiComboBox
    Dim cb As New clsSAPComboBox
    cb.Init fake, "wnd[0]/usr/cmbX"

    Dim s As String
    s = cb.ToString()

    Assert InStr(s, "wnd[0]/usr/cmbX") > 0, "ToString contem o Id do combo box"
    Assert InStr(s, "01") > 0, "ToString contem a Key atual"
    Assert InStr(s, "Ordem normal") > 0, "ToString contem o Text atual"
End Sub

' ---- Teste de integracao com SAP real: clsSAP.TypedComboBox ponta
'      a ponta. Requer sessao ja conectada e um Id valido para o
'      ambiente de teste; por depender de estado externo, nao entra
'      em RunAllComponentsTests - chame manualmente. ----
Public Sub Test_TypedComboBox_ComSessaoReal_Integracao(ByVal SAP As clsSAP, ByVal FieldId As String)
    Dim cb As clsSAPComboBox
    Set cb = SAP.TypedComboBox(FieldId)

    Assert Not cb Is Nothing, "TypedComboBox deve retornar um clsSAPComboBox valido"
    Assert cb.Id = FieldId, "TypedComboBox.Id deve ser o Id informado"
    Debug.Print "  Key='" & cb.Key & "' | Text='" & cb.Text & "'"
End Sub

' ================== clsSAPStatusBar ==================

' ---- Teste positivo: Init aceita GuiStatusbar ----
Private Sub Test_StatusBar_Init_Positivo()
    Dim fake As New clsFakeGuiStatusBar

    Dim sbar As New clsSAPStatusBar
    sbar.Init fake, "wnd[0]/sbar"

    Assert sbar.Id = "wnd[0]/sbar", "Init/Id armazena o FieldId informado"
End Sub

' ---- Teste negativo: Init deve recusar tipos incompativeis ----
Private Sub Test_StatusBar_Init_TipoInvalido_Negativo()
    Dim fake As New clsFakeGuiStatusBar
    fake.Type = "GuiTextField"

    Dim sbar As New clsSAPStatusBar
    On Error Resume Next
    sbar.Init fake, "wnd[0]/usr/campo"
    Assert Err.Number <> 0, "Init deve falhar para componente que nao e barra de status"
    On Error GoTo 0
End Sub

' ---- Teste negativo: Init deve recusar componente nulo ----
Private Sub Test_StatusBar_Init_ComponenteNulo_Negativo()
    Dim sbar As New clsSAPStatusBar
    On Error Resume Next
    sbar.Init Nothing, "wnd[0]/sbar"
    Assert Err.Number <> 0, "Init deve falhar quando o componente nativo e Nothing"
    On Error GoTo 0
End Sub

' ---- Teste positivo: sem mensagem, HasMessage/IsError/IsWarning/
'      IsSuccess devem ser todos False ----
Private Sub Test_StatusBar_SemMensagem_Positivo()
    Dim fake As New clsFakeGuiStatusBar

    Dim sbar As New clsSAPStatusBar
    sbar.Init fake, "wnd[0]/sbar"

    Assert sbar.HasMessage() = False, "HasMessage deve ser False quando a barra esta vazia"
    Assert sbar.IsError() = False, "IsError deve ser False sem mensagem"
    Assert sbar.IsWarning() = False, "IsWarning deve ser False sem mensagem"
    Assert sbar.IsSuccess() = False, "IsSuccess deve ser False sem mensagem"
End Sub

' ---- Teste positivo: mensagem de erro ("E") ----
Private Sub Test_StatusBar_IsError_Positivo()
    Dim fake As New clsFakeGuiStatusBar
    fake.MessageType = "E"
    fake.Text = "Pedido nao encontrado"

    Dim sbar As New clsSAPStatusBar
    sbar.Init fake, "wnd[0]/sbar"

    Assert sbar.HasMessage() = True, "HasMessage deve ser True com texto preenchido"
    Assert sbar.IsError() = True, "IsError deve ser True para MessageType='E'"
    Assert sbar.IsWarning() = False, "IsWarning deve ser False para MessageType='E'"
    Assert sbar.Text = "Pedido nao encontrado", "Text deve refletir a mensagem nativa"
End Sub

' ---- Teste positivo: mensagem de aviso ("W") ----
Private Sub Test_StatusBar_IsWarning_Positivo()
    Dim fake As New clsFakeGuiStatusBar
    fake.MessageType = "W"
    fake.Text = "Bloqueio de credito"

    Dim sbar As New clsSAPStatusBar
    sbar.Init fake, "wnd[0]/sbar"

    Assert sbar.IsWarning() = True, "IsWarning deve ser True para MessageType='W'"
    Assert sbar.IsError() = False, "IsError deve ser False para MessageType='W'"
End Sub

' ---- Teste positivo: mensagem de sucesso ("S") ----
Private Sub Test_StatusBar_IsSuccess_Positivo()
    Dim fake As New clsFakeGuiStatusBar
    fake.MessageType = "S"
    fake.Text = "Pedido salvo com sucesso"

    Dim sbar As New clsSAPStatusBar
    sbar.Init fake, "wnd[0]/sbar"

    Assert sbar.IsSuccess() = True, "IsSuccess deve ser True para MessageType='S'"
    Assert sbar.IsError() = False, "IsError deve ser False para MessageType='S'"
End Sub

' ---- Teste positivo: ToString contem tipo e texto ----
Private Sub Test_StatusBar_ToString_Positivo()
    Dim fake As New clsFakeGuiStatusBar
    fake.MessageType = "E"
    fake.Text = "Erro de teste"

    Dim sbar As New clsSAPStatusBar
    sbar.Init fake, "wnd[0]/sbar"

    Dim s As String
    s = sbar.ToString()

    Assert InStr(s, "E") > 0, "ToString contem o MessageType"
    Assert InStr(s, "Erro de teste") > 0, "ToString contem o Text atual"
End Sub

' ---- Teste de integracao com SAP real: clsSAP.TypedStatusBar ponta
'      a ponta. Requer sessao ja conectada; por depender de estado
'      externo, nao entra em RunAllComponentsTests - chame
'      manualmente. Tambem serve para confirmar o Type real da
'      barra de status no seu ambiente ("GuiStatusbar" esperado). ----
Public Sub Test_TypedStatusBar_ComSessaoReal_Integracao(ByVal SAP As clsSAP)
    Dim sbar As clsSAPStatusBar
    Set sbar = SAP.TypedStatusBar("wnd[0]/sbar")

    Assert Not sbar Is Nothing, "TypedStatusBar deve retornar um clsSAPStatusBar valido"
    Debug.Print "  MessageType='" & sbar.MessageType & "' | Text='" & sbar.Text & "'"
End Sub

' ================== clsSAPTab ==================

' ---- Teste positivo: Init aceita GuiTab ----
Private Sub Test_Tab_Init_Positivo()
    Dim fake As New clsFakeGuiTab
    fake.Text = "Dados de vendas"

    Dim tab As New clsSAPTab
    tab.Init fake, "wnd[0]/usr/tabsTS/tabpVEND"

    Assert tab.Id = "wnd[0]/usr/tabsTS/tabpVEND", "Init/Id armazena o FieldId informado"
    Assert tab.Text = "Dados de vendas", "Init aceita GuiTab e expoe o Text nativo"
End Sub

' ---- Teste negativo: Init deve recusar tipos incompativeis ----
Private Sub Test_Tab_Init_TipoInvalido_Negativo()
    Dim fake As New clsFakeGuiTab
    fake.Type = "GuiButton"

    Dim tab As New clsSAPTab
    On Error Resume Next
    tab.Init fake, "wnd[0]/usr/campo"
    Assert Err.Number <> 0, "Init deve falhar para componente que nao e aba"
    On Error GoTo 0
End Sub

' ---- Teste negativo: Init deve recusar componente nulo ----
Private Sub Test_Tab_Init_ComponenteNulo_Negativo()
    Dim tab As New clsSAPTab
    On Error Resume Next
    tab.Init Nothing, "wnd[0]/usr/tab"
    Assert Err.Number <> 0, "Init deve falhar quando o componente nativo e Nothing"
    On Error GoTo 0
End Sub

' ---- Teste positivo: Selected (get) reflete o nativo, sem Let
'      exposto no wrapper (Selected e somente leitura em GuiTab) ----
Private Sub Test_Tab_Selected_Positivo()
    Dim fake As New clsFakeGuiTab
    Dim tab As New clsSAPTab
    tab.Init fake, "tab1"

    Assert tab.Selected = False, "Selected deve iniciar False (padrao do duble)"

    fake.Selected = True
    Assert tab.Selected = True, "Selected (get) deve refletir o estado do nativo"
End Sub

' ---- Teste positivo: Select ativa a aba no nativo ----
Private Sub Test_Tab_Select_Positivo()
    Dim fake As New clsFakeGuiTab
    Dim tab As New clsSAPTab
    tab.Init fake, "tab1"

    tab.Select

    Assert fake.Selected = True, "Select deve ativar a aba (Selected=True) no nativo"
    Assert fake.SelectCalls = 1, "Select deve repassar a chamada ao componente nativo"
End Sub

' ---- Teste de erro: falha ao ativar a aba (ex.: aba desabilitada na
'      tela atual) deve virar clsSAPException, nunca erro cru de COM ----
Private Sub Test_Tab_Select_Erro()
    Dim fake As New clsFakeGuiTab
    fake.FailOnSelect = True

    Dim tab As New clsSAPTab
    tab.Init fake, "tab1"

    On Error Resume Next
    tab.Select
    Assert Err.Number <> 0, "Select deve falhar de forma controlada quando o nativo lanca erro"
    On Error GoTo 0
End Sub

' ---- Teste positivo: ToString contem Id, Text e Selected ----
Private Sub Test_Tab_ToString_Positivo()
    Dim fake As New clsFakeGuiTab
    fake.Text = "Dados gerais"
    fake.Selected = True

    Dim tab As New clsSAPTab
    tab.Init fake, "wnd[0]/usr/tabsTS/tabpGER"

    Dim s As String
    s = tab.ToString()

    Assert InStr(s, "wnd[0]/usr/tabsTS/tabpGER") > 0, "ToString contem o Id da aba"
    Assert InStr(s, "Dados gerais") > 0, "ToString contem o Text atual"
    Assert InStr(s, "True") > 0, "ToString contem o Selected atual"
End Sub

' ---- Teste de integracao com SAP real: clsSAP.TypedTab ponta a
'      ponta. Requer sessao ja conectada e um Id de aba valido para o
'      ambiente de teste; por depender de estado externo, nao entra
'      em RunAllComponentsTests - chame manualmente. Tambem serve
'      para confirmar o Type real de uma aba no seu ambiente ("GuiTab"
'      esperado). ----
Public Sub Test_TypedTab_ComSessaoReal_Integracao(ByVal SAP As clsSAP, ByVal FieldId As String)
    Dim tab As clsSAPTab
    Set tab = SAP.TypedTab(FieldId)

    Assert Not tab Is Nothing, "TypedTab deve retornar um clsSAPTab valido"
    Assert tab.Id = FieldId, "TypedTab.Id deve ser o Id informado"
    Debug.Print "  Text='" & tab.Text & "' | Selected=" & tab.Selected
End Sub

' ---- Utilitario minimo de assercao para os testes acima ----
Private Sub Assert(ByVal Condition As Boolean, ByVal Description As String)
    If Condition Then
        Debug.Print "  [OK]   " & Description
    Else
        Debug.Print "  [FAIL] " & Description
    End If
End Sub
