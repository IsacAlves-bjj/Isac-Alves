VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "clsSAPCheckBox"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

'==========================================================
' clsSAPCheckBox
' Wrapper tipado sobre GuiCheckBox. Recebe o componente nativo ja
' resolvido pelo Core (clsSAPSession.GetComponent, via
' clsSAP.TypedCheckBox) e adiciona:
'   - validacao de tipo (falha cedo se o Id nao apontar para um
'     GuiCheckBox);
'   - atalhos de intencao clara (Check/Uncheck/Toggle) em vez de
'     manipular Selected diretamente.
'
' Nunca chama FindById diretamente (Components/README.md,
' diretriz 3) - so recebe objetos ja resolvidos pelo Core.
'==========================================================

Private mNative As Object          ' GuiCheckBox
Private mFieldId As String

Private Const CLASS_NAME As String = "clsSAPCheckBox"
Private Const VALID_TYPE As String = "GuiCheckBox"

' Associa o wrapper a um componente nativo ja resolvido pelo Core.
' Valida o Type do componente e lanca clsSAPException clara se o
' objeto passado nao for um GuiCheckBox. Chame antes de usar qualquer
' outro membro.
Public Sub Init(ByVal NativeComponent As Object, Optional ByVal FieldId As String = "")

    If NativeComponent Is Nothing Then
        RaiseCheckBoxError 0, "Componente nativo nulo passado para clsSAPCheckBox.Init.", "Init", FieldId
    End If

    Dim actualType As String
    On Error GoTo ErrHandler
    actualType = NativeComponent.Type
    On Error GoTo 0

    If actualType <> VALID_TYPE Then
        RaiseCheckBoxError 0, "Componente '" & FieldId & "' nao e uma caixa de selecao (esperado " & _
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

' Atalhos de intencao clara, para nao espalhar ".Selected = True/False"
' pelo codigo de automacao.
Public Sub Check()
    Me.Selected = True
End Sub

Public Sub Uncheck()
    Me.Selected = False
End Sub

Public Sub Toggle()
    Me.Selected = Not Me.Selected
End Sub

' Formata a caixa de selecao para exibicao em log/imediato, no mesmo
' espirito de clsSAPException.ToString().
Public Function ToString() As String
    If mNative Is Nothing Then
        ToString = "[clsSAPCheckBox] (nao inicializado)"
    Else
        ToString = "[clsSAPCheckBox] Id=" & mFieldId & " Selected=" & mNative.Selected
    End If
End Function

' ---------- Infraestrutura interna ----------

Private Sub HandleError(ByVal SourceErr As ErrObject, ByVal MethodName As String)
    Dim ex As New clsSAPException
    ex.Init SourceErr.Number, SourceErr.Description, CLASS_NAME, MethodName, , mFieldId
    ex.Raise
End Sub

Private Sub RaiseCheckBoxError(ByVal Number As Long, ByVal Description As String, _
                                 ByVal MethodName As String, ByVal FieldId As String)
    Dim ex As New clsSAPException
    ex.Init Number, Description, CLASS_NAME, MethodName, , FieldId
    ex.Raise
End Sub
