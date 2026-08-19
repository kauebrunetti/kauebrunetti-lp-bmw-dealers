// Função serverless da Vercel — a API Key nunca chega ao navegador.
// Configure RD_API_KEY em Settings → Environment Variables do projeto.
const RD_URL = 'https://api.rd.services/platform/conversions';
module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const key = process.env.RD_API_KEY;
  if (!key) return res.status(500).json({ error: 'RD_API_KEY nao configurada' });
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
  b = b || {};
  if (!b.cliente_email || !b.cliente_nome) {
    return res.status(400).json({ error: 'Dados do cliente obrigatorios' });
  }
  console.log('Recebido do formulario', JSON.stringify(b));
  const payload = {
    conversion_identifier: b.conversion_identifier || 'lp-begreen-bmw',
    name: b.cliente_nome,
    email: b.cliente_email,
    mobile_phone: b.cliente_telefone,
    available_for_mailing: !!b.consentimento,
    city: b.cidade,
    state: b.estado,
    cf_cpf_cnpj: b.cpf_cnpj,
    cf_endereco_para_instalacao_do_carregador: b.endereco,
    cf_endereco_instalacao: b.endereco,
    cf_n_da_residencia: b.numero,
    cf_cidade: b.cidade,
    cf_estado_em_que_voce_reside: b.estado,
    cf_estado: b.estado,
    cf_cep: b.cep,
    cf_tipo_de_local: b.tipo_local,
    cf_modelo_do_veiculo: b.modelo_veiculo,
    cf_concessionaria_gac: b.concessionaria,
    traffic_source: b.traffic_source,
    utm_source: b.utm_source,
    utm_medium: b.utm_medium,
    utm_campaign: b.utm_campaign,
    page_url: b.page_url
  };
  Object.keys(payload).forEach((k) => {
    if (k === 'available_for_mailing') return;
    if (payload[k] === undefined || payload[k] === null || payload[k] === '') delete payload[k];
  });
  const envia = (p) => fetch(`${RD_URL}?api_key=${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_type: 'CONVERSION', event_family: 'CDP', payload: p })
  });
  try {
    let r = await envia(payload);
    let texto = await r.text();
    // Enviamos variantes de identificador dos campos customizados; se o RD reclamar
    // de alguma, removemos apenas as citadas no erro e reenviamos uma vez.
    for (let tentativa = 0; tentativa < 3 && !r.ok && r.status === 400; tentativa++) {
      const invalidos = Object.keys(payload).filter((k) => k.indexOf('cf_') === 0 && texto.indexOf(k) !== -1);
      if (!invalidos.length) break;
      console.warn('Removendo campos rejeitados pelo RD', invalidos.join(', '));
      invalidos.forEach((k) => delete payload[k]);
      r = await envia(payload);
      texto = await r.text();
    }
    if (!r.ok) {
      console.error('RD Station respondeu', r.status, texto);
      return res.status(r.status).json({ error: 'RD Station', status: r.status, detalhe: texto });
    }
    console.log('RD Station OK', r.status, texto);
    return res.status(200).json({ ok: true, rd: texto });
  } catch (err) {
    console.error('Falha ao chamar o RD Station', err);
    return res.status(502).json({ error: 'Falha ao chamar o RD Station' });
  }
};