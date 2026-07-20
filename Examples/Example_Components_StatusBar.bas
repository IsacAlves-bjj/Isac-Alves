Attribute VB_Name = "Example_Components_StatusBar"
Option Explicit

'==========================================================
' Example_Components_StatusBar
' Exemplo de uso de clsSAPStatusBar (Components, v0.3), acessado via
' SAP.TypedStatusBar(...). Mostra o padrao mais importante para
' automacoes robustas: checar a barra de mensagens depois de toda
' acao (Execute, Press...) em vez de assumir que deu certo.
'==========================================================

Public Sub Exemplo_ConsultarPedidoComVerificacaoDeErro()

    Dim SAP As New clsSAP
    SAP.DebugMode = True

    If Not SAP.Connect() Then
        MsgBox "Nao foi possivel conectar ao SAP. Verifique se o SAP Logon esta aberto.", vbCritical
        Exit Sub
    End If

    Dim Pedido As String
    Pedido = "0000012345"

    SAP.Transaction "VA03"
    SAP.Field("wnd[0]/usr/ctxtVBAK-VBELN").Text = Pedido
    SAP.Execute

    ' Sem o wrapper, isso seria "session.findById(...sbar...).messageType"
    ' comparado manualmente contra "E" em cada ponto do script.
    Dim StatusBar As clsSAPStatusBar
    Set StatusBar = SAP.TypedStatusBar("wnd[0]/sbar")

    If StatusBar.IsError() Then
        Debug.Print "Falha ao abrir o pedido " & Pedido & ": " & StatusBar.Text
        SAP.Disconnect
        Exit Sub
    End If

    If StatusBar.IsWarning() Then
        Debug.Print "Aviso ao abrir o pedido " & Pedido & ": " & StatusBar.Text
    End If

    Dim Cliente As String
    Cliente = SAP.Field("wnd[0]/usr/subSUBSCREEN_HEADER:SAPMV45A:4021/txtVBAK-KUNNR").Text
    Debug.Print "Cliente do pedido " & Pedido & ": " & Cliente

    SAP.Disconnect

End Sub
