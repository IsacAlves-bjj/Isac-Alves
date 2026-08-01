VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "clsSAPTable"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

'==========================================================
' clsSAPTable
' Wrapper tipado sobre GuiTableControl (o "table control" classico,
' usado em telas mais antigas de SD/MM - ex.: overview de itens em
' algumas variantes de VA01/VA02, condicoes em VK11/VK12). Recebe o
' componente nativo ja resolvido pelo Core (clsSAPSession.GetComponent,
' via clsSAP.TypedTable) e adiciona por cima dele:
'   - validacao de tipo (falha cedo se o Id nao apontar para um
'     GuiTableControl);
'   - validacao de indice de linha absoluta em todo metodo que recebe
'     Row, com mensagem clara em vez do erro criptico de COM;
'   - GetCellValue/SetCellValue por linha ABSOLUTA, escondendo a
'     rolagem manual que a API nativa exige (ver nota abaixo).
'
' Diferenca importante em relacao a clsSAPGrid (GuiGridView):
' GuiGridView.GetCellValue(Row, Col) aceita a linha ABSOLUTA da grid
' inteira. Ja GuiTableControl.GetCell(Row, Col) so aceita a linha
' RELATIVA a janela atualmente visivel (0 a VisibleRowCount - 1) - e
' exatamente a dor mencionada no Components/README.md ("mesma dor do
' grid, em telas mais antigas", so que pior, porque exige rolar a
' tabela manualmente via VerticalScrollbar.Position antes de ler ou
' escrever uma celula). Este wrapper esconde essa rolagem: recebe
' sempre a linha absoluta e rola a tabela internamente quando
' necessario (ScrollToRow), devolvendo ao chamador a mesma experiencia
' de "linha absoluta" que clsSAPGrid ja oferece.
'
' NOTA DE RISCO: a superficie exata de GuiTableControl (nomes e
' assinaturas de GetCell/GetAbsoluteRow/VerticalScrollbar/Columns) foi
' implementada com base na API documentada do SAP GUI Scripting, mas
' NAO pode ser validada contra uma sessao SAP real neste ambiente de
' desenvolvimento. Antes de depender disso em producao, rode
' Test_TypedTable_ComSessaoReal_Integracao (Tests/M_Test_Components.bas)
' contra uma tela real com table control e confira especialmente:
'   1. Se GetCell realmente espera linha relativa a visivel (nao
'      absoluta);
'   2. Se VerticalScrollbar.Position aceita atribuicao direta e reflete
'      a rolagem imediatamente na proxima leitura;
'   3. Se Columns(i).Title retorna o titulo de exibicao esperado.
' Ver Components/README.md para mais detalhes.
'
' Nunca chama FindById diretamente (Components/README.md, diretriz 3)
' - so recebe objetos ja resolvidos pelo Core.
'==========================================================

Private mNative As Object          ' GuiTableControl
Private mFieldId As String

Private Const CLASS_NAME As String = "clsSAPTable"
Private Const VALID_TYPE As String = "GuiTableControl"

' Associa o wrapper a um componente nativo ja resolvido pelo Core.
' Valida o Type do componente e lanca clsSAPException clara se o
' objeto passado nao for um GuiTableControl. Chame antes de usar
' qualquer outro membro.
Public Sub Init(ByVal NativeComponent As Object, Optional ByVal FieldId As String = "")

    If NativeComponent Is Nothing Then
        RaiseTableError 0, "Componente nativo nulo passado para clsSAPTable.Init.", "Init", FieldId
    End If

    Dim actualType As String
    On Error GoTo ErrHandler
    actualType = NativeComponent.Type
    On Error GoTo 0

    If actualType <> VALID_TYPE Then
        RaiseTableError 0, "Componente '" & FieldId & "' nao e um table control (esperado " & _
                         VALID_TYPE & ", encontrado '" & actualType & "'). " & _
                         "Use o wrapper correto para esse tipo de componente.", "Init", FieldId
    End If

    Set mNative = NativeComponent
    mFieldId = FieldId
    Exit Sub

ErrHandler:
    HandleError Err, "Init"

End Sub

Public Property Get Id() As String
    Id = mFieldId
End Property

