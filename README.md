# LP BMW — BeGreen

Landing page de captação de leads: carregador para veículo elétrico, energia
fotovoltaica e bateria de armazenamento. Formulário integrado ao RD Station.

## Estrutura

```
index.html                     página (Design Component)
support.js                     runtime necessário para o index.html
assets/hero-lp-wide2.png       foto de fundo (1600×685)
assets/logo-begreen.png        logo BeGreen
assets/logo-bmw.png            logo BMW (fundo transparente)
politica-de-privacidade.html   página da política
api/lead.js                    função serverless: recebe o form e envia ao RD Station
vercel.json                    builds e rotas
```

## Publicar na Vercel

1. **GitHub** — crie o repositório (ex.: `lp-bmw-begreen`) e envie estes arquivos
   (*Add file → Upload files*, arraste tudo, inclusive as pastas `assets` e `api`;
   depois *Commit changes*).
2. **Vercel** — *Add New → Project → Import Git Repository* → selecione o repositório.
   Framework Preset: **Other**. Não altere Build/Output.
3. **Variável de ambiente** (antes do primeiro deploy), em
   *Settings → Environment Variables*:

   | Nome | Valor | Ambientes |
   |---|---|---|
   | `RD_API_KEY` | API Key pública do RD Station | Production, Preview, Development |

4. **Deploy**. Domínio próprio (opcional): *Settings → Domains*.

A partir daí, todo commit no GitHub republica o site automaticamente.

## Identificador da conversão

O evento chega ao RD Station como `lp-begreen-bmw`
(campo `conversion_identifier` em `api/lead.js`).

## Campos enviados

Nome, e-mail, telefone, CPF/CNPJ, endereço, número, cidade, estado, CEP,
tipo de local, modelo do veículo, concessionária BMW (63 unidades),
consentimento de comunicação e parâmetros de UTM.

## Observações

- A foto se ancora pela base: em telas largas o corte acontece no topo, mantendo
  calçada e jardim visíveis. Abaixo de 900px de largura a página passa a rolar,
  com a foto, os textos e o formulário empilhados (mobile).
- O único movimento na cena é o pulso do carregador, posicionado sobre o LED do
  wallbox (coordenadas em `fit()` no `index.html`).

## Teste local (opcional)

```bash
npm i -g vercel
vercel dev
```

Crie um `.env.local` com `RD_API_KEY=...` para o formulário funcionar localmente.
