VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "clsSAPTab"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

'==========================================================
' clsSAPTab
' Wrapper tipado sobre GuiTab (uma aba individual dentro de um
' GuiTabStrip). Recebe o componente nativo ja resolvido pelo Core
' (clsSAPSession.GetComponent, via clsSAP.TypedTab) e adiciona:
'   - validacao de tipo (falha cedo se o Id nao apontar para um
'     GuiTab);
'   - Select(), atalho de intencao clara para ativar a aba.
'
' Nota de implementacao importante: diferente de clsSAPCheckBox/
' clsSAPRadioButton, aqui Selected e somente leitura - reflete se
' esta e a aba atualmente ativa, mas o SAP GUI Scripting nao permite
' ativar uma aba atribuindo Selected = True. Para ativar, use
' Select(), que chama o metodo nativo GuiTab.Select (nao uma
' property let).
'
' Nunca chama FindById diretamente (Components/README.md,
' diretriz 3) - so recebe objetos ja resolvidos pelo Core.
'==========================================================

Private mNative As Object          ' GuiTab
Private mFieldId As String

Private Const CLASS_NAME As String = "clsSAPTab"
Private Const VALID_TYPE As String = "GuiTab"

' Associa o wrapper a um componente nativo ja resolvido pelo Core.
' Valida o Type do componente e lanca clsSAPException clara se o
' objeto passado nao for um GuiTab. Chame antes de usar qualquer
' outro membro.
Public Sub Init(ByVal NativeComponent As Object, Optional ByVal FieldId As String = "")

    If NativeComponent Is Nothing Then
        RaiseTabError 0, "Componente nativo nulo passado para clsSAPTab.Init.", "Init", FieldId
    End If

    Dim actualType As String
    On Error GoTo ErrHandler
    actualType = NativeComponent.Type
    On Error GoTo 0

    If actualType <> VALID_TYPE Then
        RaiseTabError 0, "Componente '" & FieldId & "' nao e uma aba (esperado " & _
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

' Somente leitura: reflete se esta e a aba atualmente ativa dentro
' do GuiTabStrip. Para ativar a aba, use Select().
Public Property Get Selected() As Boolean
    On Error GoTo ErrHandler
    Selected = mNative.Selected
    Exit Property
ErrHandler:
    HandleError Err, "Selected (get)"
End Property

' Atalho de intencao clara para ativar esta aba (chama o metodo
' nativo GuiTab.Select, ja que Selected e somente leitura aqui).
Public Sub Select()
    On Error GoTo ErrHandler
    mNative.Select
    Exit Sub
ErrHandler:
    HandleError Err, "Select"
End Sub

' Formata a aba para exibicao em log/imediato, no mesmo espirito de
' clsSAPException.ToString().
Public Function ToString() As String
    If mNative Is Nothing Then
        ToString = "[clsSAPTab] (nao inicializado)"
    Else
        ToString = "[clsSAPTab] Id=" & mFieldId & " Text=" & mNative.Text & " Selected=" & mNative.Selected
    End If
End Function

' ---------- Infraestrutura interna ----------

Private Sub HandleError(ByVal SourceErr As ErrObject, ByVal MethodName As String)
    Dim ex As New clsSAPException
    ex.Init SourceErr.Number, SourceErr.Description, CLASS_NAME, MethodName, , mFieldId
    ex.Raise
End Sub

Private Sub RaiseTabError(ByVal Number As Long, ByVal Description As String, _
                            ByVal MethodName As String, ByVal FieldId As String)
    Dim ex As New clsSAPException
    ex.Init Number, Description, CLASS_NAME, MethodName, , FieldId
    ex.Raise
End Sub
