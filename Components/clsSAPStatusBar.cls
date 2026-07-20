VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "clsSAPStatusBar"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

'==========================================================
' clsSAPStatusBar
' Wrapper tipado sobre GuiStatusbar (a barra de mensagens no rodape
' da janela SAP, "wnd[0]/sbar"). Provavelmente o wrapper de maior
' valor pratico para automacoes robustas: permite checar se uma acao
' (Execute, Press, etc.) produziu erro/aviso, em vez de assumir que
' deu certo e so descobrir o problema mais adiante no script.
'
' Recebe o componente nativo ja resolvido pelo Core
' (clsSAPSession.GetComponent, via clsSAP.TypedStatusBar) e adiciona:
'   - validacao de tipo;
'   - IsError/IsWarning/IsSuccess/HasMessage, em vez de comparar
'     MessageType manualmente contra "E"/"W"/"S" pelo codigo todo.
'
' Nota de implementacao: diferente dos demais componentes do SAP GUI
' Scripting (que seguem PascalCase - "GuiTextField", "GuiButton"...),
' o Type nativo da barra de status e "GuiStatusbar" (com "b"
' minusculo) - uma inconsistencia conhecida da propria API do SAP,
' nao um erro de digitacao aqui. Caso a validacao de tipo falhe
' inesperadamente em algum ambiente, confirme o Type exato via
' NativeObject().Type antes de reportar bug.
'
' Cobertura desta versao: Text, MessageType e os atalhos booleanos
' derivados dele. MessageId/MessageNumber/MessageParameter (uteis
' para identificar uma mensagem especifica de forma programatica)
' ainda nao estao cobertos - ver Components/README.md.
'
' Nunca chama FindById diretamente (Components/README.md,
' diretriz 3) - so recebe objetos ja resolvidos pelo Core.
'==========================================================

Private mNative As Object          ' GuiStatusbar
Private mFieldId As String

Private Const CLASS_NAME As String = "clsSAPStatusBar"
Private Const VALID_TYPE As String = "GuiStatusbar"

' Associa o wrapper a um componente nativo ja resolvido pelo Core.
' Valida o Type do componente e lanca clsSAPException clara se o
' objeto passado nao for uma GuiStatusbar. Chame antes de usar
' qualquer outro membro.
Public Sub Init(ByVal NativeComponent As Object, Optional ByVal FieldId As String = "")

    If NativeComponent Is Nothing Then
        RaiseStatusBarError 0, "Componente nativo nulo passado para clsSAPStatusBar.Init.", "Init", FieldId
    End If

    Dim actualType As String
    On Error GoTo ErrHandler
    actualType = NativeComponent.Type
    On Error GoTo 0

    If actualType <> VALID_TYPE Then
        RaiseStatusBarError 0, "Componente '" & FieldId & "' nao e uma barra de status (esperado " & _
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

' Escape hatch: acesso ao objeto GUI nativo para operacoes raras nao
' cobertas pelo wrapper (ex.: MessageId/MessageNumber/MessageParameter).
Public Function NativeObject() As Object
    Set NativeObject = mNative
End Function

' Texto completo da mensagem exibida no momento.
Public Property Get Text() As String
    On Error GoTo ErrHandler
    Text = mNative.Text
    Exit Property
ErrHandler:
    HandleError Err, "Text"
End Property

' Tipo cru da mensagem, conforme o SAP: "S" (sucesso), "W" (aviso),
' "E" (erro), "A" (encerramento/abort), "I" (informacao). Prefira os
' atalhos IsError/IsWarning/IsSuccess quando possivel.
Public Property Get MessageType() As String
    On Error GoTo ErrHandler
    MessageType = mNative.MessageType
    Exit Property
ErrHandler:
    HandleError Err, "MessageType"
End Property

Public Function IsError() As Boolean
    IsError = (Me.MessageType = "E") Or (Me.MessageType = "A")
End Function

Public Function IsWarning() As Boolean
    IsWarning = (Me.MessageType = "W")
End Function

Public Function IsSuccess() As Boolean
    IsSuccess = (Me.MessageType = "S")
End Function

' Indica se ha alguma mensagem exibida no momento (a barra fica vazia
' na maior parte do tempo).
Public Function HasMessage() As Boolean
    HasMessage = (Len(Me.Text) > 0)
End Function

' Formata a barra de status para exibicao em log/imediato, no mesmo
' espirito de clsSAPException.ToString().
Public Function ToString() As String
    If mNative Is Nothing Then
        ToString = "[clsSAPStatusBar] (nao inicializado)"
    Else
        ToString = "[clsSAPStatusBar] Tipo=" & mNative.MessageType & " Texto=" & mNative.Text
    End If
End Function

' ---------- Infraestrutura interna ----------

Private Sub HandleError(ByVal SourceErr As ErrObject, ByVal MethodName As String)
    Dim ex As New clsSAPException
    ex.Init SourceErr.Number, SourceErr.Description, CLASS_NAME, MethodName, , mFieldId
    ex.Raise
End Sub

Private Sub RaiseStatusBarError(ByVal Number As Long, ByVal Description As String, _
                                  ByVal MethodName As String, ByVal FieldId As String)
    Dim ex As New clsSAPException
    ex.Init Number, Description, CLASS_NAME, MethodName, , FieldId
    ex.Raise
End Sub
