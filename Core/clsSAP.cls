VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "clsSAP"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

'==========================================================
' clsSAP
' Fachada publica do FrameworkX. E o unico objeto que o
' desenvolvedor de automacoes deve instanciar diretamente.
'
' Uso alvo:
'   Dim SAP As New clsSAP
'   SAP.Connect
'   SAP.Transaction "VA03"
'   SAP.Field("wnd[0]/usr/ctxtVBAK-VBELN").Text = Pedido
'   SAP.Execute
'==========================================================

Private mConnectionMgr As clsSAPConnection
Private mSession As clsSAPSession
Private mLastError As clsSAPException
Private mDebugMode As Boolean

Private Const CLASS_NAME As String = "clsSAP"

Private Sub Class_Initialize()
    Set mConnectionMgr = New clsSAPConnection
    Set mSession = New clsSAPSession
    mDebugMode = False
End Sub

Public Property Get DebugMode() As Boolean
    DebugMode = mDebugMode
End Property

Public Property Let DebugMode(ByVal Value As Boolean)
    mDebugMode = Value
End Property

Public Property Get LastError() As clsSAPException
    Set LastError = mLastError
End Property

' Conecta a uma conexao SAP aberta e obtem uma sessao.
' ConnectionIndex/SessionIndex = -1 / 0 por padrao: detecta
' automaticamente quando so ha uma conexao aberta.
Public Function Connect(Optional ByVal ConnectionIndex As Long = -1, _
                         Optional ByVal SessionIndex As Long = 0) As Boolean

    On Error GoTo ErrHandler

    mConnectionMgr.Connect ConnectionIndex

    Dim conn As Object
    Set conn = mConnectionMgr.GetConnection()

    If conn.Children.Count = 0 Then
        RaiseFrameworkError 0, "A conexao SAP nao possui nenhuma sessao aberta.", "Connect", True
    End If

    mSession.Init conn.Children(SessionIndex)
    LogDebug "Conectado. Conexao=" & ConnectionIndex & " Sessao=" & SessionIndex

    Connect = True
    Exit Function

ErrHandler:
    Connect = False
    HandleError Err, "Connect"

End Function

Public Sub Disconnect()
    mConnectionMgr.Disconnect
    Set mSession = New clsSAPSession
End Sub

Public Function IsConnected() As Boolean
    IsConnected = mConnectionMgr.IsConnected() And Not (mSession.SessionObject() Is Nothing)
End Function

' Retorna o objeto clsSAPSession ativo, para uso avancado
' (ex.: dentro de classes de Extensions que precisem de acesso
' mais fino do que a fachada oferece).
Public Function GetSession() As clsSAPSession
    Set GetSession = mSession
End Function

' Reconecta do zero: derruba a conexao/sessao atuais e conecta de novo.
Public Function Reconnect(Optional ByVal ConnectionIndex As Long = -1, _
                           Optional ByVal SessionIndex As Long = 0) As Boolean
    Disconnect
    Reconnect = Connect(ConnectionIndex, SessionIndex)
End Function

Public Sub Transaction(ByVal TCode As String)
    On Error GoTo ErrHandler
    mSession.StartTransaction TCode
    LogDebug "Transacao iniciada: " & TCode
    Exit Sub
ErrHandler:
    HandleError Err, "Transaction"
End Sub

' Acesso principal a qualquer componente de tela (campo, botao, grid...).
' Retorna o objeto SAP GUI nativo (GuiTextField, GuiButton, etc.), que ja
' expoe .Text, .Press, .Selected, etc. conforme o tipo do componente.
' Para campos de texto, TypedField(Id) abaixo devolve um clsSAPField
' com validacao extra; para grids ALV, TypedGrid(Id) devolve um
' clsSAPGrid; para botoes, TypedButton(Id) devolve um clsSAPButton;
' para caixas de selecao e radio buttons, TypedCheckBox(Id)/
' TypedRadioButton(Id) devolvem clsSAPCheckBox/clsSAPRadioButton;
' para combo boxes, TypedComboBox(Id) devolve um clsSAPComboBox; para
' a barra de status, TypedStatusBar(Id) devolve um clsSAPStatusBar;
' para abas, TypedTab(Id) devolve um clsSAPTab; para table controls
' classicos, TypedTable(Id) devolve um clsSAPTable.
' Os demais wrappers (clsSAPShell, clsSAPTree, clsSAPMenu...) ainda
' chegam no Components (v0.3).
Public Function Field(ByVal Id As String) As Object
    On Error GoTo ErrHandler
    Set Field = mSession.GetComponent(Id)
    Exit Function
