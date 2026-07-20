Attribute VB_Name = "Example_Core_Usage"
Option Explicit

'==========================================================
' Example_Core_Usage
' Exemplo minimo de uso do Core do FrameworkX (v0.2).
' Mostra a API alvo definida no briefing: Connect / Transaction /
' Field / Execute, sem nenhuma chamada direta a session.FindById
' no codigo do desenvolvedor.
'
' Ajuste o numero do pedido e os IDs de tela conforme o layout
' real da VA03 no seu ambiente antes de rodar.
'==========================================================

Public Sub Exemplo_ConsultarPedido()

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

    SAP.WaitReady

    Dim Cliente As String
    Cliente = SAP.Field("wnd[0]/usr/subSUBSCREEN_HEADER:SAPMV45A:4021/txtVBAK-KUNNR").Text

    Debug.Print "Cliente do pedido " & Pedido & ": " & Cliente

    SAP.Disconnect

End Sub
