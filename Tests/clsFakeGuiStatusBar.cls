VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "clsFakeGuiStatusBar"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

'==========================================================
' clsFakeGuiStatusBar
' Duble de teste que imita a interface minima de uma GuiStatusbar do
' SAP GUI Scripting (Type, Text, MessageType). Usado apenas em
' M_Test_Components para testar clsSAPStatusBar sem depender de uma
' sessao SAP real.
'
' Nao faz parte do Framework entregue ao usuario final - vive em
' Tests/ e so deve ser importado junto com os testes.
'==========================================================

Private mType As String
Private mText As String
Private mMessageType As String

Private Sub Class_Initialize()
    mType = "GuiStatusbar"
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

Public Property Get MessageType() As String
    MessageType = mMessageType
End Property

Public Property Let MessageType(ByVal Value As String)
    mMessageType = Value
End Property
