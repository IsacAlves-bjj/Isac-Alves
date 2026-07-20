Attribute VB_Name = "Example_Components_Field"
Option Explicit

'==========================================================
' Example_Components_Field
' Exemplo de uso de clsSAPField (Components, v0.3), acessado via
' SAP.TypedField(...). Mostra o ganho sobre SAP.Field(...) puro:
' validacao de tipo, erro claro ao escrever em campo desabilitado,
' e atalhos (IsEmpty, Clear, IsRequired, MaxLength).
'
' Ajuste o pedido e os Ids de tela conforme o layout real da VA02/
' VA03 no seu ambiente antes de rodar.
'==========================================================

Public Sub Exemplo_PreencherCampoComValidacao()

    Dim SAP As New clsSAP
    SAP.DebugMode = True

    If Not SAP.Connect() Then
        MsgBox "Nao foi possivel conectar ao SAP. Verifique se o SAP Logon esta aberto.", vbCritical
        Exit Sub
    End If

    SAP.Transaction "VA02"

    ' TypedField devolve um clsSAPField, nao o GuiTextField cru.
    ' Se o Id apontar para outro tipo de componente (ex.: um botao
    ' por engano), o erro aparece aqui, com mensagem clara, em vez
    ' de um comportamento inesperado mais adiante no script.
    Dim campoPedido As clsSAPField
    Set campoPedido = SAP.TypedField("wnd[0]/usr/ctxtVBAK-VBELN")

    Debug.Print "Campo obrigatorio? " & campoPedido.IsRequired
    Debug.Print "Tamanho maximo: " & campoPedido.MaxLength

    campoPedido.Text = "0000012345"
    SAP.Execute
    SAP.WaitReady

    ' Antes de tentar gravar um campo, da para checar se esta
    ' habilitado na tela atual - evita descobrir isso via excecao.
    Dim campoMotivo As clsSAPField
    Set campoMotivo = SAP.TypedField("wnd[0]/usr/ctxtVBAK-AUGRU")

    If campoMotivo.IsChangeable Then
        If campoMotivo.IsEmpty() Then
            campoMotivo.Text = "01"
        End If
    Else
        Debug.Print "Campo de motivo nao esta habilitado para edicao nesta tela."
    End If

    SAP.Disconnect

End Sub

' Mostra o erro amigavel ao tentar escrever em um campo desabilitado:
' clsSAPException em vez de erro cru de COM.
Public Sub Exemplo_ErroAoEscreverCampoDesabilitado()

    Dim SAP As New clsSAP
    If Not SAP.Connect() Then Exit Sub

    Dim campo As clsSAPField
    Set campo = SAP.TypedField("wnd[0]/usr/ctxtVBAK-VBELN")

    On Error Resume Next
    campo.Text = "Novo Valor"

    If Err.Number <> 0 Then
        Debug.Print "Erro tratado pelo Framework: " & Err.Description
    End If
    On Error GoTo 0

    SAP.Disconnect

End Sub
