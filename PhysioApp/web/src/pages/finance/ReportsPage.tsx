import { useEffect, useState } from "react";
import { api, ApiError } from "../../api/client";
import type { MonthlyFinanceSummary } from "../../api/types";
import { calcularCarneLeao, DEDUCAO_POR_DEPENDENTE, DESCONTO_SIMPLIFICADO_MAX } from "../../utils/carneLeao";
import { formatCurrency } from "../../utils/format";

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function nextMonthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const next = new Date(y, m, 1);
  return next.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

export function ReportsPage() {
  const [month, setMonth] = useState(currentMonth());
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const [summary, setSummary] = useState<MonthlyFinanceSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  const [receitaBruta, setReceitaBruta] = useState("0");
  const [inssRecolhido, setInssRecolhido] = useState("0");
  const [numeroDependentes, setNumeroDependentes] = useState("0");
  const [despesasLivroCaixa, setDespesasLivroCaixa] = useState("0");

  useEffect(() => {
    setLoadingSummary(true);
    api
      .get<MonthlyFinanceSummary>(`/finance/summary/month?month=${month}`)
      .then((data) => {
        setSummary(data);
        setReceitaBruta(String(data.revenueParticular));
        setDespesasLivroCaixa(String(data.expenses));
      })
      .catch(() => setSummary(null))
      .finally(() => setLoadingSummary(false));
  }, [month]);

  async function handleExport() {
    setExportError(null);
    setExporting(true);
    try {
      await api.download(`/finance/export/month?month=${month}`, `physioapp-financeiro-${month}.csv`);
    } catch (err) {
      setExportError(err instanceof ApiError ? err.message : "Erro ao gerar a planilha.");
    } finally {
      setExporting(false);
    }
  }

  const resultado = calcularCarneLeao({
    receitaBruta: Number(receitaBruta) || 0,
    inssRecolhido: Number(inssRecolhido) || 0,
    numeroDependentes: Number(numeroDependentes) || 0,
    despesasLivroCaixa: Number(despesasLivroCaixa) || 0,
  });

  function handleDownloadResumo() {
    const linhas = [
      `PhysioApp — Apuração estimada do Carnê-Leão (IRPF mensal)`,
      `Período de apuração: ${month}`,
      `Código de receita: 0190 (Carnê-Leão — Pessoa Física)`,
      ``,
      `Receita bruta considerada (particular): ${formatCurrency(resultado.receitaBruta)}`,
      `Dedução aplicada (${resultado.deducaoUsada === "legal" ? "deduções legais" : "desconto simplificado"}): ${formatCurrency(resultado.valorDeducaoAplicada)}`,
      `Base de cálculo (após dedução): ${formatCurrency(resultado.baseTributavel)}`,
      `Alíquota da faixa: ${(resultado.faixaAliquota * 100).toFixed(1)}%`,
      `Imposto pela tabela progressiva: ${formatCurrency(resultado.impostoTabela)}`,
      `Redutor (Lei 15.270/2025): -${formatCurrency(resultado.redutor)}`,
      `IMPOSTO ESTIMADO A RECOLHER: ${formatCurrency(resultado.impostoFinal)}`,
      `Alíquota efetiva: ${(resultado.aliquotaEfetiva * 100).toFixed(2)}%`,
      ``,
      `Vencimento sugerido: até o último dia útil de ${nextMonthLabel(month)}.`,
      ``,
      `IMPORTANTE: este é um cálculo de apoio, não um DARF oficial. O`,
      `documento válido para pagamento (com código de barras) só é gerado`,
      `no Carnê-Leão Web da Receita Federal (ou pelo seu contador). Confira`,
      `estes valores antes de pagar qualquer coisa.`,
    ];
    const blob = new Blob([linhas.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `carne-leao-resumo-${month}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="card">
        <h2>Mês de referência</h2>
        <label className="field field-narrow">
          <span className="label">Mês</span>
          <input className="input" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        </label>
      </div>

      <div className="card">
        <h2>Planilha para o contador</h2>
        <p className="muted">
          Baixa uma planilha (CSV, abre no Excel/Sheets) com todos os lançamentos — contas a receber e
          a pagar — com vencimento no mês selecionado, incluindo status, forma de pagamento e tipo de
          cobrança.
        </p>
        {exportError && <div className="alert alert-error" style={{ marginTop: 12 }}>{exportError}</div>}
        <button type="button" className="btn btn-primary" style={{ marginTop: 12 }} onClick={handleExport} disabled={exporting}>
          {exporting ? "Gerando..." : "Baixar planilha do mês"}
        </button>
      </div>

      <div className="card">
        <h2>Apuração do Carnê-Leão (IRPF autônomo)</h2>
        <div className="alert" style={{ background: "var(--warning-bg, #fff4e5)", color: "var(--warning, #a35a00)", marginBottom: 16 }}>
          <strong>Isto é uma estimativa de apoio, não um DARF oficial.</strong> O documento válido para
          pagamento (com código de barras) só sai do Carnê-Leão Web da Receita Federal ou do seu
          contador. Confirme os valores antes de pagar.
        </div>

        {loadingSummary ? (
          <p className="muted">Carregando dados do mês...</p>
        ) : (
          <p className="muted small" style={{ marginBottom: 12 }}>
            Receita particular recebida em {month}: {summary ? formatCurrency(summary.revenueParticular) : "—"} (já
            preenchida abaixo, ajuste se necessário — receita de convênio geralmente já sofre retenção
            na fonte e normalmente não entra no Carnê-Leão).
          </p>
        )}

        <div className="form-grid">
          <label className="field">
            <span className="label">Receita bruta do mês (R$)</span>
            <input className="input" type="number" step="0.01" min="0" value={receitaBruta} onChange={(e) => setReceitaBruta(e.target.value)} />
          </label>
          <label className="field">
            <span className="label">INSS recolhido no mês (R$)</span>
            <input className="input" type="number" step="0.01" min="0" value={inssRecolhido} onChange={(e) => setInssRecolhido(e.target.value)} />
          </label>
          <label className="field field-narrow">
            <span className="label">Nº de dependentes</span>
            <input className="input" type="number" step="1" min="0" value={numeroDependentes} onChange={(e) => setNumeroDependentes(e.target.value)} />
          </label>
          <label className="field">
            <span className="label">Despesas dedutíveis (livro-caixa, R$)</span>
            <input className="input" type="number" step="0.01" min="0" value={despesasLivroCaixa} onChange={(e) => setDespesasLivroCaixa(e.target.value)} />
          </label>
        </div>
        <p className="muted small">
          Dedução por dependente: {formatCurrency(DEDUCAO_POR_DEPENDENTE)}/mês. Desconto simplificado
          (usado automaticamente se for mais vantajoso que as deduções acima): até{" "}
          {formatCurrency(DESCONTO_SIMPLIFICADO_MAX)}/mês.
        </p>

        <div className="stat-grid" style={{ marginTop: 16 }}>
          <div className="stat-card">
            <span className="stat-value">{formatCurrency(resultado.baseTributavel)}</span>
            <span className="stat-label">Base de cálculo</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{formatCurrency(resultado.impostoTabela)}</span>
            <span className="stat-label">Imposto pela tabela ({(resultado.faixaAliquota * 100).toFixed(1)}%)</span>
          </div>
          <div className="stat-card stat-card-success">
            <span className="stat-value">-{formatCurrency(resultado.redutor)}</span>
            <span className="stat-label">Redutor (Lei 15.270/2025)</span>
          </div>
          <div className="stat-card stat-card-danger">
            <span className="stat-value">{formatCurrency(resultado.impostoFinal)}</span>
            <span className="stat-label">Estimado a recolher</span>
          </div>
        </div>

        <p className="muted small" style={{ marginTop: 12 }}>
          Dedução aplicada: {resultado.deducaoUsada === "legal" ? "deduções legais informadas" : "desconto simplificado"} (
          {formatCurrency(resultado.valorDeducaoAplicada)}). Código de receita 0190. Vencimento sugerido: até o
          último dia útil de {nextMonthLabel(month)}.
        </p>

        <button type="button" className="btn btn-secondary" style={{ marginTop: 12 }} onClick={handleDownloadResumo}>
          Baixar resumo desta apuração
        </button>
      </div>
    </div>
  );
}
