VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "clsFakeGuiTableRow"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

'==========================================================
' clsFakeGuiTableRow
' Duble do objeto retornado por GuiTableControl.GetAbsoluteRow(row) -
' expoe Selected (get/let), lendo/escrevendo no dicionario de selecao
' compartilhado com clsFakeGuiTableControl. Vive em Tests/, nao faz
' parte do Framework entregue ao usuario final.
'==========================================================

Private mStore As Object   ' Scripting.Dictionary, compartilhado com a tabela dona
Private mKey As String
Private mFailOnSelectedLet As Boolean

Public Sub Init(ByVal Store As Object, ByVal Key As String, Optional ByVal FailOnSelectedLet As Boolean = False)
    Set mStore = Store
    mKey = Key
    mFailOnSelectedLet = FailOnSelectedLet
    If Not mStore.Exists(mKey) Then mStore(mKey) = False
End Sub

Public Property Get Selected() As Boolean
    Selected = mStore(mKey)
End Property

Public Property Let Selected(ByVal Value As Boolean)
    If mFailOnSelectedLet Then
        Err.Raise 615, "SAP GUI Scripting", "Elemento de tela nao pode ser alterado no momento."
    End If
    mStore(mKey) = Value
End Property
