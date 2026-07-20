VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "clsFakeGuiGridView"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

'==========================================================
' clsFakeGuiGridView
' Duble de teste que imita a interface minima de um GuiGridView do
' SAP GUI Scripting (Type, RowCount, ColumnOrder, GetCellValue,
' ModifyCell, SetCurrentCell/CurrentCellRow/CurrentCellColumn,
' FirstVisibleRow, SelectedRows, SelectAll, DoubleClickCurrentCell,
' PressToolbarButton). Usado apenas em M_Test_Components para testar
' clsSAPGrid sem depender de uma sessao SAP real.
'
' Vem pre-carregado com 3 linhas x colunas MATNR/MENGE para os
' testes terem dado para ler. Nao faz parte do Framework entregue ao
' usuario final - vive em Tests/ e so deve ser importado junto com
' os testes.
'==========================================================

Private mType As String
Private mCells As Object            ' Scripting.Dictionary, chave "linha|coluna"
Private mColumnOrder As Collection
Private mRowCount As Long
Private mCurrentRow As Long
Private mCurrentColumn As String
Private mFirstVisibleRow As Long
Private mSelectedRows As String
Private mSelectAllCalls As Long
Private mDoubleClickCalls As Long
Private mLastToolbarButton As String

Private Sub Class_Initialize()
    mType = "GuiGridView"
    Set mCells = CreateObject("Scripting.Dictionary")
    Set mColumnOrder = New Collection
    mColumnOrder.Add "MATNR"
    mColumnOrder.Add "MENGE"
    mRowCount = 3

    SetCell 0, "MATNR", "MAT-001"
    SetCell 0, "MENGE", "10"
    SetCell 1, "MATNR", "MAT-002"
    SetCell 1, "MENGE", "20"
    SetCell 2, "MATNR", "MAT-003"
    SetCell 2, "MENGE", "30"
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
End Property

Public Property Get ColumnOrder() As Collection
    Set ColumnOrder = mColumnOrder
End Property

Public Function GetCellValue(ByVal Row As Long, ByVal ColumnId As String) As String
    Dim k As String
    k = Row & "|" & ColumnId
    If mCells.Exists(k) Then
        GetCellValue = mCells(k)
    End If
End Function

Public Sub ModifyCell(ByVal Row As Long, ByVal ColumnId As String, ByVal Value As String)
    SetCell Row, ColumnId, Value
End Sub

Public Sub SetCurrentCell(ByVal Row As Long, ByVal ColumnId As String)
    mCurrentRow = Row
    mCurrentColumn = ColumnId
End Sub

Public Property Get CurrentCellRow() As Long
    CurrentCellRow = mCurrentRow
End Property

Public Property Get CurrentCellColumn() As String
    CurrentCellColumn = mCurrentColumn
End Property

Public Property Get FirstVisibleRow() As Long
    FirstVisibleRow = mFirstVisibleRow
End Property

Public Property Let FirstVisibleRow(ByVal Value As Long)
    mFirstVisibleRow = Value
End Property

Public Property Get SelectedRows() As String
    SelectedRows = mSelectedRows
End Property

Public Property Let SelectedRows(ByVal Value As String)
    mSelectedRows = Value
End Property

Public Sub SelectAll()
    mSelectAllCalls = mSelectAllCalls + 1
End Sub

Public Property Get SelectAllCalls() As Long
    SelectAllCalls = mSelectAllCalls
End Property

Public Sub DoubleClickCurrentCell()
    mDoubleClickCalls = mDoubleClickCalls + 1
End Sub

Public Property Get DoubleClickCalls() As Long
    DoubleClickCalls = mDoubleClickCalls
End Property

Public Sub PressToolbarButton(ByVal ButtonId As String)
    mLastToolbarButton = ButtonId
End Sub

Public Property Get LastToolbarButton() As String
    LastToolbarButton = mLastToolbarButton
End Property

Private Sub SetCell(ByVal Row As Long, ByVal ColumnId As String, ByVal Value As String)
    mCells(Row & "|" & ColumnId) = Value
End Sub
