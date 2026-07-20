VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "clsSAPSession"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

'==========================================================
' clsSAPSession
' Encapsula uma GuiSession ativa. E a UNICA classe do Core
' autorizada a chamar session.FindById diretamente. Todo o
' restante do Framework (e todo codigo do usuario) deve passar
' por GetComponent/TryGetComponent.
'==========================================================

Private mSession As Object                  ' GuiSession
Private mCache As Object                    ' Scripting.Dictionary (cache de componentes)
Private mUseCache As Boolean

Private Const CLASS_NAME As String = "clsSAPSession"
Private Const DEFAULT_TIMEOUT_MS As Long = 15000
Private Const POLL_INTERVAL_MS As Long = 100

Private Sub Class_Initialize()
    Set mCache = CreateObject("Scripting.Dictionary")
    mUseCache = True
End Sub

' Associa esta instancia a uma GuiSession ja obtida de uma conexao.
Public Sub Init(ByVal Session As Object)
    Set mSession = Session
    mCache.RemoveAll
End Sub

Public Function SessionObject() As Object
    Set SessionObject = mSession
End Function

Public Property Get UseCache() As Boolean
    UseCache = mUseCache
End Property

Public Property Let UseCache(ByVal Value As Boolean)
    mUseCache = Value
    If Not Value Then mCache.RemoveAll
End Property

' Limpa o cache de componentes. Deve ser chamado sempre que a
' arvore de tela mudar (nova transacao, Back, Enter em tela nova),
' ja que os ids anteriores deixam de ser validos.
Public Sub ClearCache()
    mCache.RemoveAll
End Sub

' Indica se a sessao esta processando algo no servidor.
Public Function IsBusy() As Boolean
    On Error Resume Next
    IsBusy = mSession.Busy
    On Error GoTo 0
End Function

' Aguarda a sessao ficar livre (Busy = False), com timeout.
' Elimina a necessidade de Application.Wait / Sleep espalhados
' pelo codigo do usuario. Versao completa (WaitObject, WaitStatus)
' fica a cargo do servico SmartWait (Services, v0.5).
Public Function WaitReady(Optional ByVal TimeoutMs As Long = DEFAULT_TIMEOUT_MS) As Boolean

    On Error GoTo ErrHandler

    Dim startTick As Long
    startTick = GetTickCount()

    Do While mSession.Busy
        Sleep POLL_INTERVAL_MS
        If GetTickCount() - startTick > TimeoutMs Then
            WaitReady = False
            Exit Function
        End If
    Loop

    WaitReady = True
    Exit Function

ErrHandler:
    Dim ex As clsSAPException
    Set ex = New clsSAPException
    ex.Init Err.Number, "Falha ao aguardar a sessao SAP ficar pronta.", _
            CLASS_NAME, "WaitReady"
    ex.Raise

End Function

' Inicia uma transacao (equivalente a digitar o codigo na barra e dar Enter).
Public Sub StartTransaction(ByVal TCode As String)

    On Error GoTo ErrHandler

    mSession.StartTransaction TCode
    ClearCache
    WaitReady
    Exit Sub

ErrHandler:
    Dim ex As clsSAPException
    Set ex = New clsSAPException
    ex.Init Err.Number, "Falha ao iniciar a transacao '" & TCode & "'.", _
            CLASS_NAME, "StartTransaction"
    ex.Raise

End Sub

Public Sub Back()
    On Error GoTo ErrHandler
    mSession.FindById("wnd[0]").SendVKey 3
    ClearCache
    WaitReady
    Exit Sub
ErrHandler:
    Dim ex As clsSAPException
    Set ex = New clsSAPException
    ex.Init Err.Number, "Falha ao executar Back (F3).", CLASS_NAME, "Back"
    ex.Raise
End Sub

Public Sub SendVKey(ByVal VKey As Integer, Optional ByVal WindowId As String = "wnd[0]")
    On Error GoTo ErrHandler
    mSession.FindById(WindowId).SendVKey VKey
    ClearCache
    WaitReady
    Exit Sub
ErrHandler:
    Dim ex As clsSAPException
    Set ex = New clsSAPException
    ex.Init Err.Number, "Falha ao enviar VKey " & VKey & " para " & WindowId & ".", _
            CLASS_NAME, "SendVKey"
    ex.Raise
End Sub

' Ponto unico de acesso ao FindById da sessao, com cache opcional
' e erro padronizado. Todo componente SAP do Framework passa por aqui.
Public Function GetComponent(ByVal Id As String) As Object

    On Error GoTo ErrHandler

    If mUseCache And mCache.Exists(Id) Then
        Set GetComponent = mCache(Id)
        Exit Function
    End If

    Dim comp As Object
    Set comp = mSession.FindById(Id)

    If mUseCache Then
        mCache(Id) = comp
    End If

    Set GetComponent = comp
    Exit Function

ErrHandler:
    Dim ex As clsSAPException
    Set ex = New clsSAPException
    ex.Init Err.Number, "Campo/elemento nao encontrado na tela SAP atual.", _
            CLASS_NAME, "GetComponent", , Id
    ex.Raise

End Function

' Versao "segura" que nao lanca excecao: retorna Nothing se o
' componente nao existir na tela atual. Util para verificacoes
' condicionais (ex.: "se este campo existir, preencha").
Public Function TryGetComponent(ByVal Id As String) As Object
    On Error Resume Next
    Set TryGetComponent = mSession.FindById(Id)
    On Error GoTo 0
End Function
