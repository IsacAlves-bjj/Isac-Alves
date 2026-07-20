Attribute VB_Name = "Example_Components_CheckBox"
Option Explicit

'==========================================================
' Example_Components_CheckBox
' Exemplo de uso de clsSAPCheckBox (Components, v0.3), acessado via
' SAP.TypedCheckBox(...). Mostra os atalhos Check/Uncheck/Toggle no
' lugar de manipular Selected diretamente.
'
' Ajuste o Id conforme o layout real da tela no seu ambiente antes
' de rodar.
'==========================================================

Public Sub Exemplo_MarcarBloqueioDeFaturamento()

    Dim SAP As New clsSAP
    SAP.DebugMode = True

    If Not SAP.Connect() Then
        MsgBox "Nao foi possivel conectar ao SAP. Verifique se o SAP Logon esta aberto.", vbCritical
        Exit Sub
    End If

    SAP.Transaction "VA02"

    Dim Bloqueio As clsSAPCheckBox
    Set Bloqueio = SAP.TypedCheckBox("wnd[0]/usr/chkVBAK-FAKSK")

    Debug.Print "Estado atual: " & Bloqueio.Selected

    If Not Bloqueio.Selected Then
        Bloqueio.Check
    End If

    SAP.Execute
    SAP.Disconnect

End Sub