ErrHandler:
    HandleError Err, "Field"
End Function

' Versao que nao lanca erro se o campo nao existir (retorna Nothing).
Public Function TryField(ByVal Id As String) As Object
    Set TryField = mSession.TryGetComponent(Id)
End Function

' Acesso tipado a campos de texto (GuiTextField/GuiCTextField), via
' Components/clsSAPField (v0.3). Diferente de Field(), que retorna o
' objeto nativo cru, TypedField valida o tipo do componente e da
' erros mais claros (ex.: escrever em campo desabilitado). Field()
' continua existindo e retornando o objeto nativo, para nao quebrar
' automacoes que ja usam outras propriedades nativas alem de .Text.
Public Function TypedField(ByVal Id As String) As clsSAPField
    On Error GoTo ErrHandler

    Dim native As Object
    Set native = mSession.GetComponent(Id)

    Dim result As New clsSAPField
    result.Init native, Id
    Set TypedField = result
    Exit Function

ErrHandler:
    HandleError Err, "TypedField"
End Function

' Acesso tipado a grids ALV (GuiGridView), via Components/clsSAPGrid
' (v0.3). Valida o tipo do componente e adiciona validacao de indice
' de linha, alem de GetColumnValues (elimina o loop manual de leitura
' de uma coluna inteira que se repete em quase toda automacao que
' consolida dados de uma grid).
Public Function TypedGrid(ByVal Id As String) As clsSAPGrid
    On Error GoTo ErrHandler

    Dim native As Object
    Set native = mSession.GetComponent(Id)

    Dim result As New clsSAPGrid
    result.Init native, Id
    Set TypedGrid = result
    Exit Function

ErrHandler:
    HandleError Err, "TypedGrid"
End Function

' Acesso tipado a botoes (GuiButton), via Components/clsSAPButton
' (v0.3). Valida o tipo do componente e da erro claro em Press() em
' vez de erro cru de COM.
Public Function TypedButton(ByVal Id As String) As clsSAPButton
    On Error GoTo ErrHandler

    Dim native As Object
    Set native = mSession.GetComponent(Id)

    Dim result As New clsSAPButton
    result.Init native, Id
    Set TypedButton = result
    Exit Function

ErrHandler:
    HandleError Err, "TypedButton"
End Function

' Acesso tipado a caixas de selecao (GuiCheckBox), via
' Components/clsSAPCheckBox (v0.3). Valida o tipo do componente e
' expoe Check/Uncheck/Toggle como atalhos de intencao clara.
Public Function TypedCheckBox(ByVal Id As String) As clsSAPCheckBox
    On Error GoTo ErrHandler

    Dim native As Object
    Set native = mSession.GetComponent(Id)

    Dim result As New clsSAPCheckBox
    result.Init native, Id
    Set TypedCheckBox = result
    Exit Function

ErrHandler:
    HandleError Err, "TypedCheckBox"
End Function

' Acesso tipado a radio buttons (GuiRadioButton), via
' Components/clsSAPRadioButton (v0.3). Valida o tipo do componente e
' expoe Select() como atalho de intencao clara.
Public Function TypedRadioButton(ByVal Id As String) As clsSAPRadioButton
    On Error GoTo ErrHandler

    Dim native As Object
    Set native = mSession.GetComponent(Id)

    Dim result As New clsSAPRadioButton
    result.Init native, Id
    Set TypedRadioButton = result
    Exit Function

ErrHandler:
    HandleError Err, "TypedRadioButton"
End Function

' Acesso tipado a combo boxes (GuiComboBox), via
' Components/clsSAPComboBox (v0.3). Valida o tipo do componente e a
' chave antes de selecionar, com mensagem clara listando as chaves
' validas em vez do erro criptico de COM de "chave invalida".
Public Function TypedComboBox(ByVal Id As String) As clsSAPComboBox
    On Error GoTo ErrHandler

    Dim native As Object
    Set native = mSession.GetComponent(Id)

    Dim result As New clsSAPComboBox
    result.Init native, Id
    Set TypedComboBox = result
    Exit Function

