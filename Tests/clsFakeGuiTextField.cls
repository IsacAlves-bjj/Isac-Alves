VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "clsFakeGuiTextField"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

'==========================================================
' clsFakeGuiTextField
' Duble de teste que imita a interface minima de um GuiTextField/
' GuiCTextField do SAP GUI Scripting (Type, Text, Changeable,
' Required, MaxLength, Tooltip, SetFocus). Usado apenas em
' M_Test_Components para testar clsSAPField sem depender de uma
' sessao SAP real - o wrapper acessa os membros por late binding
' (As Object), entao qualquer objeto com essa interface serve.
'
' Nao faz parte do Framework entregue ao usuario final - vive em
' Tests/ e so deve ser importado junto com os testes.
'==========================================================

Private mType As String
Private mText As String
Private mChangeable As Boolean
Private mRequired As Boolean
Private mMaxLength As Long
Private mTooltip As String
Private mSetFocusCalls As Long

Private Sub Class_Initialize()
    mType = "GuiTextField"
    mChangeable = True
    mMaxLength = 132
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

Public Property Get Changeable() As Boolean
    Changeable = mChangeable
End Property

Public Property Let Changeable(ByVal Value As Boolean)
    mChangeable = Value
End Property

Public Property Get Required() As Boolean
    Required = mRequired
End Property

Public Property Let Required(ByVal Value As Boolean)
    mRequired = Value
End Property

Public Property Get MaxLength() As Long
    MaxLength = mMaxLength
End Property

Public Property Let MaxLength(ByVal Value As Long)
    mMaxLength = Value
End Property

Public Property Get Tooltip() As String
    Tooltip = mTooltip
End Property

Public Property Let Tooltip(ByVal Value As String)
    mTooltip = Value
End Property

Public Sub SetFocus()
    mSetFocusCalls = mSetFocusCalls + 1
End Sub

Public Property Get SetFocusCalls() As Long
    SetFocusCalls = mSetFocusCalls
End Property
