VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "clsFakeGuiTableColumns"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

'==========================================================
' clsFakeGuiTableColumns
' Duble da colecao GuiTableControl.Columns: expoe Count e acesso por
' indice 0-based via membro default (Item), no mesmo estilo de
' colecoes nativas do SAP GUI Scripting acessadas por parenteses (ex.:
' GuiConnection.Children(i), ja usado em Core/clsSAP.cls). Usado
' apenas em M_Test_Components, via clsFakeGuiTableControl.Columns.
'==========================================================

Private mItems As Collection

Private Sub Class_Initialize()
    Set mItems = New Collection
End Sub

Public Sub Add(ByVal Column As clsFakeGuiTableColumn)
    mItems.Add Column
End Sub

Public Property Get Count() As Long
    Count = mItems.Count
End Property

' Membro default: permite "columns(i)", 0-based, espelhando o acesso
' por parenteses usado nas colecoes nativas do SAP GUI Scripting.
Public Property Get Item(ByVal Index As Long) As clsFakeGuiTableColumn
Attribute Item.VB_UserMemId = 0
    Set Item = mItems(Index + 1)
End Property