ErrHandler:
    HandleError Err, "TypedComboBox"
End Function

' Acesso tipado a barra de status (GuiStatusbar), via
' Components/clsSAPStatusBar (v0.3). Uso tipico: checar apos
' Execute()/Press() se a acao produziu erro/aviso, sem comparar
' MessageType manualmente.
'   If SAP.TypedStatusBar("wnd[0]/sbar").IsError() Then ...
Public Function TypedStatusBar(ByVal Id As String) As clsSAPStatusBar
    On Error GoTo ErrHandler

    Dim native As Object
    Set native = mSession.GetComponent(Id)

    Dim result As New clsSAPStatusBar
    result.Init native, Id
    Set TypedStatusBar = result
    Exit Function

ErrHandler:
    HandleError Err, "TypedStatusBar"
End Function

' Acesso tipado a abas (GuiTab), via Components/clsSAPTab (v0.3).
' Valida o tipo do componente e expoe Select() como atalho de
' intencao clara para ativar a aba.
Public Function TypedTab(ByVal Id As String) As clsSAPTab
    On Error GoTo ErrHandler

    Dim native As Object
    Set native = mSession.GetComponent(Id)

    Dim result As New clsSAPTab
    result.Init native, Id
    Set TypedTab = result
    Exit Function

ErrHandler:
    HandleError Err, "TypedTab"
End Function

' Acesso tipado a table controls classicos (GuiTableControl), via
' Components/clsSAPTable (v0.3). Valida o tipo do componente e esconde
' a rolagem manual (VerticalScrollbar) que a API nativa exige para
' ler/escrever celulas fora da janela visivel - GetCellValue/
' SetCellValue recebem sempre a linha ABSOLUTA, como em TypedGrid.
Public Function TypedTable(ByVal Id As String) As clsSAPTable
    On Error GoTo ErrHandler

    Dim native As Object
    Set native = mSession.GetComponent(Id)

    Dim result As New clsSAPTable
    result.Init native, Id
    Set TypedTable = result
    Exit Function

ErrHandler:
    HandleError Err, "TypedTable"
End Function

' Confirma a tela atual (Enter).
Public Sub Execute()
    On Error GoTo ErrHandler
    mSession.SendVKey 0
    Exit Sub
ErrHandler:
    HandleError Err, "Execute"
End Sub

Public Sub Back()
    On Error GoTo ErrHandler
    mSession.Back
    Exit Sub
ErrHandler:
    HandleError Err, "Back"
End Sub

' F8 e usado como padrao de "Refresh/Executar" em varias telas SD;
' extensoes especificas (Extensions/SD) podem expor atalhos mais precisos.
Public Sub Refresh()
    On Error GoTo ErrHandler
    mSession.SendVKey 8
    Exit Sub
ErrHandler:
    HandleError Err, "Refresh"
End Sub

Public Function WaitReady(Optional ByVal TimeoutMs As Long = 15000) As Boolean
    WaitReady = mSession.WaitReady(TimeoutMs)
End Function

' ---------- Infraestrutura interna ----------

Private Sub HandleError(ByVal SourceErr As ErrObject, ByVal MethodName As String)

    Dim ex As clsSAPException
    Set ex = New clsSAPException
    ex.Init SourceErr.Number, SourceErr.Description, CLASS_NAME, MethodName
    Set mLastError = ex

    If mDebugMode Then Debug.Print ex.ToString()

    ex.Raise

End Sub

Private Sub RaiseFrameworkError(ByVal Number As Long, ByVal Description As String, _
                                  ByVal MethodName As String, Optional ByVal Critical As Boolean = False)
    Dim ex As clsSAPException
    Set ex = New clsSAPException
    ex.Init Number, Description, CLASS_NAME, MethodName, , , Critical
    Set mLastError = ex
    ex.Raise
End Sub

Private Sub LogDebug(ByVal Message As String)
    ' Log minimo interno do Core. O servico clsSAPLogger completo
    ' (niveis, arquivo, e-mail de erro critico) chega em Services (v0.5).
    If mDebugMode Then Debug.Print "[FrameworkX] " & Format(Now, "hh:nn:ss") & " - " & Message
End Sub
