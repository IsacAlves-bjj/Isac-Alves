VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "clsSAPComboBox"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

'==========================================================
' clsSAPComboBox
' Wrapper tipado sobre GuiComboBox. Recebe o componente nativo ja
' resolvido pelo Core (clsSAPSession.GetComponent, via
' clsSAP.TypedComboBox) e adiciona:
'   - validacao de tipo (falha cedo se o Id nao apontar para um
'     GuiComboBox);
'   - validacao da chave (Key) antes de selecionar, convertendo o
'     erro criptico de COM de "chave invalida" em uma mensagem clara
'     que lista as chaves validas da lista.
'
' Nunca chama FindById diretamente (Components/README.md,
' diretriz 3) - so recebe objetos ja resolvidos pelo Core.
'==========================================================

Private mNative As Object          ' GuiComboBox
Private mFieldId As String

Private Const CLASS_NAME As String = "clsSAPComboBox"
Private Const VALID_TYPE As String = "GuiComboBox"
Private Const MAX_KEYS_EM_MENSAGEM As Long = 15

' Associa o wrapper a um componente nativo ja resolvido pelo Core.
' Valida o Type do componente e lanca clsSAPException clara se o
' objeto passado nao for um GuiComboBox. Chame antes de usar
' qualquer outro membro.
Public Sub Init(ByVal NativeComponent As Object, Optional ByVal FieldId As String = "")

    If NativeComponent Is Nothing Then
        RaiseComboBoxError 0, "Componente nativo nulo passado para clsSAPComboBox.Init.", "Init", FieldId
    End If

    Dim actualType As String
    On Error GoTo ErrHandler
    actualType = NativeComponent.Type
    On Error GoTo 0

    If actualType <> VALID_TYPE Then
        RaiseComboBoxError 0, "Componente '" & FieldId & "' nao e um combo box (esperado " & _
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
' cobertas pelo wrapper.
Public Function NativeObject() As Object
    Set NativeObject = mNative
End Function

' Chave tecnica da entrada atualmente selecionada.
Public Property Get Key() As String
    On Error GoTo ErrHandler
    Key = mNative.Key
    Exit Property
ErrHandler:
    HandleError Err, "Key (get)"
End Property

' Seleciona uma entrada pela chave tecnica. Valida antes que o combo
' box esteja habilitado e que a chave exista na lista, convertendo o
' erro criptico de COM de "chave invalida" em uma mensagem clara com
' as chaves validas.
Public Property Let Key(ByVal Value As String)
    Dim changeable As Boolean
    On Error GoTo ErrHandler
    changeable = mNative.Changeable
    On Error GoTo 0

    If Not changeable Then
        RaiseComboBoxError 0, "Combo box '" & mFieldId & "' nao esta habilitado para edicao " & _
                           "(somente leitura ou desabilitado na tela atual).", "Key (let)", mFieldId
    End If

    Dim keyExists As Boolean
    On Error GoTo ErrHandler
    keyExists = KeyExists(Value)
    On Error GoTo 0

    If Not keyExists Then
        RaiseComboBoxError 0, "Chave '" & Value & "' nao existe na lista do combo box '" & mFieldId & _
                           "'. Chaves validas: " & JoinValidKeys() & ".", "Key (let)", mFieldId
    End If

    On Error GoTo ErrHandler
    mNative.Key = Value
    Exit Property

ErrHandler:
    HandleError Err, "Key (let)"
End Property

' Texto exibido da entrada atualmente selecionada.
Public Property Get Text() As String
    On Error GoTo ErrHandler
    Text = mNative.Text
    Exit Property
ErrHandler:
    HandleError Err, "Text"
End Property

Public Property Get IsChangeable() As Boolean
    On Error GoTo ErrHandler
    IsChangeable = mNative.Changeable
    Exit Property
ErrHandler:
    HandleError Err, "IsChangeable"
End Property

' Indica se a chave informada existe na lista - util para validar
' antes de atribuir Key em vez de descobrir via excecao.
Public Function HasKey(ByVal KeyToCheck As String) As Boolean
    On Error GoTo ErrHandler
    HasKey = KeyExists(KeyToCheck)
    Exit Function
ErrHandler:
    HandleError Err, "HasKey"
End Function

' Todas as chaves tecnicas validas da lista, na ordem nativa.
Public Function EntryKeys() As Collection
    On Error GoTo ErrHandler

    Dim result As New Collection
    Dim entry As Object
    For Each entry In mNative.Entries
        result.Add entry.Key
    Next entry

    Set EntryKeys = result
    Exit Function

ErrHandler:
    HandleError Err, "EntryKeys"
End Function

' Formata o combo box para exibicao em log/imediato, no mesmo
' espirito de clsSAPException.ToString().
Public Function ToString() As String
    If mNative Is Nothing Then
        ToString = "[clsSAPComboBox] (nao inicializado)"
    Else
        ToString = "[clsSAPComboBox] Id=" & mFieldId & " Key=" & mNative.Key & " Text=" & mNative.Text
    End If
End Function

' ---------- Infraestrutura interna ----------

Private Function KeyExists(ByVal KeyToCheck As String) As Boolean
    Dim entry As Object
    For Each entry In mNative.Entries
        If entry.Key = KeyToCheck Then
            KeyExists = True
            Exit Function
        End If
    Next entry
End Function

' Monta a lista de chaves validas para a mensagem de erro, truncando
' listas muito longas para nao gerar uma excecao ilegivel.
Private Function JoinValidKeys() As String
    Dim entry As Object
    Dim result As String
    Dim n As Long

    For Each entry In mNative.Entries
        If Len(result) > 0 Then result = result & ", "
        result = result & entry.Key
        n = n + 1
        If n >= MAX_KEYS_EM_MENSAGEM Then
            result = result & ", ..."
            Exit For
        End If
    Next entry

    JoinValidKeys = result
End Function

Private Sub HandleError(ByVal SourceErr As ErrObject, ByVal MethodName As String)
    Dim ex As New clsSAPException
    ex.Init SourceErr.Number, SourceErr.Description, CLASS_NAME, MethodName, , mFieldId
    ex.Raise
End Sub

Private Sub RaiseComboBoxError(ByVal Number As Long, ByVal Description As String, _
                                 ByVal MethodName As String, ByVal FieldId As String)
    Dim ex As New clsSAPException
    ex.Init Number, Description, CLASS_NAME, MethodName, , FieldId
    ex.Raise
End Sub
