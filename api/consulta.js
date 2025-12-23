export default async function handler(req, res) {
  try {
    const { processo } = req.query;

    if (!processo) {
      return res.status(400).json({
        ok: false,
        error: "Número do processo não informado"
      });
    }

    const BITRIX_WEBHOOK =
      "https://angeliadvogados.bitrix24.com.br/rest/13/rmyrytghiumw6jrx";

    const CAMPO_PROCESSO = "UF_CRM_1758883069045";

    const url =
      `${BITRIX_WEBHOOK}/crm.deal.list.json` +
      `?filter[${CAMPO_PROCESSO}]=${encodeURIComponent(processo)}` +
      `&select[]=ID` +
      `&select[]=TITLE` +
      `&select[]=STAGE_ID` +
      `&select[]=STAGE_SEMANTIC_ID` +
      `&select[]=CLOSED` +
      `&select[]=${CAMPO_PROCESSO}`;

    const response = await fetch(url);
    const data = await response.json();

    const deals = (data.result || []).map(deal => {
      let status = "Em andamento";
      if (deal.STAGE_SEMANTIC_ID === "S") status = "Ganhou";
      if (deal.STAGE_SEMANTIC_ID === "F") status = "Perdeu";

      return {
        id: deal.ID,
        titulo: deal.TITLE,
        processo: deal[CAMPO_PROCESSO],
        status,
        fechado: deal.CLOSED === "Y"
      };
    });

    return res.status(200).json({
      ok: true,
      total: deals.length,
      result: deals
    });

  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: "Erro ao consultar o Bitrix",
      details: err.message
    });
  }
}
