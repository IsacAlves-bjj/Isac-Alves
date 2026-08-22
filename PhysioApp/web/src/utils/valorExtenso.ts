// Converte um valor em reais para extenso (ex.: 1350.5 → "mil e trezentos e
// cinquenta reais e cinquenta centavos") — convenção tradicional em recibos
// formais brasileiros. Cobre com confiança a faixa realista de uma clínica
// (até milhões); acima disso a regra de concordância "milhão de reais" não
// é tratada à parte — caso extremamente improvável para este uso.

const UNIDADES = ["zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
const DEZ_A_DEZENOVE = [
  "dez", "onze", "doze", "treze", "quatorze", "quinze",
  "dezesseis", "dezessete", "dezoito", "dezenove",
];
const DEZENAS = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
const CENTENAS = [
  "", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos",
  "seiscentos", "setecentos", "oitocentos", "novecentos",
];

function grupoPorExtenso(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "cem";
  const centena = Math.floor(n / 100);
  const resto = n % 100;
  const partes: string[] = [];
  if (centena > 0) partes.push(CENTENAS[centena]);
  if (resto > 0) {
    if (resto < 10) partes.push(UNIDADES[resto]);
    else if (resto < 20) partes.push(DEZ_A_DEZENOVE[resto - 10]);
    else {
      const dezena = Math.floor(resto / 10);
      const unidade = resto % 10;
      partes.push(unidade === 0 ? DEZENAS[dezena] : `${DEZENAS[dezena]} e ${UNIDADES[unidade]}`);
    }
  }
  return partes.join(" e ");
}

function inteiroPorExtenso(n: number): string {
  if (n === 0) return "zero";
  const milhoes = Math.floor(n / 1_000_000);
  const milhares = Math.floor((n % 1_000_000) / 1000);
  const unidades = n % 1000;
  const partes: string[] = [];
  if (milhoes > 0) partes.push(`${grupoPorExtenso(milhoes)} ${milhoes === 1 ? "milhão" : "milhões"}`);
  if (milhares > 0) partes.push(milhares === 1 ? "mil" : `${grupoPorExtenso(milhares)} mil`);
  if (unidades > 0) partes.push(grupoPorExtenso(unidades));

  if (partes.length === 1) return partes[0];
  const last = partes[partes.length - 1];
  return `${partes.slice(0, -1).join(", ")} e ${last}`;
}

export function valorPorExtenso(value: number): string {
  const reais = Math.floor(value + 1e-9);
  const centavos = Math.round((value - reais) * 100);

  const partes: string[] = [];
  if (reais > 0) partes.push(`${inteiroPorExtenso(reais)} ${reais === 1 ? "real" : "reais"}`);
  if (centavos > 0) partes.push(`${inteiroPorExtenso(centavos)} ${centavos === 1 ? "centavo" : "centavos"}`);

  return partes.length > 0 ? partes.join(" e ") : "zero reais";
}
