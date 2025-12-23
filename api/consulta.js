async function fetchAllDeals(webhook, campoProcesso) {
  let start = 0;
  let all = [];

  while (true) {
    const url =
      `${webhook}/crm.deal.list.json` +
      `?select[]=${campoProcesso}` +
      `&start=${start}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.result || data.result.length === 0) break;

    all.push(...data.result);
    start += 50;
  }

  return all;
}

export default async function handler(req, res) {
  try {
    const BITRIX_WEBHOOK =
      "https://angeliadvogados.bitrix24.com.br/rest/13/rmyrytghiumw6jrx";

    // campo correto do número do processo
    const CAMPO_PROCESSO = "UF_CRM_1758883069045";

    const deals = await fetchAllDeals(BITRIX_WEBHOOK, CAMPO_PROCESSO);

    // pega só os números, remove vazios
    const processos = deals
      .map(d => d[CAMPO_PROCESSO])
      .filter(p => p && p.trim() !== "");

    // remove duplicados
    const unicos = [...new Set(processos)];

    res.status(200).json({
      ok: true,
      total: unicos.length,
      processos: unicos
    });

  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message
    });
  }
}
