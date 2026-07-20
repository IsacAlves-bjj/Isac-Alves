VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "clsFakeGuiTab"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

'==========================================================
' clsFakeGuiTab
' Duble de teste que imita a interface minima de um GuiTab do SAP
' GUI Scripting (Type, Text, Tooltip, Selected somente leitura,
' Select). Usado apenas em M_Test_Components para testar clsSAPTab
' sem depender de uma sessao SAP real.
'
' Nao faz parte do Framework entregue ao usuario final - vive em
' Tests/ e so deve ser importado junto com os testes.
'==========================================================

Private mType As String
Private mText As String
Private mTooltip As String
Private mSelected As Boolean
Private mSelectCalls As Long
Private mFailOnSelect As Boolean

Private Sub Class_Initialize()
    mType = "GuiTab"
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

' Somente leitura na API real do SAP GUI Scripting (a fixture
' permite Let para preparar o estado inicial em teste, ex.: simular
' que esta ja e a aba ativa antes de qualquer Select()).
Public Property Get Selected() As Boolean
    Selected = mSelected
End Property

Public Property Let Selected(ByVal Value As Boolean)
    mSelected = Value
End Property

' Quando True, simula uma falha de COM ao chamar Select (ex.: aba
' desabilitada na tela atual), para testar o tratamento de erro.
Public Property Let FailOnSelect(ByVal Value As Boolean)
    mFailOnSelect = Value
End Property

Public Sub Select()
    If mFailOnSelect Then
        Err.Raise 615, "SAP GUI Scripting", "Elemento de tela nao pode ser acionado no momento."
    End If
    mSelected = True
    mSelectCalls = mSelectCalls + 1
End Sub

Public Property Get SelectCalls() As Long
    SelectCalls = mSelectCalls
End Property
