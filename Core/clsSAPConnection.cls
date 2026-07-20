VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "clsSAPConnection"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

'==========================================================
' clsSAPConnection
' Responsavel por localizar o SAP GUI em execucao, obter o
' motor de scripting (SAPGUI Automation) e abrir/selecionar
' uma conexao SAP ativa.
' Esta e a UNICA classe do Core autorizada a falar diretamente
' com GetObject("SAPGUI").
'==========================================================

Private mSapGuiAuto As Object      ' SAPGUI Automation object
Private mApplication As Object     ' GuiApplication
Private mConnection As Object      ' GuiConnection ativa

Private Const CLASS_NAME As String = "clsSAPConnection"

' Verifica se existe um processo SAP GUI (saplogon) rodando com
' scripting habilitado, sem lancar erro caso nao exista.
Public Function IsSAPRunning() As Boolean

    On Error Resume Next
    Dim objTest As Object
    Set objTest = GetObject("SAPGUI")
    IsSAPRunning = Not objTest Is Nothing
    On Error GoTo 0

End Function

' Obtem o motor de scripting do SAP GUI (GuiApplication).
' Lanca clsSAPException caso o SAP GUI nao esteja disponivel
' ou o scripting esteja desabilitado.
Public Function GetScriptingEngine() As Object

    On Error GoTo ErrHandler

    If mApplication Is Nothing Then
        Set mSapGuiAuto = GetObject("SAPGUI")
        Set mApplication = mSapGuiAuto.GetScriptingEngine
    End If

    Set GetScriptingEngine = mApplication
    Exit Function

ErrHandler:
    Dim ex As clsSAPException
    Set ex = New clsSAPException
    ex.Init Err.Number, _
            "Nao foi possivel obter o motor de scripting do SAP GUI. " & _
            "Verifique se o SAP Logon esta aberto e se o scripting esta habilitado " & _
            "(Opcoes > Acessibilidade e Scripting > Scripting).", _
            CLASS_NAME, "GetScriptingEngine", , , True
    ex.Raise

End Function

' Lista as conexoes SAP GUI atualmente abertas.
' Retorna uma Collection de Strings no formato "indice | descricao".
Public Function ListConnections() As Collection

    On Error GoTo ErrHandler

    Dim app As Object
    Set app = GetScriptingEngine()

    Dim result As New Collection
    Dim i As Long

    For i = 0 To app.Children.Count - 1
        result.Add i & " | " & app.Children(i).Description
    Next i

    Set ListConnections = result
    Exit Function

ErrHandler:
    Dim ex As clsSAPException
    Set ex = New clsSAPException
    ex.Init Err.Number, "Falha ao listar conexoes SAP ativas.", _
            CLASS_NAME, "ListConnections"
    ex.Raise

End Function

' Conecta a uma conexao SAP existente.
' Se ConnectionIndex = -1 (padrao): conecta automaticamente se
' houver exatamente UMA conexao aberta; se houver mais de uma,
' lanca excecao pedindo que o indice seja informado explicitamente.
Public Function Connect(Optional ByVal ConnectionIndex As Long = -1) As Boolean

    On Error GoTo ErrHandler

    Dim app As Object
    Set app = GetScriptingEngine()

    If app.Children.Count = 0 Then
        Dim exNone As clsSAPException
        Set exNone = New clsSAPException
        exNone.Init 0, "Nenhuma conexao SAP aberta foi encontrada. Abra uma conexao no SAP Logon antes de chamar Connect.", _
                     CLASS_NAME, "Connect", , , True
        exNone.Raise
    End If

    If ConnectionIndex = -1 Then
        If app.Children.Count = 1 Then
            ConnectionIndex = 0
        Else
            Dim exAmb As clsSAPException
            Set exAmb = New clsSAPException
            exAmb.Init 0, "Existe mais de uma conexao SAP aberta (" & app.Children.Count & _
                        "). Informe o ConnectionIndex explicitamente. Use ListConnections() para ver as opcoes.", _
                        CLASS_NAME, "Connect", , , True
            exAmb.Raise
        End If
    End If

    Set mConnection = app.Children(ConnectionIndex)
    Connect = True
    Exit Function

ErrHandler:
    Connect = False
    Err.Raise Err.Number, Err.Source, Err.Description

End Function

Public Function GetConnection() As Object
    Set GetConnection = mConnection
End Function

Public Function IsConnected() As Boolean
    On Error Resume Next
    IsConnected = Not mConnection Is Nothing
    If IsConnected Then
        ' forca um acesso para detectar conexao "morta" (SAP fechado externamente)
        Dim n As Long
        n = mConnection.Children.Count
        IsConnected = (Err.Number = 0)
    End If
    On Error GoTo 0
End Function

Public Sub Disconnect()
    Set mConnection = Nothing
    Set mApplication = Nothing
    Set mSapGuiAuto = Nothing
End Sub
