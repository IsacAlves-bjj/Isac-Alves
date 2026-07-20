Attribute VB_Name = "Example_Components_Grid"
Option Explicit

'==========================================================
' Example_Components_Grid
' Exemplo de uso de clsSAPGrid (Components, v0.3), acessado via
' SAP.TypedGrid(...). Mostra o ganho sobre manipular o GuiGridView
' cru: GetColumnValues elimina o loop manual de leitura, e a
' validacao de linha da erro claro em vez de erro criptico de COM.
'
' Ajuste o Id da grid conforme o layout real da VA05 (ou outra
' lista ALV) no seu ambiente antes de rodar.
'==========================================================

Public Sub Exemplo_ConsolidarPedidosDaLista()

    Dim SAP As New clsSAP
    SAP.DebugMode = True

    If Not SAP.Connect() Then
        MsgBox "Nao foi possivel conectar ao SAP. Verifique se o SAP Logon esta aberto.", vbCritical
        Exit Sub
    End If

    SAP.Transaction "VA05"
    ' ... preencher tela de selecao e executar (SAP.Execute) antes
    ' de acessar a grid, conforme o layout real do seu relatorio ...

    Dim GridId As String
    GridId = "wnd[0]/usr/cntlGRID1/shellcont/shell"

    Dim Grid As clsSAPGrid
    Set Grid = SAP.TypedGrid(GridId)

    Debug.Print "Total de linhas: " & Grid.RowCount

    ' Sem o wrapper, isso seria um loop manual "For i = 0 To
    ' RowCount - 1 ... GetCellValue(i, "VBELN")" repetido em cada
    ' automacao que le uma coluna de uma ALV grid.
    Dim Pedidos As Collection
    Set Pedidos = Grid.GetColumnValues("VBELN")

    Dim i As Long
    For i = 1 To Pedidos.Count
        Debug.Print "Pedido " & i & ": " & Pedidos(i)
    Next i

    ' Abrir o documento da primeira linha: posiciona e da duplo-clique.
    If Not Grid.IsEmpty() Then
        Grid.DoubleClickCell 0, "VBELN"
        SAP.WaitReady
    End If

    SAP.Disconnect

End Sub

' Mostra o erro amigavel ao acessar uma linha fora do intervalo:
' clsSAPException com a mensagem indicando quantas linhas a grid tem,
' em vez do erro cru de COM do SAP GUI Scripting.
Public Sub Exemplo_ErroAoAcessarLinhaInvalida()

    Dim SAP As New clsSAP
    If Not SAP.Connect() Then Exit Sub

    SAP.Transaction "VA05"

    Dim Grid As clsSAPGrid
    Set Grid = SAP.TypedGrid("wnd[0]/usr/cntlGRID1/shellcont/shell")

    On Error Resume Next
    Dim valor As String
    valor = Grid.GetCellValue(9999, "VBELN")

    If Err.Number <> 0 Then
        Debug.Print "Erro tratado pelo Framework: " & Err.Description
    End If
    On Error GoTo 0

    SAP.Disconnect

End Sub
