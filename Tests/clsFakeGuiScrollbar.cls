VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "clsFakeGuiScrollbar"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

'==========================================================
' clsFakeGuiScrollbar
' Duble minimo de GuiScrollbar (Position, Minimum=0, Maximum), com o
' mesmo comportamento de clamp de um scrollbar real: atribuir um
' Position fora de [Minimum, Maximum] e silenciosamente ajustado para
' o limite mais proximo. Usado por clsFakeGuiTableControl para simular
' VerticalScrollbar. Vive em Tests/, nao faz parte do Framework
' entregue ao usuario final.
'==========================================================

Private mPosition As Long
Private mMaximum As Long

Public Property Get Position() As Long
    Position = mPosition
End Property

Public Property Let Position(ByVal Value As Long)
    If Value < 0 Then
        mPosition = 0
    ElseIf Value > mMaximum Then
        mPosition = mMaximum
    Else
        mPosition = Value
    End If
End Property

Public Property Get Minimum() As Long
    Minimum = 0
End Property

Public Property Get Maximum() As Long
    Maximum = mMaximum
End Property

Public Property Let Maximum(ByVal Value As Long)
    If Value < 0 Then Value = 0
    mMaximum = Value
    If mPosition > mMaximum Then mPosition = mMaximum
End Property