' Escape hatch: acesso ao objeto GUI nativo para operacoes raras nao
' cobertas pelo wrapper (ex.: HorizontalScrollbar, CurrentCol/CurrentRow).
Public Function NativeObject() As Object
    Set NativeObject = mNative
End Function

' Numero total de linhas da tabela (nao so as visiveis).
Public Property Get RowCount() As Long
    On Error GoTo ErrHandler
    RowCount = mNative.RowCount
    Exit Property
ErrHandler:
    HandleError Err, "RowCount"
End Property

' Numero de linhas exibidas de uma vez na tela. Aumentar este valor
' (quando o layout permitir) reduz a necessidade de rolagem.
Public Property Get VisibleRowCount() As Long
    On Error GoTo ErrHandler
    VisibleRowCount = mNative.VisibleRowCount
    Exit Property
ErrHandler:
    HandleError Err, "VisibleRowCount (get)"
End Property

Public Property Let VisibleRowCount(ByVal Value As Long)
    On Error GoTo ErrHandler
    mNative.VisibleRowCount = Value
    Exit Property
ErrHandler:
    HandleError Err, "VisibleRowCount (let)"
End Property

Public Property Get ColumnCount() As Long
    On Error GoTo ErrHandler
    ColumnCount = mNative.Columns.Count
    Exit Property
ErrHandler:
    HandleError Err, "ColumnCount"
End Property

' Titulos de exibicao das colunas, na ordem nativa. Table controls
' classicos (diferente de GuiGridView) nao expoem um nome tecnico de
' coluna estilo ColumnOrder - o acesso a celula e feito pelo INDICE da
' coluna (0-based), nao por um Id de string. Use esta lista so para
' identificar visualmente qual indice corresponde a qual coluna.
Public Function ColumnTitles() As Collection
    On Error GoTo ErrHandler

    Dim result As New Collection
    Dim i As Long
    For i = 0 To mNative.Columns.Count - 1
        result.Add mNative.Columns(i).Title
    Next i

    Set ColumnTitles = result
    Exit Function

ErrHandler:
    HandleError Err, "ColumnTitles"
End Function

Public Function IsEmpty() As Boolean
    On Error GoTo ErrHandler
    IsEmpty = (mNative.RowCount = 0)
    Exit Function
ErrHandler:
    HandleError Err, "IsEmpty"
End Function

' Primeira linha absoluta atualmente visivel (posicao de rolagem
' vertical). Espelha FirstVisibleRow de clsSAPGrid por consistencia de
' API entre wrappers, mesmo a implementacao nativa por baixo sendo
' diferente (aqui, VerticalScrollbar.Position).
Public Property Get FirstVisibleRow() As Long
    On Error GoTo ErrHandler
    FirstVisibleRow = mNative.VerticalScrollbar.Position
    Exit Property
ErrHandler:
    HandleError Err, "FirstVisibleRow (get)"
End Property

Public Property Let FirstVisibleRow(ByVal Value As Long)
    On Error GoTo ErrHandler
    mNative.VerticalScrollbar.Position = Value
    Exit Property
ErrHandler:
    HandleError Err, "FirstVisibleRow (let)"
End Property

' Le o valor de uma celula por linha ABSOLUTA (0 a RowCount - 1) e
' indice de coluna (0-based, ver ColumnTitles). Rola a tabela
' internamente se a linha nao estiver visivel no momento - o chamador
' nunca precisa pensar em VerticalScrollbar.
Public Function GetCellValue(ByVal Row As Long, ByVal ColumnIndex As Long) As String
    ValidateRow Row, "GetCellValue"

    On Error GoTo ErrHandler
    ScrollToRow Row
    GetCellValue = mNative.GetCell(Row - mNative.VerticalScrollbar.Position, ColumnIndex).Text
    Exit Function

ErrHandler:
    HandleError Err, "GetCellValue"
End Function

' Escreve o valor de uma celula editavel, por linha absoluta. Mesma
' rolagem automatica de GetCellValue.
Public Sub SetCellValue(ByVal Row As Long, ByVal ColumnIndex As Long, ByVal Value As String)
    ValidateRow Row, "SetCellValue"

    On Error GoTo ErrHandler
    ScrollToRow Row
    mNative.GetCell(Row - mNative.VerticalScrollbar.Position, ColumnIndex).Text = Value
    Exit Sub

