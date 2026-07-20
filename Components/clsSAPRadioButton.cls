VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "clsSAPRadioButton"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

'==========================================================
' clsSAPRadioButton
' Wrapper tipado sobre GuiRadioButton. Recebe o componente nativo ja
' resolvido pelo Core (clsSAPSession.GetComponent, via
' clsSAP.TypedRadioButton) e adiciona:
'   - validacao de tipo (falha cedo se o Id nao apontar para um
'     GuiRadioButton);
'   - Select(), atalho de intencao clara para marcar a opcao (ao
'     contrario de checkbox, radio button normalmente so faz sentido
'     selecionar, nunca desmarcar isoladamente - a troca de opcao
'     dentro do grupo e responsabilidade do SAP).
'
' Nunca chama FindById diretamente (Components/README.md,
' diretriz 3) - so recebe objetos ja resolvidos pelo Core.
'==========================================================

Private mNative As Object          ' GuiRadioButton
Private mFieldId As String

Private Const CLASS_NAME As String = "clsSAPRadioButton"
Private Const VALID_TYPE As String = "GuiRadioButton"

' Associa o wrapper a um componente nativo ja resolvido pelo Core.
' Valida o Type do componente e lanca clsSAPException clara se o
' objeto passado nao for um GuiRadioButton. Chame antes de usar
' qualquer outro membro.
Public Sub Init(ByVal NativeComponent As Object, Optional ByVal FieldId As String = "")

    If NativeComponent Is Nothing Then
        RaiseRadioButtonError 0, "Componente nativo nulo passado para clsSAPRadioButton.Init.", "Init", FieldId
    End If

    Dim actualType As String
    On Error GoTo ErrHandler
    actualType = NativeComponent.Type
    On Error GoTo 0

    If actualType <> VALID_TYPE Then
        RaiseRadioButtonError 0, "Componente '" & FieldId & "' nao e um radio button (esperado " & _
                              VALID_TYPE & ", encontrado '" & actualType & "'). " & _
                              "Use o wrapper correto para esse tipo de componente.", "Init", FieldId
    End If

    Set mNative = NativeComponent
    mFieldId = FieldId
    Exit Sub

ErrHandler:
    HandleError Err, "Init"

End Sub

Public Property Get Id() As String
    Id = mFieldId
End Property

' Escape hatch: acesso ao objeto GUI nativo para operacoes raras
' nao cobertas pelo wrapper.
Public Function NativeObject() As Object
    Set NativeObject = mNative
End Function

Public Property Get Text() As String
    On Error GoTo ErrHandler
    Text = mNative.Text
    Exit Property
ErrHandler:
    HandleError Err, "Text"
End Property

Public Property Get Tooltip() As String
    On Error GoTo ErrHandler
    Tooltip = mNative.Tooltip
    Exit Property
ErrHandler:
    HandleError Err, "Tooltip"
End Property

Public Property Get IsChangeable() As Boolean
    On Error GoTo ErrHandler
    IsChangeable = mNative.Changeable
    Exit Property
ErrHandler:
    HandleError Err, "IsChangeable"
End Property

Public Property Get Selected() As Boolean
    On Error GoTo ErrHandler
    Selected = mNative.Selected
    Exit Property
ErrHandler:
    HandleError Err, "Selected (get)"
End Property

Public Property Let Selected(ByVal Value As Boolean)
    On Error GoTo ErrHandler
    mNative.Selected = Value
    Exit Property
ErrHandler:
    HandleError Err, "Selected (let)"
End Property

' Atalho de intencao clara para marcar esta opcao do grupo.
Public Sub Select()
    Me.Selected = True
End Sub

' Formata o radio button para exibicao em log/imediato, no mesmo
' espirito de clsSAPException.ToString().
Public Function ToString() As String
    If mNative Is Nothing Then
        ToString = "[clsSAPRadioButton] (nao inicializado)"
    Else
        ToString = "[clsSAPRadioButton] Id=" & mFieldId & " Selected=" & mNative.Selected
    End If
End Function

' ---------- Infraestrutura interna ----------

Private Sub HandleError(ByVal SourceErr As ErrObject, ByVal MethodName As String)
    Dim ex As New clsSAPException
    ex.Init SourceErr.Number, SourceErr.Description, CLASS_NAME, MethodName, , mFieldId
    ex.Raise
End Sub

Private Sub RaiseRadioButtonError(ByVal Number As Long, ByVal Description As String, _
                                    ByVal MethodName As String, ByVal FieldId As String)
    Dim ex As New clsSAPException
    ex.Init Number, Description, CLASS_NAME, MethodName, , FieldId
    ex.Raise
End Sub
