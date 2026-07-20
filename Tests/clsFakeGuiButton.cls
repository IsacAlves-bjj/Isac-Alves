VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "clsFakeGuiButton"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

'==========================================================
' clsFakeGuiButton
' Duble de teste que imita a interface minima de um GuiButton do
' SAP GUI Scripting (Type, Text, Tooltip, Emphasized, Press). Usado
' apenas em M_Test_Components para testar clsSAPButton sem depender
' de uma sessao SAP real.
'
' Nao faz parte do Framework entregue ao usuario final - vive em
' Tests/ e so deve ser importado junto com os testes.
'==========================================================

Private mType As String
Private mText As String
Private mTooltip As String
Private mEmphasized As Boolean
Private mPressCalls As Long
Private mFailOnPress As Boolean

Private Sub Class_Initialize()
    mType = "GuiButton"
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

Public Property Get Emphasized() As Boolean
    Emphasized = mEmphasized
End Property

Public Property Let Emphasized(ByVal Value As Boolean)
    mEmphasized = Value
End Property

' Quando True, simula uma falha de COM ao chamar Press (ex.: botao
' desabilitado na tela atual), para testar o tratamento de erro.
Public Property Let FailOnPress(ByVal Value As Boolean)
    mFailOnPress = Value
End Property

Public Sub Press()
    If mFailOnPress Then
        Err.Raise 615, "SAP GUI Scripting", "Elemento de tela nao pode ser acionado no momento."
    End If
    mPressCalls = mPressCalls + 1
End Sub

Public Property Get PressCalls() As Long
    PressCalls = mPressCalls
End Property
