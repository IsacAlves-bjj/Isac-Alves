VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "clsFakeGuiTableCell"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

'==========================================================
' clsFakeGuiTableCell
' Duble do objeto retornado por GuiTableControl.GetCell(row, col) -
' na pratica, na maioria das telas, um GuiTextField/GuiCTextField com
' propriedade Text. Le/escreve diretamente no dicionario de
' armazenamento compartilhado com clsFakeGuiTableControl (mesma
' referencia de objeto), para que SetCellValue/GetCellValue do
' wrapper vejam o mesmo estado mesmo criando uma instancia nova de
' celula a cada GetCell. Vive em Tests/, nao faz parte do Framework
' entregue ao usuario final.
'==========================================================

Private mStore As Object   ' Scripting.Dictionary, compartilhado com a tabela dona
Private mKey As String
Private mType As String

Public Sub Init(ByVal Store As Object, ByVal Key As String, Optional ByVal CellType As String = "GuiTextField")
    Set mStore = Store
    mKey = Key
    mType = CellType
    If Not mStore.Exists(mKey) Then mStore(mKey) = ""
End Sub

Public Property Get Type() As String
    Type = mType
End Property

Public Property Get Text() As String
    Text = mStore(mKey)
End Property

Public Property Let Text(ByVal Value As String)
    mStore(mKey) = Value
End Property
