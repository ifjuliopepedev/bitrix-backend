export default async function handler(req, res) {
  // Habilita CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { processo } = req.query;

    if (!processo) {
      return res.status(400).json({
        ok: false,
        error: "Número do processo não informado"
      });
    }

    const BITRIX_WEBHOOK = "https://angeliadvogados.bitrix24.com.br/rest/13/rmyrytghiumw6jrx";
    const CAMPO_PROCESSO = "UF_CRM_1758883069045"; // Campo onde está o número do processo

    // Busca todos os deals que têm o número do processo
    const urlDeals = `${BITRIX_WEBHOOK}/crm.deal.list.json` +
      `?filter[${CAMPO_PROCESSO}]=${encodeURIComponent(processo)}` +
      `&select[]=ID` +
      `&select[]=TITLE` +
      `&select[]=STAGE_ID` +
      `&select[]=STAGE_SEMANTIC_ID`;

    const response = await fetch(urlDeals);
    const data = await response.json();

    if (!data.result || data.result.length === 0) {
      return res.status(200).json({ ok: true, result: null });
    }

    // Cria um Set para guardar todos os STAGE_ID únicos encontrados
    const stageIds = new Set();

    data.result.forEach(deal => {
      if (deal.STAGE_ID) stageIds.add(deal.STAGE_ID);
    });

    return res.status(200).json({
      ok: true,
      processo,
      totalDeals: data.result.length,
      stagesEncontrados: Array.from(stageIds)
    });

  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: "Erro ao consultar o Bitrix",
      details: err.message
    });
  }
}
