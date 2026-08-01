VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "clsFakeGuiTableColumn"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

'==========================================================
' clsFakeGuiTableColumn
' Duble minimo de um GuiTableColumn (apenas Title, unico membro que
' clsSAPTable consome). Usado por clsFakeGuiTableColumns dentro de
' clsFakeGuiTableControl. Vive em Tests/, nao faz parte do Framework
' entregue ao usuario final.
'==========================================================

Private mTitle As String

Public Property Get Title() As String
    Title = mTitle
End Property

Public Property Let Title(ByVal Value As String)
    mTitle = Value
End Property
