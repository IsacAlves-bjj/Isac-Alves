VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "clsSAPGrid"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

'==========================================================
' clsSAPGrid
' Wrapper tipado sobre GuiGridView (ALV Grid Control) - o
' componente mais verboso e mais usado em relatorios/listas SD
' (VA05, MB51, ME2M...). Recebe o componente nativo ja resolvido
' pelo Core (clsSAPSession.GetComponent, via clsSAP.TypedGrid) e
' adiciona por cima dele:
'   - validacao de tipo (falha cedo se o Id nao apontar para um
'     GuiGridView);
'   - validacao de indice de linha, com mensagem clara em vez do
'     erro criptico de COM ao acessar linha fora do intervalo;
'   - GetColumnValues, que elimina o loop manual "For i = 0 To
'     RowCount - 1 ... GetCellValue" que se repete em praticamente
'     toda automacao que consolida dados de uma ALV grid.
'
' Nunca chama FindById diretamente (Components/README.md,
' diretriz 3) - so recebe objetos ja resolvidos pelo Core.
'
' Cobertura desta versao: leitura/escrita de celula, selecao de
' linhas, celula atual, primeira linha visivel, botoes de toolbar,
' duplo-clique. Menu de contexto e selecao/ordenacao de coluna
' ainda nao estao cobertos - ver Components/README.md.
'==========================================================

Private mNative As Object          ' GuiGridView
Private mFieldId As String

Private Const CLASS_NAME As String = "clsSAPGrid"
Private Const VALID_TYPE As String = "GuiGridView"

' Associa o wrapper a um componente nativo ja resolvido pelo Core.
' Valida o Type do componente e lanca clsSAPException clara se o
' objeto passado nao for um GuiGridView. Chame antes de usar
' qualquer outro membro.
Public Sub Init(ByVal NativeComponent As Object, Optional ByVal FieldId As String = "")

    If NativeComponent Is Nothing Then
        RaiseGridError 0, "Componente nativo nulo passado para clsSAPGrid.Init.", "Init", FieldId
    End If

    Dim actualType As String
    On Error GoTo ErrHandler
    actualType = NativeComponent.Type
    On Error GoTo 0

    If actualType <> VALID_TYPE Then
        RaiseGridError 0, "Componente '" & FieldId & "' nao e uma grid ALV (esperado " & _
                         VALID_TYPE & ", encontrado '" & actualType & "'). " & _
                         "Use o wrapper correto para esse tipo de componente.", "Init", FieldId
    End If

    Set mNative = NativeComponent
    mFieldId = FieldId
    Exit Sub

ErrHandler:
    HandleError Err, "Init"

End Sub

Public Property Get Id() As String
    Id = mFieldId
End Property

' Escape hatch: acesso ao objeto GUI nativo para operacoes raras
' nao cobertas pelo wrapper (ex.: menu de contexto).
Public Function NativeObject() As Object
    Set NativeObject = mNative
End Function

Public Property Get RowCount() As Long
    On Error GoTo ErrHandler
    RowCount = mNative.RowCount
    Exit Property
ErrHandler:
    HandleError Err, "RowCount"
End Property

' Numero de colunas exibidas na grid (via ColumnOrder, a lista de
' nomes tecnicos de coluna na ordem atual de exibicao).
Public Property Get ColumnCount() As Long
    On Error GoTo ErrHandler
    ColumnCount = mNative.ColumnOrder.Count
    Exit Property
ErrHandler:
    HandleError Err, "ColumnCount"
End Property

' Nomes tecnicos das colunas, na ordem atual de exibicao. Util para
' descobrir o ColumnId antes de chamar GetCellValue/SetCellValue.
Public Function ColumnIds() As Collection
    On Error GoTo ErrHandler
    Set ColumnIds = mNative.ColumnOrder
    Exit Function
ErrHandler:
    HandleError Err, "ColumnIds"
End Function

Public Function IsEmpty() As Boolean
    On Error GoTo ErrHandler
    IsEmpty = (mNative.RowCount = 0)
    Exit Function
ErrHandler:
    HandleError Err, "IsEmpty"
End Function

' Le o valor de uma celula. Valida a linha contra RowCount antes de
' acessar o nativo, para dar um erro claro ("linha fora do
' intervalo") em vez do erro criptico de COM nesse caso.
Public Function GetCellValue(ByVal Row As Long, ByVal ColumnId As String) As String
    ValidateRow Row, "GetCellValue"

    On Error GoTo ErrHandler
    GetCellValue = mNative.GetCellValue(Row, ColumnId)
    Exit Function

ErrHandler:
    HandleError Err, "GetCellValue"
End Function

' Escreve o valor de uma celula editavel da grid (ex.: quantidade em
' uma linha de pedido). Mesma validacao de linha de GetCellValue.
Public Sub SetCellValue(ByVal Row As Long, ByVal ColumnId As String, ByVal Value As String)
    ValidateRow Row, "SetCellValue"

    On Error GoTo ErrHandler
    mNative.ModifyCell Row, ColumnId, Value
    Exit Sub

ErrHandler:
    HandleError Err, "SetCellValue"
End Sub

' Le uma coluna inteira, linha a linha, e devolve como Collection de
' String. Elimina o loop manual "For i = 0 To RowCount - 1 ...
' GetCellValue" que se repete em praticamente toda automacao que
' consolida dados de uma ALV grid.
Public Function GetColumnValues(ByVal ColumnId As String) As Collection
    On Error GoTo ErrHandler

    Dim result As New Collection
    Dim rc As Long, i As Long
    rc = mNative.RowCount

    For i = 0 To rc - 1
        result.Add mNative.GetCellValue(i, ColumnId)
    Next i

    Set GetColumnValues = result
    Exit Function

