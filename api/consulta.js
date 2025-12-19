export default async function handler(req, res) 
{
  try {
    // 1️⃣ Número do processo vindo da Unity
    const { processo } = req.query;

    if (!processo) {
      return res.status(400).json({
        ok: false,
        error: "Número do processo não informado"
      });
    }

    // 2️⃣ LINK DO WEBHOOK DO BITRIX (SUBSTITUI AQUI 👇)
    const BITRIX_WEBHOOK =
      "https://angeliadvogados.bitrix24.com.br/rest/13/rmyrytghiumw6jrx";

    // 3️⃣ ID DO CAMPO PERSONALIZADO (SUBSTITUI AQUI 👇)
    // Exemplo: UF_CRM_1712345678
    const CAMPO_PROCESSO = "UF_CRM_1712398765";

    // 4️⃣ Monta a URL da consulta
    const url =
      `${BITRIX_WEBHOOK}/crm.deal.list.json` +
      `?filter[${CAMPO_PROCESSO}]=${encodeURIComponent(processo)}`;

    // 5️⃣ Chamada ao Bitrix
    const response = await fetch(url);
    const data = await response.json();

    // 6️⃣ Retorno para a Unity
    return res.status(200).json({
      ok: true,
      total: data.total || 0,
      result: data.result || []
    });

  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: "Erro ao consultar o Bitrix",
      details: err.message
    });
  }
}
