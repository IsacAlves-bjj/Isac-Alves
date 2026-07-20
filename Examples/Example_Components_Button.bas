Attribute VB_Name = "Example_Components_Button"
Option Explicit

'==========================================================
' Example_Components_Button
' Exemplo de uso de clsSAPButton (Components, v0.3), acessado via
' SAP.TypedButton(...). Mostra o cenario mais comum: confirmar um
' popup (ex.: "Continuar" apos um aviso de bloqueio) sem depender de
' Ids fixos quando o botao em destaque pode variar.
'
' Ajuste os Ids conforme o layout real do popup no seu ambiente
' antes de rodar.
'==========================================================

Public Sub Exemplo_ConfirmarPopup()

    Dim SAP As New clsSAP
    SAP.DebugMode = True

    If Not SAP.Connect() Then
        MsgBox "Nao foi possivel conectar ao SAP. Verifique se o SAP Logon esta aberto.", vbCritical
        Exit Sub
    End If

    SAP.Transaction "VA02"
    ' ... acao que dispara um popup de confirmacao (ex.: excluir item) ...

    ' TypedButton falha com mensagem clara se o Id apontar para outro
    ' tipo de componente (ex.: um campo de texto clicado por engano),
    ' em vez de um comportamento inesperado mais adiante no script.
    Dim BotaoContinuar As clsSAPButton
    Set BotaoContinuar = SAP.TypedButton("wnd[1]/usr/btnSPOP-OPTION1")

    Debug.Print "Botao: '" & BotaoContinuar.Text & "' | Em destaque: " & BotaoContinuar.IsDefault

    BotaoContinuar.Press
    SAP.WaitReady

    SAP.Disconnect

End Sub

' Mostra o erro amigavel ao tentar acionar um botao que nao pode ser
' pressionado no momento (ex.: fora de foco ou tela ja fechada):
' clsSAPException em vez de erro cru de COM.
Public Sub Exemplo_ErroAoAcionarBotaoIndisponivel()

    Dim SAP As New clsSAP
    If Not SAP.Connect() Then Exit Sub

    Dim Botao As clsSAPButton
    Set Botao = SAP.TypedButton("wnd[1]/usr/btnSPOP-OPTION1")

    On Error Resume Next
    Botao.Press

    If Err.Number <> 0 Then
        Debug.Print "Erro tratado pelo Framework: " & Err.Description
    End If
    On Error GoTo 0

    SAP.Disconnect

End Sub
