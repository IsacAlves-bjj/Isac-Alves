VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "clsFakeGuiTableControl"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

'==========================================================
' clsFakeGuiTableControl
' Duble de teste que imita a interface minima de um GuiTableControl do
' SAP GUI Scripting (Type, RowCount, VisibleRowCount, Columns,
' VerticalScrollbar, GetCell, GetAbsoluteRow) - incluindo o
' comportamento de rolagem: GetCell(row, col) usa linha RELATIVA a
' posicao atual do VerticalScrollbar, exatamente como a API real (ver
' nota de risco em Components/clsSAPTable.cls). Usado apenas em
' M_Test_Components para testar clsSAPTable sem depender de uma sessao
' SAP real.
'
' Vem pre-carregado com 5 linhas x colunas MATNR/MENGE
' (MAT-001/10 .. MAT-005/50) e VisibleRowCount = 3, para os testes
' terem dado tanto para ler linhas visiveis quanto para forcar rolagem.
'
' Nao faz parte do Framework entregue ao usuario final - vive em
' Tests/ e so deve ser importado junto com os testes (junto com
' clsFakeGuiTableColumn, clsFakeGuiTableColumns, clsFakeGuiTableCell,
' clsFakeGuiTableRow e clsFakeGuiScrollbar).
'==========================================================

Private mType As String
Private mRowCount As Long
Private mVisibleRowCount As Long
Private mColumns As clsFakeGuiTableColumns
Private mScrollbar As clsFakeGuiScrollbar
Private mCells As Object            ' Scripting.Dictionary, chave "linhaAbsoluta|colIndex"
Private mSelected As Object         ' Scripting.Dictionary, chave linhaAbsoluta
Private mFailOnGetCell As Boolean
Private mFailOnSelectedLet As Boolean

Private Sub Class_Initialize()
    mType = "GuiTableControl"
    mRowCount = 5
    mVisibleRowCount = 3

    Set mColumns = New clsFakeGuiTableColumns
    AddColumn "MATNR"
    AddColumn "MENGE"

    Set mScrollbar = New clsFakeGuiScrollbar
    mScrollbar.Maximum = mRowCount - mVisibleRowCount

    Set mCells = CreateObject("Scripting.Dictionary")
    Set mSelected = CreateObject("Scripting.Dictionary")

    Dim i As Long
    For i = 0 To mRowCount - 1
        SeedCell i, 0, "MAT-00" & (i + 1)
        SeedCell i, 1, CStr((i + 1) * 10)
    Next i
End Sub

Public Property Get Type() As String
    Type = mType
End Property

Public Property Let Type(ByVal Value As String)
    mType = Value
End Property

Public Property Get RowCount() As Long
    RowCount = mRowCount
End Property

Public Property Let RowCount(ByVal Value As Long)
    mRowCount = Value
    mScrollbar.Maximum = mRowCount - mVisibleRowCount
End Property

Public Property Get VisibleRowCount() As Long
    VisibleRowCount = mVisibleRowCount
End Property

Public Property Let VisibleRowCount(ByVal Value As Long)
    mVisibleRowCount = Value
    mScrollbar.Maximum = mRowCount - mVisibleRowCount
End Property

Public Property Get Columns() As clsFakeGuiTableColumns
    Set Columns = mColumns
End Property

Public Property Get VerticalScrollbar() As clsFakeGuiScrollbar
    Set VerticalScrollbar = mScrollbar
End Property

' Retorna a celula na linha RELATIVA a janela visivel atual (0 a
' VisibleRowCount - 1) - mesma semantica da API real.
Public Function GetCell(ByVal Row As Long, ByVal Col As Long) As clsFakeGuiTableCell
    If mFailOnGetCell Then
        Err.Raise 615, "SAP GUI Scripting", "Elemento de tela nao pode ser acionado no momento."
    End If

    Dim absRow As Long
    absRow = mScrollbar.Position + Row

    Dim cell As New clsFakeGuiTableCell
    cell.Init mCells, CellKey(absRow, Col)
    Set GetCell = cell
End Function

' Retorna a linha por indice ABSOLUTO, sem exigir rolagem previa -
' mesma semantica da API real.
Public Function GetAbsoluteRow(ByVal Row As Long) As clsFakeGuiTableRow
    Dim rowObj As New clsFakeGuiTableRow
    rowObj.Init mSelected, CStr(Row), mFailOnSelectedLet
    Set GetAbsoluteRow = rowObj
End Function

' Quando True, simula uma falha de COM ao chamar GetCell (ex.: tabela
' bloqueada/tela ja fechada), para testar o tratamento de erro.
Public Property Let FailOnGetCell(ByVal Value As Boolean)
    mFailOnGetCell = Value
End Property

' Quando True, simula uma falha de COM ao selecionar/desselecionar uma
' linha via GetAbsoluteRow(...).Selected, para testar o tratamento de
' erro.
Public Property Let FailOnSelectedLet(ByVal Value As Boolean)
    mFailOnSelectedLet = Value
End Property

' ---------- Utilitarios de fixture (nao fazem parte da API nativa) ----------

' Leitura direta do armazenamento interno, por linha absoluta - util
' para os testes fazerem assercoes sem depender da posicao atual do
' scrollbar.
Public Function CellValue(ByVal AbsRow As Long, ByVal Col As Long) As String
    Dim k As String
    k = CellKey(AbsRow, Col)
    If mCells.Exists(k) Then CellValue = mCells(k)
End Function

' Preenche uma celula diretamente pelo armazenamento interno, por
' linha absoluta - usado no Class_Initialize e em testes que precisam
' de um estado inicial especifico.
Public Sub SeedCell(ByVal AbsRow As Long, ByVal Col As Long, ByVal Value As String)
    mCells(CellKey(AbsRow, Col)) = Value
End Sub

Private Sub AddColumn(ByVal Title As String)
    Dim col As New clsFakeGuiTableColumn
    col.Title = Title
    mColumns.Add col
End Sub

Private Function CellKey(ByVal AbsRow As Long, ByVal Col As Long) As String
    CellKey = AbsRow & "|" & Col
End Function
