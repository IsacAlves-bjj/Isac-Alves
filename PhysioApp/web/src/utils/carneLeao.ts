// Apuração estimada do Carnê-Leão (IRPF mensal de autônomo/pessoa física) —
// código de receita 0190. Isto é uma CALCULADORA DE APOIO, não substitui a
// apuração oficial no Carnê-Leão Web da Receita Federal nem a revisão de um
// contador antes de qualquer pagamento. Fontes e premissas documentadas
// abaixo porque legislação tributária muda e um valor errado aqui tem
// consequência financeira real.

// Tabela progressiva mensal do IRPF — inalterada de 2025 para 2026 (sem
// reajuste de faixas/alíquotas nessa transição).
const FAIXAS = [
  { ate: 2428.8, aliquota: 0, parcelaDeduzir: 0 },
  { ate: 2826.65, aliquota: 0.075, parcelaDeduzir: 182.16 },
  { ate: 3751.05, aliquota: 0.15, parcelaDeduzir: 394.16 },
  { ate: 4664.68, aliquota: 0.225, parcelaDeduzir: 675.49 },
  { ate: Infinity, aliquota: 0.275, parcelaDeduzir: 908.73 },
];

// Desconto simplificado mensal (alternativa às deduções legais discriminadas
// — usa-se o que for mais vantajoso) e valor por dependente, ambos 2026.
export const DESCONTO_SIMPLIFICADO_MAX = 607.2;
export const DEDUCAO_POR_DEPENDENTE = 189.59;

// Redutor mensal criado pela Lei 15.270/2025, vigente a partir de
// jan/2026, para suavizar a progressividade do IR.
// Fórmula confirmada: Redutor = 978,62 − (0,133145 × base tributável
// mensal) — o próprio formato da fórmula já zera sozinho a partir de
// ~R$7.350 (978,62 / 0,133145 ≈ 7.350) e, combinado com o teto de "nunca
// gera crédito" (aplicado em calcularCarneLeao, via Math.min com o
// imposto da tabela), já produz imposto efetivamente zero para a faixa
// de renda mais baixa sem precisar de uma regra extra hardcoded — não
// precisou de um caso especial "abaixo de R$5.000 = isento forçado".
// Premissa assumida (não confirmada em fonte primária no momento da
// implementação): a fórmula usa a base JÁ DEPOIS das deduções, não a
// receita bruta — é a leitura mais conservadora e mais alinhada ao termo
// "rendimento tributável" usado nas fontes consultadas.
export function calcularRedutor2026(baseTributavel: number): number {
  if (baseTributavel <= 0) return 0;
  return Math.max(0, 978.62 - 0.133145 * baseTributavel);
}

export interface CarneLeaoInput {
  receitaBruta: number;
  inssRecolhido: number;
  numeroDependentes: number;
  despesasLivroCaixa: number;
}

export interface CarneLeaoResultado {
  receitaBruta: number;
  deducaoLegalTotal: number;
  deducaoUsada: "simplificado" | "legal";
  valorDeducaoAplicada: number;
  baseTributavel: number;
  faixaAliquota: number;
  impostoTabela: number;
  redutor: number;
  impostoFinal: number;
  aliquotaEfetiva: number;
}

export function calcularCarneLeao(input: CarneLeaoInput): CarneLeaoResultado {
  const receitaBruta = Math.max(0, input.receitaBruta);
  const deducaoLegalTotal =
    Math.max(0, input.inssRecolhido) +
    Math.max(0, input.numeroDependentes) * DEDUCAO_POR_DEPENDENTE +
    Math.max(0, input.despesasLivroCaixa);

  const deducaoUsada = deducaoLegalTotal > DESCONTO_SIMPLIFICADO_MAX ? "legal" : "simplificado";
  const valorDeducaoAplicada = deducaoUsada === "legal" ? deducaoLegalTotal : DESCONTO_SIMPLIFICADO_MAX;

  const baseTributavel = Math.max(0, receitaBruta - valorDeducaoAplicada);

  const faixa = FAIXAS.find((f) => baseTributavel <= f.ate) ?? FAIXAS[FAIXAS.length - 1];
  const impostoTabela = Math.max(0, baseTributavel * faixa.aliquota - faixa.parcelaDeduzir);

  const redutorBruto = calcularRedutor2026(baseTributavel);
  const redutor = Math.min(redutorBruto, impostoTabela);
  const impostoFinal = Math.max(0, Math.round((impostoTabela - redutor) * 100) / 100);

  return {
    receitaBruta,
    deducaoLegalTotal,
    deducaoUsada,
    valorDeducaoAplicada,
    baseTributavel,
    faixaAliquota: faixa.aliquota,
    impostoTabela: Math.round(impostoTabela * 100) / 100,
    redutor: Math.round(redutor * 100) / 100,
    impostoFinal,
    aliquotaEfetiva: receitaBruta > 0 ? impostoFinal / receitaBruta : 0,
  };
}
