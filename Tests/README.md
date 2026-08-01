# Tests

Cada módulo do FrameworkX deve ter um arquivo `M_Test_<Módulo>.bas`
correspondente, com quatro tipos de teste (briefing, seção 15):

1. **Positivo** — comportamento correto com entrada válida.
2. **Negativo** — comportamento correto com entrada inválida/ausente (deve falhar de forma controlada, não travar).
3. **De erro** — força uma condição de erro e valida que ela vira `clsSAPException`, nunca um erro cru do VBA.
4. **De performance** — mede tempo de execução em cenários onde isso importa (ex.: cache de componente).

## Convenção

- Um `Sub RunAll<Camada>Tests()` por camada, que chama todos os testes daquela camada em sequência e imprime `[OK]`/`[FAIL]`/`[SKIP]` no Immediate Window.
- Testes que dependem de uma sessão SAP real devem se auto-detectar (`clsSAPConnection.IsSAPRunning()`) e imprimir `[SKIP]` com o motivo, em vez de falhar o conjunto inteiro — assim o `RunAllCoreTests` roda igual em qualquer máquina, com ou sem SAP aberto.
- Testes de performance que exigem estado externo (sessão conectada, tela específica) não entram no `RunAll...Tests()` automático — ficam como `Sub` separada, chamada manualmente informando o contexto.

## Arquivos atuais

- `M_Test_Core.bas` — testes do Core (v0.2)
- `M_Test_Components.bas` — testes de Components (v0.3): `clsSAPField`, `clsSAPGrid`, `clsSAPButton`, `clsSAPCheckBox`, `clsSAPRadioButton`, `clsSAPComboBox`, `clsSAPStatusBar`, `clsSAPTab` e `clsSAPTable`
- `clsFakeGuiTextField.cls` — duble de teste (não é parte do Framework entregue) que imita a interface de um `GuiTextField`/`GuiCTextField`, permitindo testar `clsSAPField` sem depender de uma sessão SAP real
- `clsFakeGuiGridView.cls` — duble de teste (não é parte do Framework entregue) que imita a interface de um `GuiGridView`, permitindo testar `clsSAPGrid` sem depender de uma sessão SAP real
- `clsFakeGuiButton.cls` — duble de teste (não é parte do Framework entregue) que imita a interface de um `GuiButton`, permitindo testar `clsSAPButton` sem depender de uma sessão SAP real
- `clsFakeGuiCheckBox.cls` — duble de teste (não é parte do Framework entregue) que imita a interface de um `GuiCheckBox`, permitindo testar `clsSAPCheckBox` sem depender de uma sessão SAP real
- `clsFakeGuiRadioButton.cls` — duble de teste (não é parte do Framework entregue) que imita a interface de um `GuiRadioButton`, permitindo testar `clsSAPRadioButton` sem depender de uma sessão SAP real
- `clsFakeGuiComboBox.cls` / `clsFakeGuiComboBoxEntry.cls` — dublês de teste (não são parte do Framework entregue) que imitam a interface de um `GuiComboBox` e suas entradas, permitindo testar `clsSAPComboBox` sem depender de uma sessão SAP real
- `clsFakeGuiStatusBar.cls` — duble de teste (não é parte do Framework entregue) que imita a interface de uma `GuiStatusbar`, permitindo testar `clsSAPStatusBar` sem depender de uma sessão SAP real
- `clsFakeGuiTab.cls` — duble de teste (não é parte do Framework entregue) que imita a interface de um `GuiTab`, permitindo testar `clsSAPTab` sem depender de uma sessão SAP real
- `clsFakeGuiTableControl.cls` (com `clsFakeGuiTableColumn.cls`, `clsFakeGuiTableColumns.cls`, `clsFakeGuiTableCell.cls`, `clsFakeGuiTableRow.cls` e `clsFakeGuiScrollbar.cls`) — dublês de teste (não são parte do Framework entregue) que imitam a interface de um `GuiTableControl` — incluindo o comportamento de rolagem (`GetCell` por linha relativa à posição do `VerticalScrollbar`) — permitindo testar `clsSAPTable` sem depender de uma sessão SAP real
