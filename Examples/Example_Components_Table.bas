Attribute VB_Name = "Example_Components_Table"
Option Explicit

'==========================================================
' Example_Components_Table
' Exemplo de uso de clsSAPTable (Components, v0.3), acessado via
' SAP.TypedTable(...). Mostra o ganho sobre manipular o
' GuiTableControl cru: GetCellValue/SetCellValue recebem sempre a
' linha ABSOLUTA e escondem a rolagem manual (VerticalScrollbar) que
' a API nativa exige para acessar linhas fora da janela visivel.
'
' Ajuste o Id da tabela conforme o layout real da tela no seu
' ambiente antes de rodar (table controls classicos aparecem, por
' exemplo, na visao de overview de itens de algumas variantes de
' VA01/VA02, e em telas de condicao como VK11/VK12).
'==========================================================

Public Sub Exemplo_LerQuantidadesDeTodasAsLinhas()

    Dim SAP As New clsSAP
    SAP.DebugMode = True

    If Not SAP.Connect() Then
        MsgBox "Nao foi possivel conectar ao SAP. Verifique se o SAP Logon esta aberto.", vbCritical
        Exit Sub
    End If

    SAP.Transaction "VA02"
    ' ... navegar ate a tela com o table control antes de acessa-lo ...

    Dim TableId As String
    TableId = "wnd[0]/usr/tblSAPMV45ATCTRL_U_ERF_AUFTRAG"

    Dim Tabela As clsSAPTable
    Set Tabela = SAP.TypedTable(TableId)

    Debug.Print "Total de linhas: " & Tabela.RowCount & " | Visiveis por vez: " & Tabela.VisibleRowCount

    ' Descobrir o indice de cada coluna pelo titulo, uma unica vez.
    Dim Titulos As Collection
    Set Titulos = Tabela.ColumnTitles()

    Dim i As Long
    For i = 1 To Titulos.Count
        Debug.Print "Coluna " & (i - 1) & ": " & Titulos(i)
    Next i

    ' Sem o wrapper, ler a linha 20 de uma tabela com so 5 linhas
    ' visiveis exigiria calcular manualmente a posicao de rolagem
    ' (VerticalScrollbar.Position) e a linha RELATIVA antes de chamar
    ' GetCell. Aqui, GetCellValue recebe a linha absoluta e rola por
    ' baixo dos panos quando necessario.
    Dim Material As String
    For i = 0 To Tabela.RowCount - 1
        Material = Tabela.GetCellValue(i, 0)   ' ajuste o indice de coluna conforme ColumnTitles acima
        Debug.Print "Linha " & i & ": " & Material
    Next i

    SAP.Disconnect

End Sub

' Mostra selecao de linha (para depois acionar um botao de toolbar ou
' excluir a linha, por exemplo) e o erro amigavel ao acessar uma linha
' fora do intervalo.
Public Sub Exemplo_SelecionarLinhaETratarErro()

    Dim SAP As New clsSAP
    If Not SAP.Connect() Then Exit Sub

    SAP.Transaction "VA02"

    Dim Tabela As clsSAPTable
    Set Tabela = SAP.TypedTable("wnd[0]/usr/tblSAPMV45ATCTRL_U_ERF_AUFTRAG")

    If Not Tabela.IsEmpty() Then
        Tabela.SelectRow 0
        Debug.Print "Linha 0 selecionada: " & Tabela.IsRowSelected(0)
    End If

    On Error Resume Next
    Dim valor As String
    valor = Tabela.GetCellValue(9999, 0)

    If Err.Number <> 0 Then
        Debug.Print "Erro tratado pelo Framework: " & Err.Description
    End If
    On Error GoTo 0

    Tabela.ClearSelection

    SAP.Disconnect

End Sub
