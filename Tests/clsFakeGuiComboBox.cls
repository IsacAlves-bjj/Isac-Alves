VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "clsFakeGuiComboBox"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

'==========================================================
' clsFakeGuiComboBox
' Duble de teste que imita a interface minima de um GuiComboBox do
' SAP GUI Scripting (Type, Key, Text, Changeable, Entries). Usado
' apenas em M_Test_Components para testar clsSAPComboBox sem
' depender de uma sessao SAP real.
'
' Vem pre-carregado com 3 entradas (01/Ordem normal, 02/Ordem urgente,
' 03/Ordem de amostra) para os testes terem dado para ler.
'
' Nao faz parte do Framework entregue ao usuario final - vive em
' Tests/ e so deve ser importado junto com os testes.
'==========================================================

Private mType As String
Private mKey As String
Private mChangeable As Boolean
Private mEntries As Collection
Private mFailOnKeyLet As Boolean

Private Sub Class_Initialize()
    mType = "GuiComboBox"
    mChangeable = True
    Set mEntries = New Collection

    AddEntry "01", "Ordem normal"
    AddEntry "02", "Ordem urgente"
    AddEntry "03", "Ordem de amostra"

    mKey = "01"
End Sub

Public Property Get Type() As String
    Type = mType
End Property

Public Property Let Type(ByVal Value As String)
    mType = Value
End Property

Public Property Get Key() As String
    Key = mKey
End Property

Public Property Let Key(ByVal Value As String)
    If mFailOnKeyLet Then
        Err.Raise 615, "SAP GUI Scripting", "Elemento de tela nao pode ser alterado no momento."
    End If
    mKey = Value
End Property

' Reflete o Value da entrada correspondente a Key atual, como o SAP
' GUI Scripting faz de fato (Text acompanha a selecao).
Public Property Get Text() As String
    Dim entry As Object
    For Each entry In mEntries
        If entry.Key = mKey Then
            Text = entry.Value
            Exit Property
        End If
    Next entry
End Property

Public Property Get Changeable() As Boolean
    Changeable = mChangeable
End Property

Public Property Let Changeable(ByVal Value As Boolean)
    mChangeable = Value
End Property

Public Property Get Entries() As Collection
    Set Entries = mEntries
End Property

' Quando True, simula uma falha de COM ao tentar alterar Key (ex.:
' combo box desabilitado na tela atual), para testar o tratamento
' de erro.
Public Property Let FailOnKeyLet(ByVal Value As Boolean)
    mFailOnKeyLet = Value
End Property

Public Sub AddEntry(ByVal EntryKey As String, ByVal EntryValue As String)
    Dim entry As New clsFakeGuiComboBoxEntry
    entry.Key = EntryKey
    entry.Value = EntryValue
    mEntries.Add entry
End Sub
