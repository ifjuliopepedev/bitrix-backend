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

    // Campo personalizado: Número do Processo
    const CAMPO_PROCESSO = "UF_CRM_1758883069045";

    // 1️⃣ Buscar os processos
    const dealsUrl =
      `${BITRIX_WEBHOOK}/crm.deal.list.json` +
      `?filter[${CAMPO_PROCESSO}]=${encodeURIComponent(processo)}`;

    const dealsResponse = await fetch(dealsUrl);
    const dealsData = await dealsResponse.json();

    const result = [];

    for (const deal of dealsData.result || []) {
      let clienteNome = "";

      // 2️⃣ Buscar nome do cliente (se houver contato)
      if (deal.CONTACT_ID) {
        const contactUrl =
          `${BITRIX_WEBHOOK}/crm.contact.get.json?id=${deal.CONTACT_ID}`;

        const contactResponse = await fetch(contactUrl);
        const contactData = await contactResponse.json();

        if (contactData.result) {
          const nome = contactData.result.NAME || "";
          const sobrenome = contactData.result.LAST_NAME || "";
          clienteNome = `${nome} ${sobrenome}`.trim();
        }
      }

      // 3️⃣ Montar resposta limpa
      result.push({
        id: deal.ID,
        titulo: deal.TITLE,
        processo: deal[CAMPO_PROCESSO] || "",
        cliente: clienteNome,
        status:
          deal.STAGE_SEMANTIC_ID === "S"
            ? "Ganhou"
            : deal.STAGE_SEMANTIC_ID === "F"
            ? "Perdeu"
            : "Em andamento",
        f
