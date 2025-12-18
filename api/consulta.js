export default function handler(req, res) 
{
  const { cpf } = req.query;

  res.status(200).json({
    ok: true,
    cpf: cpf,
    processo: "Processo de teste",
    status: "Em andamento"
  });
}
