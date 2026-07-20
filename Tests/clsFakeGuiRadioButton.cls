VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "clsFakeGuiRadioButton"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

'==========================================================
' clsFakeGuiRadioButton
' Duble de teste que imita a interface minima de um GuiRadioButton do
' SAP GUI Scripting (Type, Text, Tooltip, Changeable, Selected).
' Usado apenas em M_Test_Components para testar clsSAPRadioButton sem
' depender de uma sessao SAP real.
'
' Nao faz parte do Framework entregue ao usuario final - vive em
' Tests/ e so deve ser importado junto com os testes.
'==========================================================

Private mType As String
Private mText As String
Private mTooltip As String
Private mChangeable As Boolean
Private mSelected As Boolean
Private mFailOnSelectedLet As Boolean

Private Sub Class_Initialize()
    mType = "GuiRadioButton"
    mChangeable = True
End Sub

Public Property Get Type() As String
    Type = mType
End Property

Public Property Let Type(ByVal Value As String)
    mType = Value
End Property

Public Property Get Text() As String
    Text = mText
End Property

Public Property Let Text(ByVal Value As String)
    mText = Value
End Property

Public Property Get Tooltip() As String
    Tooltip = mTooltip
End Property

Public Property Let Tooltip(ByVal Value As String)
    mTooltip = Value
End Property

Public Property Get Changeable() As Boolean
    Changeable = mChangeable
End Property

Public Property Let Changeable(ByVal Value As Boolean)
    mChangeable = Value
End Property

Public Property Get Selected() As Boolean
    Selected = mSelected
End Property

Public Property Let Selected(ByVal Value As Boolean)
    If mFailOnSelectedLet Then
        Err.Raise 615, "SAP GUI Scripting", "Elemento de tela nao pode ser alterado no momento."
    End If
    mSelected = Value
End Property

' Quando True, simula uma falha de COM ao tentar alterar Selected
' (ex.: opcao desabilitada na tela atual), para testar o tratamento
' de erro.
Public Property Let FailOnSelectedLet(ByVal Value As Boolean)
    mFailOnSelectedLet = Value
End Property
