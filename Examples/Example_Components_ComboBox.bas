Attribute VB_Name = "Example_Components_ComboBox"
Option Explicit

'==========================================================
' Example_Components_ComboBox
' Exemplo de uso de clsSAPComboBox (Components, v0.3), acessado via
' SAP.TypedComboBox(...). Mostra a validacao de chave antes de
' selecionar - erro claro listando as chaves validas em vez do erro
' criptico de COM.
'
' Ajuste o Id e as chaves conforme o layout real da tela no seu
' ambiente antes de rodar.
'==========================================================

Public Sub Exemplo_SelecionarTipoDeOrdem()

    Dim SAP As New clsSAP
    SAP.DebugMode = True

    If Not SAP.Connect() Then
        MsgBox "Nao foi possivel conectar ao SAP. Verifique se o SAP Logon esta aberto.", vbCritical
        Exit Sub
    End If

    SAP.Transaction "VA01"

    Dim TipoOrdem As clsSAPComboBox
    Set TipoOrdem = SAP.TypedComboBox("wnd[0]/usr/cmbVBAK-AUART")

    Debug.Print "Selecao atual: " & TipoOrdem.Key & " (" & TipoOrdem.Text & ")"

    If TipoOrdem.HasKey("TA") Then
        TipoOrdem.Key = "TA"
    End If

    SAP.Execute
    SAP.Disconnect

End Sub

' Mostra o erro amigavel ao selecionar uma chave que nao existe na
' lista: clsSAPException listando as chaves validas, em vez do erro
' cru de COM do SAP GUI Scripting.
Public Sub Exemplo_ErroAoSelecionarChaveInvalida()

    Dim SAP As New clsSAP
    If Not SAP.Connect() Then Exit Sub

    SAP.Transaction "VA01"

    Dim TipoOrdem As clsSAPComboBox
    Set TipoOrdem = SAP.TypedComboBox("wnd[0]/usr/cmbVBAK-AUART")

    On Error Resume Next
    TipoOrdem.Key = "CHAVE_INEXISTENTE"

    If Err.Number <> 0 Then
        Debug.Print "Erro tratado pelo Framework: " & Err.Description
    End If
    On Error GoTo 0

    SAP.Disconnect

End Sub
