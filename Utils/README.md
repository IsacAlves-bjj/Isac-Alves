# Utils

**Status: planejado — sem versão fixa no roadmap ainda; priorizar após Components (v0.3).**

Utilitários genéricos que não dependem de SAP GUI Scripting, usados
para apoiar as automações reais do usuário (que combinam SAP com
Excel, Outlook, arquivos e relatórios).

## Áreas previstas (do briefing, seção 14)

- **Strings** — normalização, formatação, parsing de campos SAP (ex.: remover zeros à esquerda, tratar `#` de valores nulos)
- **Datas** — conversão entre formato SAP e formato Excel/regional
- **Arquivos** — leitura/escrita, verificação de existência, manipulação de caminhos
- **Pastas** — criação, limpeza, organização de saídas geradas pelas automações
- **Outlook** — envio de e-mail (reaproveitando o padrão já usado em `coa-automation` e `dialogo-diario-prioridades`)
- **Excel** — leitura/escrita de planilhas, formatação, exportação
- **Conversões** — tipos numéricos, moedas, unidades

## Diretriz

Cada utilitário deve ser independente do Core (não deve importar
`clsSAP`/`clsSAPSession`) para poder ser reutilizado em qualquer
projeto VBA, mesmo fora do contexto SAP.
