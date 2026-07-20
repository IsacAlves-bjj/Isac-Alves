Attribute VB_Name = "Example_Components_RadioButton"
Option Explicit

'==========================================================
' Example_Components_RadioButton
' Exemplo de uso de clsSAPRadioButton (Components, v0.3), acessado
' via SAP.TypedRadioButton(...). Mostra Select() no lugar de
' manipular Selected diretamente.
'
' Ajuste o Id conforme o layout real da tela no seu ambiente antes
' de rodar.
'==========================================================

Public Sub Exemplo_SelecionarTipoDeOrdem()

    Dim SAP As New clsSAP
    SAP.DebugMode = True

    If Not SAP.Connect() Then
        MsgBox "Nao foi possivel conectar ao SAP. Verifique se o SAP Logon esta aberto.", vbCritical
        Exit Sub
    End If

    SAP.Transaction "VA01"

    Dim OrdemNormal As clsSAPRadioButton
    Set OrdemNormal = SAP.TypedRadioButton("wnd[0]/usr/rdoVBAK-AUART_1")

    Debug.Print "Ja selecionada? " & OrdemNormal.Selected

    OrdemNormal.Select

    SAP.Execute
    SAP.Disconnect

End Sub
