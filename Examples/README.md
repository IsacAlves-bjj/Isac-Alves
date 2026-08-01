# Examples

Exemplos executáveis mostrando a API pública de cada camada em uso
real. Todo módulo novo entregue ao Framework deve vir acompanhado de
pelo menos um exemplo aqui (critério de aceite, briefing seção 16).

## Convenção

- Um arquivo `Example_<Camada>_<Cenário>.bas` por exemplo.
- O exemplo deve ser copiável e executável por um desenvolvedor que
  nunca viu o Framework, desde que tenha uma sessão SAP disponível.
- Comentários devem explicar o "porquê", não só o "o quê" — o
  objetivo é ensinar a API, não só demonstrá-la.

## Arquivos atuais

- `Example_Core_Usage.bas` — conectar, iniciar transação, ler/escrever campo, executar (API alvo do Core, v0.2)
- `Example_Components_Field.bas` — uso de `clsSAPField` via `SAP.TypedField(...)`: validação antes de escrever, campo obrigatório/tamanho máximo, erro amigável em campo desabilitado (Components, v0.3)
- `Example_Components_Grid.bas` — uso de `clsSAPGrid` via `SAP.TypedGrid(...)`: leitura de coluna inteira sem loop manual, duplo-clique em linha, erro amigável em linha fora do intervalo (Components, v0.3)
- `Example_Components_Button.bas` — uso de `clsSAPButton` via `SAP.TypedButton(...)`: confirmar popup, verificar botão em destaque, erro amigável ao acionar botão indisponível (Components, v0.3)
- `Example_Components_CheckBox.bas` — uso de `clsSAPCheckBox` via `SAP.TypedCheckBox(...)`: `Check()` condicional a partir do estado atual (Components, v0.3)
- `Example_Components_RadioButton.bas` — uso de `clsSAPRadioButton` via `SAP.TypedRadioButton(...)`: `Select()` de uma opção de grupo (Components, v0.3)
- `Example_Components_ComboBox.bas` — uso de `clsSAPComboBox` via `SAP.TypedComboBox(...)`: `HasKey`/`Key` com validação, erro amigável em chave inválida (Components, v0.3)
- `Example_Components_StatusBar.bas` — uso de `clsSAPStatusBar` via `SAP.TypedStatusBar(...)`: checar `IsError()`/`IsWarning()` após `Execute` (Components, v0.3)
- `Example_Components_Tab.bas` — uso de `clsSAPTab` via `SAP.TypedTab(...)`: checar `Selected` (somente leitura) antes de navegar com `Select()` (Components, v0.3)
- `Example_Components_Table.bas` — uso de `clsSAPTable` via `SAP.TypedTable(...)`: ler todas as linhas por índice absoluto sem se preocupar com rolagem, selecionar linha, erro amigável em linha fora do intervalo (Components, v0.3)
