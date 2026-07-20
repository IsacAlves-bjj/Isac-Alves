Attribute VB_Name = "Example_Components_Tab"
Option Explicit

'==========================================================
' Example_Components_Tab
' Exemplo de uso de clsSAPTab (Components, v0.3), acessado via
' SAP.TypedTab(...). Mostra Select() para ativar uma aba e Selected
' (somente leitura) para verificar qual aba esta ativa antes de
' navegar.
'
' Ajuste o Id conforme o layout real da tela no seu ambiente antes
' de rodar.
'==========================================================

Public Sub Exemplo_NavegarParaAba()

    Dim SAP As New clsSAP
    SAP.DebugMode = True

    If Not SAP.Connect() Then
        MsgBox "Nao foi possivel conectar ao SAP. Verifique se o SAP Logon esta aberto.", vbCritical
        Exit Sub
    End If

    SAP.Transaction "VA02"

    Dim AbaDadosGerais As clsSAPTab
    Set AbaDadosGerais = SAP.TypedTab("wnd[0]/usr/tabsTAXI_TABSTRIP_OVERVIEW/tabpG1")

    If Not AbaDadosGerais.Selected Then
        AbaDadosGerais.Select
    End If

    Debug.Print AbaDadosGerais.ToString()

    SAP.Disconnect

End Sub
