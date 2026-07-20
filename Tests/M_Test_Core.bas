Attribute VB_Name = "M_Test_Core"
Option Explicit

'==========================================================
' M_Test_Core
' Testes do Core (v0.2). Cobrem os quatro tipos exigidos pelo
' briefing: positivo, negativo, de erro e de performance.
'
' Observacao: alguns testes dependem de uma sessao SAP real
' (SAP Logon aberto com uma conexao ativa). Eles se auto-detectam
' e sao pulados (SKIP) quando o ambiente nao esta disponivel, em
' vez de falhar o conjunto inteiro.
'==========================================================

Public Sub RunAllCoreTests()
    Debug.Print String(60, "=")
    Debug.Print "FrameworkX - Testes de Core - " & Now
    Debug.Print String(60, "=")

    Test_Exception_Positivo
    Test_Exception_ToString
    Test_Connection_SemSAPAberto_Negativo
    Test_Session_GetComponent_SemSessao_Erro
    Test_Facade_IsConnectedFalseAntesDeConectar

    Debug.Print String(60, "=")
    Debug.Print "Testes concluidos. Verifique [FAIL] acima, se houver."
    Debug.Print String(60, "=")
End Sub

' ---- Teste positivo: clsSAPException armazena e formata corretamente ----
Private Sub Test_Exception_Positivo()
    Dim ex As New clsSAPException
    ex.Init 5001, "Erro de teste", "clsTeste", "MetodoTeste", , "wnd[0]/usr/campo"

    Assert ex.Number = 5001, "Exception.Number"
    Assert ex.ClassName = "clsTeste", "Exception.ClassName"
    Assert ex.MethodName = "MetodoTeste", "Exception.MethodName"
    Assert ex.FieldId = "wnd[0]/usr/campo", "Exception.FieldId"
End Sub

' ---- Teste positivo: ToString contem as informacoes essenciais ----
Private Sub Test_Exception_ToString()
    Dim ex As New clsSAPException
    ex.Init 1, "Descricao X", "clsY", "MetodoZ"
    Dim s As String
    s = ex.ToString()

    Assert InStr(s, "clsY") > 0, "ToString contem ClassName"
    Assert InStr(s, "MetodoZ") > 0, "ToString contem MethodName"
    Assert InStr(s, "Descricao X") > 0, "ToString contem Description"
End Sub

' ---- Teste negativo: Connect deve falhar de forma controlada
'      quando nao ha SAP GUI disponivel. So e significativo em
'      maquina sem SAP GUI aberto (senao, SKIP). ----
Private Sub Test_Connection_SemSAPAberto_Negativo()
    Dim conn As New clsSAPConnection
    If conn.IsSAPRunning() Then
        Debug.Print "  [SKIP] Test_Connection_SemSAPAberto_Negativo - SAP GUI aberto nesta maquina."
        Exit Sub
    End If

    On Error Resume Next
    Dim ok As Boolean
    ok = conn.Connect()
    Assert Err.Number <> 0, "Connect deve lancar erro sem SAP GUI disponivel"
    On Error GoTo 0
End Sub

' ---- Teste de erro: GetComponent sem sessao inicializada deve
'      lancar clsSAPException, nunca um erro cru do VBA. ----
Private Sub Test_Session_GetComponent_SemSessao_Erro()
    Dim sess As New clsSAPSession
    On Error Resume Next
    Dim comp As Object
    Set comp = sess.GetComponent("wnd[0]/usr/campo")
    Assert Err.Number <> 0, "GetComponent sem sessao deve falhar"
    On Error GoTo 0
End Sub

' ---- Teste positivo: fachada reporta IsConnected=False antes de Connect ----
Private Sub Test_Facade_IsConnectedFalseAntesDeConectar()
    Dim SAP As New clsSAP
    Assert SAP.IsConnected() = False, "IsConnected deve ser False antes de Connect"
End Sub

' ---- Teste de performance: GetComponent com cache deve ser mais
'      rapido (ou igual) na segunda chamada. Requer sessao SAP real
'      ja conectada; chame manualmente informando um SAP e FieldId
'      validos para o ambiente de teste. Nao entra em RunAllCoreTests
'      por depender de estado externo. ----
Public Sub Test_Performance_CacheComponent(ByVal SAP As clsSAP, ByVal FieldId As String)
    Dim t0 As Long, t1 As Long, t2 As Long

    t0 = GetTickCount()
    SAP.Field FieldId
    t1 = GetTickCount()
    SAP.Field FieldId
    t2 = GetTickCount()

    Debug.Print "  1a chamada (sem cache): " & (t1 - t0) & " ms"
    Debug.Print "  2a chamada (com cache): " & (t2 - t1) & " ms"
    Assert (t2 - t1) <= (t1 - t0), "Chamada em cache deve ser igual ou mais rapida"
End Sub

' ---- Utilitario minimo de assercao para os testes acima ----
Private Sub Assert(ByVal Condition As Boolean, ByVal Description As String)
    If Condition Then
        Debug.Print "  [OK]   " & Description
    Else
        Debug.Print "  [FAIL] " & Description
    End If
End Sub
