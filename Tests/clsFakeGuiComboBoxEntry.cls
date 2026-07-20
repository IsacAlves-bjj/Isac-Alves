VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "clsFakeGuiComboBoxEntry"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

'==========================================================
' clsFakeGuiComboBoxEntry
' Duble de teste que imita a interface minima de um
' GuiComboBoxEntry do SAP GUI Scripting (Key, Value). Usado apenas
' para popular a colecao Entries de clsFakeGuiComboBox.
'
' Nao faz parte do Framework entregue ao usuario final - vive em
' Tests/ e so deve ser importado junto com os testes.
'==========================================================

Private mKey As String
Private mValue As String

Public Property Get Key() As String
    Key = mKey
End Property

Public Property Let Key(ByVal Value As String)
    mKey = Value
End Property

Public Property Get Value() As String
    Value = mValue
End Property

Public Property Let Value(ByVal NewValue As String)
    mValue = NewValue
End Property