ErrHandler:
    HandleError Err, "GetColumnValues"
End Function

Public Sub SetCurrentCell(ByVal Row As Long, ByVal ColumnId As String)
    ValidateRow Row, "SetCurrentCell"

    On Error GoTo ErrHandler
    mNative.SetCurrentCell Row, ColumnId
    Exit Sub

ErrHandler:
    HandleError Err, "SetCurrentCell"
End Sub

Public Property Get CurrentCellRow() As Long
    On Error GoTo ErrHandler
    CurrentCellRow = mNative.CurrentCellRow
    Exit Property
ErrHandler:
    HandleError Err, "CurrentCellRow"
End Property

Public Property Get CurrentCellColumn() As String
    On Error GoTo ErrHandler
    CurrentCellColumn = mNative.CurrentCellColumn
    Exit Property
ErrHandler:
    HandleError Err, "CurrentCellColumn"
End Property

Public Property Get FirstVisibleRow() As Long
    On Error GoTo ErrHandler
    FirstVisibleRow = mNative.FirstVisibleRow
    Exit Property
ErrHandler:
    HandleError Err, "FirstVisibleRow (get)"
End Property

Public Property Let FirstVisibleRow(ByVal Value As Long)
    On Error GoTo ErrHandler
    mNative.FirstVisibleRow = Value
    Exit Property
ErrHandler:
    HandleError Err, "FirstVisibleRow (let)"
End Property

' Linhas selecionadas, no formato nativo do SAP GUI Scripting (ex.:
' "0,2,5" ou "0-3"). Para selecionar uma unica linha, prefira
' SelectRow(Row).
Public Property Get SelectedRows() As String
    On Error GoTo ErrHandler
    SelectedRows = mNative.SelectedRows
    Exit Property
ErrHandler:
    HandleError Err, "SelectedRows (get)"
End Property

Public Property Let SelectedRows(ByVal Value As String)
    On Error GoTo ErrHandler
    mNative.SelectedRows = Value
    Exit Property
ErrHandler:
    HandleError Err, "SelectedRows (let)"
End Property

' Seleciona uma unica linha (0-based), com a mesma validacao de
' intervalo usada em GetCellValue. Para selecao multipla, use
' SelectedRows diretamente (ex.: "0,2,5" ou "0-3").
Public Sub SelectRow(ByVal Row As Long)
    ValidateRow Row, "SelectRow"

    On Error GoTo ErrHandler
    mNative.SelectedRows = CStr(Row)
    Exit Sub

ErrHandler:
    HandleError Err, "SelectRow"
End Sub

Public Sub SelectAll()
    On Error GoTo ErrHandler
    mNative.SelectAll
    Exit Sub
ErrHandler:
    HandleError Err, "SelectAll"
End Sub

Public Sub ClearSelection()
    On Error GoTo ErrHandler
    mNative.SelectedRows = ""
    Exit Sub
ErrHandler:
    HandleError Err, "ClearSelection"
End Sub

Public Sub PressToolbarButton(ByVal ButtonId As String)
    On Error GoTo ErrHandler
    mNative.PressToolbarButton ButtonId
    Exit Sub
ErrHandler:
    HandleError Err, "PressToolbarButton"
End Sub

' Posiciona a celula atual e da duplo-clique nela - atalho para o
' padrao mais comum de "abrir o documento de uma linha de relatorio".
Public Sub DoubleClickCell(ByVal Row As Long, ByVal ColumnId As String)
    ValidateRow Row, "DoubleClickCell"

    On Error GoTo ErrHandler
    mNative.SetCurrentCell Row, ColumnId
    mNative.DoubleClickCurrentCell
    Exit Sub

ErrHandler:
    HandleError Err, "DoubleClickCell"
End Sub

' Formata a grid para exibicao em log/imediato, no mesmo espirito de
' clsSAPException.ToString().
Public Function ToString() As String
    If mNative Is Nothing Then
        ToString = "[clsSAPGrid] (nao inicializado)"
    Else
        ToString = "[clsSAPGrid] Id=" & mFieldId & " RowCount=" & mNative.RowCount
    End If
End Function

' ---------- Infraestrutura interna ----------

' Valida que Row esta dentro de [0, RowCount - 1]. O erro de
' intervalo invalido e lancado com o handler do chamador ainda
' desligado (o chamador so ativa o proprio "On Error GoTo ErrHandler"
' depois de chamar este metodo), entao nao e reembrulhado.
Private Sub ValidateRow(ByVal Row As Long, ByVal MethodName As String)
    Dim rc As Long
    On Error GoTo ErrHandler
    rc = mNative.RowCount
    On Error GoTo 0

    If Row < 0 Or Row >= rc Then
        RaiseGridError 0, "Linha " & Row & " fora do intervalo (grid '" & mFieldId & "' tem " & rc & _
                         " linha(s); indices validos: 0 a " & (rc - 1) & ").", MethodName, mFieldId
    End If

    Exit Sub

ErrHandler:
    HandleError Err, MethodName
End Sub

Private Sub HandleError(ByVal SourceErr As ErrObject, ByVal MethodName As String)
    Dim ex As New clsSAPException
    ex.Init SourceErr.Number, SourceErr.Description, CLASS_NAME, MethodName, , mFieldId
    ex.Raise
End Sub

Private Sub RaiseGridError(ByVal Number As Long, ByVal Description As String, _
                             ByVal MethodName As String, ByVal FieldId As String)
    Dim ex As New clsSAPException
    ex.Init Number, Description, CLASS_NAME, MethodName, , FieldId
    ex.Raise
End Sub
