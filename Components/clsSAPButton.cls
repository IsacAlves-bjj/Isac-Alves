VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "clsSAPButton"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

'==========================================================
' clsSAPButton
' Wrapper tipado sobre GuiButton. Componente simples, mas de altissimo
' volume de uso (confirmar popups, salvar, avancar telas) - por isso
' entra logo apos clsSAPField/clsSAPGrid, apesar de nao ser o mais
' verboso via scripting cru.
'
' Recebe o componente nativo ja resolvido pelo Core
' (clsSAPSession.GetComponent, via clsSAP.TypedButton) e adiciona:
'   - validacao de tipo (falha cedo e com mensagem clara se o Id
'     apontar para outro tipo de componente, ex.: um campo de texto
'     clicado por engano);
'   - Press() com erro padronizado em vez de erro cru de COM.
'
' Nunca chama FindById diretamente (Components/README.md,
' diretriz 3) - so recebe objetos ja resolvidos pelo Core.
'==========================================================

Private mNative As Object          ' GuiButton
Private mFieldId As String

Private Const CLASS_NAME As String = "clsSAPButton"
Private Const VALID_TYPE As String = "GuiButton"

' Associa o wrapper a um componente nativo ja resolvido pelo Core.
' Valida o Type do componente e lanca clsSAPException clara se o
' objeto passado nao for um GuiButton. Chame antes de usar qualquer
' outro membro.
Public Sub Init(ByVal NativeComponent As Object, Optional ByVal FieldId As String = "")

    If NativeComponent Is Nothing Then
        RaiseButtonError 0, "Componente nativo nulo passado para clsSAPButton.Init.", "Init", FieldId
    End If

    Dim actualType As String
    On Error GoTo ErrHandler
    actualType = NativeComponent.Type
    On Error GoTo 0

    If actualType <> VALID_TYPE Then
        RaiseButtonError 0, "Componente '" & FieldId & "' nao e um botao (esperado " & _
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

' Rotulo exibido no botao.
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

' Indica se este e o botao em destaque (emphasized) da tela - o que
' o Enter aciona por padrao (ex.: "Continuar" em popups). Util para
' automacoes genericas que precisam confirmar um popup sem saber de
' antemao qual botao e o principal.
Public Property Get IsDefault() As Boolean
    On Error GoTo ErrHandler
    IsDefault = mNative.Emphasized
    Exit Property
ErrHandler:
    HandleError Err, "IsDefault"
End Property

' Aciona o botao (equivalente a clicar nele).
Public Sub Press()
    On Error GoTo ErrHandler
    mNative.Press
    Exit Sub
ErrHandler:
    HandleError Err, "Press"
End Sub

' Formata o botao para exibicao em log/imediato, no mesmo espirito de
' clsSAPException.ToString().
Public Function ToString() As String
    If mNative Is Nothing Then
        ToString = "[clsSAPButton] (nao inicializado)"
    Else
        ToString = "[clsSAPButton] Id=" & mFieldId & " Text=" & mNative.Text
    End If
End Function

' ---------- Infraestrutura interna ----------

Private Sub HandleError(ByVal SourceErr As ErrObject, ByVal MethodName As String)
    Dim ex As New clsSAPException
    ex.Init SourceErr.Number, SourceErr.Description, CLASS_NAME, MethodName, , mFieldId
    ex.Raise
End Sub

Private Sub RaiseButtonError(ByVal Number As Long, ByVal Description As String, _
                               ByVal MethodName As String, ByVal FieldId As String)
    Dim ex As New clsSAPException
    ex.Init Number, Description, CLASS_NAME, MethodName, , FieldId
    ex.Raise
End Sub
