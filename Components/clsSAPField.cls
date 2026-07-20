VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "clsSAPField"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

'==========================================================
' clsSAPField
' Wrapper tipado sobre campos de texto do SAP GUI Scripting
' (GuiTextField, GuiCTextField). Recebe o componente nativo ja
' resolvido pelo Core (clsSAPSession.GetComponent, via
' clsSAP.TypedField) e adiciona por cima dele:
'   - validacao de tipo (falha cedo e com mensagem clara se o
'     Id apontar para outro tipo de componente, ex.: um botao);
'   - erro amigavel ao tentar escrever em campo desabilitado,
'     em vez do erro criptico de COM que o SAP GUI Scripting
'     lanca nesse caso;
'   - atalhos comuns (Clear, IsEmpty, SetFocus, MaxLength...).
'
' Nunca chama FindById diretamente (Components/README.md,
' diretriz 3) - so recebe objetos ja resolvidos pelo Core.
'==========================================================

Private mNative As Object          ' GuiTextField / GuiCTextField
Private mFieldId As String

Private Const CLASS_NAME As String = "clsSAPField"
Private Const VALID_TYPE_1 As String = "GuiTextField"
Private Const VALID_TYPE_2 As String = "GuiCTextField"

' Associa o wrapper a um componente nativo ja resolvido pelo Core.
' Valida o Type do componente e lanca clsSAPException clara se o
' objeto passado nao for um campo de texto suportado (GuiTextField
' ou GuiCTextField). Chame antes de usar qualquer outro membro.
Public Sub Init(ByVal NativeComponent As Object, Optional ByVal FieldId As String = "")

    ' As validacoes abaixo lancam clsSAPException diretamente (sem um
    ' On Error GoTo ativo por cima), para nao serem reembrulhadas pelo
    ' ErrHandler generico deste mesmo metodo. So o acesso ao objeto
    ' nativo (que pode lancar erro cru de COM) passa pelo handler.
    If NativeComponent Is Nothing Then
        RaiseFieldError 0, "Componente nativo nulo passado para clsSAPField.Init.", "Init", FieldId
    End If

    Dim actualType As String
    On Error GoTo ErrHandler
    actualType = NativeComponent.Type
    On Error GoTo 0

    If actualType <> VALID_TYPE_1 And actualType <> VALID_TYPE_2 Then
        RaiseFieldError 0, "Componente '" & FieldId & "' nao e um campo de texto (esperado " & _
                         VALID_TYPE_1 & " ou " & VALID_TYPE_2 & ", encontrado '" & actualType & "'). " & _
                         "Use o wrapper correto para esse tipo de componente.", _
                         "Init", FieldId
    End If

    Set mNative = NativeComponent
    mFieldId = FieldId
    Exit Sub

ErrHandler:
    HandleError Err, "Init"

End Sub

' Id de tela usado para resolver este campo (o mesmo passado a
' clsSAP.TypedField). Util para mensagens de log/erro no codigo
' do usuario.
Public Property Get Id() As String
    Id = mFieldId
End Property

' Escape hatch: acesso ao objeto GUI nativo para operacoes raras
' nao cobertas pelo wrapper. Prefira os membros tipados sempre
' que possivel - isso e so uma valvula de escape.
Public Function NativeObject() As Object
    Set NativeObject = mNative
End Function

Public Property Get Text() As String
    On Error GoTo ErrHandler
    Text = mNative.Text
    Exit Property
ErrHandler:
    HandleError Err, "Text (get)"
End Property

' Preenche o campo. Valida antes que o campo esteja habilitado
' para edicao, transformando o erro criptico de COM que o SAP GUI
' Scripting lanca em campo desabilitado/somente-leitura em um
' clsSAPException com mensagem clara.
Public Property Let Text(ByVal Value As String)
    Dim changeable As Boolean
    On Error GoTo ErrHandler
    changeable = mNative.Changeable
    On Error GoTo 0

    ' Lancado com o handler desligado, para nao ser reembrulhado por
    ' engano logo abaixo (mesmo raciocinio do Init).
    If Not changeable Then
        RaiseFieldError 0, "Campo '" & mFieldId & "' nao esta habilitado para edicao " & _
                         "(somente leitura ou desabilitado na tela atual).", "Text (let)", mFieldId
    End If

    On Error GoTo ErrHandler
    mNative.Text = Value
    Exit Property

ErrHandler:
    HandleError Err, "Text (let)"
End Property

' Indica se o campo aceita edicao na tela atual. Util para validar
' antes de escrever em vez de descobrir via excecao.
Public Property Get IsChangeable() As Boolean
    On Error GoTo ErrHandler
    IsChangeable = mNative.Changeable
    Exit Property
ErrHandler:
    HandleError Err, "IsChangeable"
End Property

' Indica se o campo e obrigatorio (marcado pelo SAP como mandatory
' na tela atual).
Public Property Get IsRequired() As Boolean
    On Error GoTo ErrHandler
    IsRequired = mNative.Required
    Exit Property
ErrHandler:
    HandleError Err, "IsRequired"
End Property

' Tamanho maximo aceito pelo campo.
Public Property Get MaxLength() As Long
    On Error GoTo ErrHandler
    MaxLength = mNative.MaxLength
    Exit Property
ErrHandler:
    HandleError Err, "MaxLength"
End Property

Public Property Get Tooltip() As String
    On Error GoTo ErrHandler
    Tooltip = mNative.Tooltip
    Exit Property
ErrHandler:
    HandleError Err, "Tooltip"
End Property

' Atalho para "o campo esta vazio (ou so tem espacos)?", evitando
' Trim/Len repetido no codigo de automacao.
Public Function IsEmpty() As Boolean
    On Error GoTo ErrHandler
    IsEmpty = (Len(Trim$(mNative.Text)) = 0)
    Exit Function
ErrHandler:
    HandleError Err, "IsEmpty"
End Function

' Limpa o conteudo do campo. Reaproveita a mesma validacao de
' Changeable usada em Text (let).
Public Sub Clear()
    On Error GoTo ErrHandler
    Me.Text = ""
    Exit Sub
ErrHandler:
    HandleError Err, "Clear"
End Sub

Public Sub SetFocus()
    On Error GoTo ErrHandler
    mNative.SetFocus
    Exit Sub
ErrHandler:
    HandleError Err, "SetFocus"
End Sub

' Formata o campo para exibicao em log/imediato, no mesmo espirito
' de clsSAPException.ToString().
Public Function ToString() As String
    If mNative Is Nothing Then
        ToString = "[clsSAPField] (nao inicializado)"
    Else
        ToString = "[clsSAPField] Id=" & mFieldId & " Text=" & mNative.Text
    End If
End Function

' ---------- Infraestrutura interna ----------

Private Sub HandleError(ByVal SourceErr As ErrObject, ByVal MethodName As String)
    Dim ex As New clsSAPException
    ex.Init SourceErr.Number, SourceErr.Description, CLASS_NAME, MethodName, , mFieldId
    ex.Raise
End Sub

Private Sub RaiseFieldError(ByVal Number As Long, ByVal Description As String, _
                              ByVal MethodName As String, ByVal FieldId As String)
    Dim ex As New clsSAPException
    ex.Init Number, Description, CLASS_NAME, MethodName, , FieldId
    ex.Raise
End Sub