ErrHandler:
    HandleError Err, "SetCellValue"
End Sub

' Seleciona (ou desseleciona) uma linha por indice absoluto, via
' GetAbsoluteRow - ao contrario de GetCell, este metodo nativo ja
' trabalha com linha absoluta e nao exige rolagem previa.
Public Sub SelectRow(ByVal Row As Long, Optional ByVal Selected As Boolean = True)
    ValidateRow Row, "SelectRow"

    On Error GoTo ErrHandler
    mNative.GetAbsoluteRow(Row).Selected = Selected
    Exit Sub

ErrHandler:
    HandleError Err, "SelectRow"
End Sub

Public Function IsRowSelected(ByVal Row As Long) As Boolean
    ValidateRow Row, "IsRowSelected"

    On Error GoTo ErrHandler
    IsRowSelected = mNative.GetAbsoluteRow(Row).Selected
    Exit Function

ErrHandler:
    HandleError Err, "IsRowSelected"
End Function

' Desseleciona todas as linhas. GuiTableControl classico nao expoe um
' metodo nativo de "limpar selecao" em lote (diferente de
' GuiGridView.SelectAll) - percorre linha a linha via GetAbsoluteRow.
' Para tabelas muito grandes isso pode ser perceptivelmente mais lento
' que o equivalente em clsSAPGrid; use com moderacao em loops de UI.
Public Sub ClearSelection()
    On Error GoTo ErrHandler

    Dim i As Long
    For i = 0 To mNative.RowCount - 1
        mNative.GetAbsoluteRow(i).Selected = False
    Next i
    Exit Sub

ErrHandler:
    HandleError Err, "ClearSelection"
End Sub

' Formata a tabela para exibicao em log/imediato, no mesmo espirito de
' clsSAPException.ToString().
Public Function ToString() As String
    If mNative Is Nothing Then
        ToString = "[clsSAPTable] (nao inicializado)"
    Else
        ToString = "[clsSAPTable] Id=" & mFieldId & " RowCount=" & mNative.RowCount & _
                   " VisibleRowCount=" & mNative.VisibleRowCount
    End If
End Function

' ---------- Infraestrutura interna ----------

' Rola a tabela (via VerticalScrollbar.Position) apenas se Row ainda
' nao estiver na janela visivel atual - evita rolagem desnecessaria
' quando o chamador ja esta lendo linhas sequenciais visiveis.
Private Sub ScrollToRow(ByVal Row As Long)
    Dim pos As Long, visible As Long
    pos = mNative.VerticalScrollbar.Position
    visible = mNative.VisibleRowCount

    If Row < pos Or Row >= pos + visible Then
        mNative.VerticalScrollbar.Position = Row
    End If
End Sub

' Valida que Row esta dentro de [0, RowCount - 1]. Mesma logica de
' clsSAPGrid.ValidateRow: o erro de intervalo invalido e lancado com o
' handler do chamador ainda desligado, entao nao e reembrulhado.
Private Sub ValidateRow(ByVal Row As Long, ByVal MethodName As String)
    Dim rc As Long
    On Error GoTo ErrHandler
    rc = mNative.RowCount
    On Error GoTo 0

    If Row < 0 Or Row >= rc Then
        RaiseTableError 0, "Linha " & Row & " fora do intervalo (tabela '" & mFieldId & "' tem " & rc & _
                         " linha(s); indices validos: 0 a " & (rc - 1) & ").", MethodName, mFieldId
    End If

    Exit Sub

ErrHandler:
    HandleError Err, MethodName
End Sub

Private Sub HandleError(ByVal SourceErr As ErrObject, ByVal MethodName As String)
    Dim ex As New clsSAPException
    ex.Init SourceErr.Number, SourceErr.Description, CLASS_NAME, MethodName, , mFieldId
    ex.Raise
End Sub

Private Sub RaiseTableError(ByVal Number As Long, ByVal Description As String, _
                              ByVal MethodName As String, ByVal FieldId As String)
    Dim ex As New clsSAPException
    ex.Init Number, Description, CLASS_NAME, MethodName, , FieldId
    ex.Raise
End Sub
