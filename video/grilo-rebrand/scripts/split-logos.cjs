// Lê os SVGs oficiais em grilo-logos/ e gera src/logoParts.generated.ts.
// Para cada logo x versão de cor, separa o símbolo (os dois balões, que o
// vídeo anima como peças próprias) do restante do desenho (nome, descritor,
// pílula do selo), preservando a ordem original dos elementos.
const fs = require("fs");
const path = require("path");
const { svgPathBbox } = require("svg-path-bbox");

const KIT = path.join(__dirname, "..", "..", "..", "grilo-logos");
const OUT = path.join(__dirname, "..", "src", "logoParts.generated.ts");
const LOGOS = ["1-horizontal", "2-vertical", "3-conversa", "4-pingo-do-i", "5-nome-no-balao", "6-nome-primeiro", "7-selo"];
const VERSIONS = ["colorida", "para-fundo-escuro", "para-fundo-verde"];

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`));
  return m ? m[1] : null;
};
const part = (tag) => ({ d: attr(tag, "d"), fill: attr(tag, "fill") });

// Caixa do que de fato aparece desenhado (os arquivos têm margem interna
// desigual, então centralizar pelo viewBox deixa alguns logos tortos).
function contentBox(rest, symbol) {
  const visible = rest.replace(/<defs>[\s\S]*?<\/defs>/g, "");
  const boxes = [...visible.matchAll(/<path[^>]*\/>/g)].map((m) => svgPathBbox(attr(m[0], "d")));
  for (const m of visible.matchAll(/<rect[^>]*\/>/g)) {
    const x = +(attr(m[0], "x") ?? 0);
    const y = +(attr(m[0], "y") ?? 0);
    boxes.push([x, y, x + +attr(m[0], "width"), y + +attr(m[0], "height")]);
  }
  if (symbol) {
    for (const p of [symbol.left, symbol.right]) {
      const [x0, y0, x1, y1] = svgPathBbox(p.d);
      boxes.push([symbol.tx + x0 * symbol.s, symbol.ty + y0 * symbol.s, symbol.tx + x1 * symbol.s, symbol.ty + y1 * symbol.s]);
    }
  }
  return [
    Math.min(...boxes.map((b) => b[0])),
    Math.min(...boxes.map((b) => b[1])),
    Math.max(...boxes.map((b) => b[2])),
    Math.max(...boxes.map((b) => b[3])),
  ];
}

function parse(svg) {
  const vb = attr(svg.match(/<svg[^>]*>/)[0], "viewBox").split(/\s+/).map(Number);
  const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  const g = inner.match(/<g transform="translate\(([-\d.]+),([-\d.]+)\) scale\(([-\d.]+)\)">([\s\S]*?)<\/g>/);

  if (!g) {
    // "nome no balão": balões desenhados soltos no arquivo, sem grupo de símbolo
    const paths = [...inner.replace(/<defs>[\s\S]*?<\/defs>/, "").matchAll(/<path[^>]*\/>/g)].map((m) => m[0]);
    const left = paths.find((p) => /\smask=/.test(p));
    const right = paths[paths.indexOf(left) + 1];
    return {
      vb,
      box: contentBox(inner, null),
      symbol: null,
      balloons: { left: attr(left, "fill"), right: attr(right, "fill") },
      rest: inner,
    };
  }

  const [whole, tx, ty, s, body] = g;
  const maskPath = body.match(/<mask[\s\S]*?(<path[^>]*\/>)[\s\S]*?<\/mask>/)[1];
  const paths = [...body.replace(/<defs>[\s\S]*?<\/defs>/, "").matchAll(/<path[^>]*\/>/g)].map((m) => m[0]);
  const left = paths.find((p) => /\smask=/.test(p));
  const [right, ...letters] = paths.filter((p) => p !== left);

  const symbol = {
    tx: +tx,
    ty: +ty,
    s: +s,
    maskStroke: +attr(maskPath, "stroke-width"),
    left: part(left),
    right: part(right),
    letters: letters.map(part),
  };
  const rest = inner.replace(whole, "");

  return {
    vb,
    box: contentBox(rest, symbol),
    symbol,
    balloons: { left: attr(left, "fill"), right: attr(right, "fill") },
    rest,
  };
}

const result = {};
for (const logo of LOGOS) {
  for (const version of VERSIONS) {
    const dir = path.join(KIT, logo, version, "sem-fundo");
    const file = fs.readdirSync(dir).find((f) => f.endsWith(".svg"));
    result[`${logo}/${version}`] = parse(fs.readFileSync(path.join(dir, file), "utf8"));
  }
}

const header = `// GERADO por scripts/split-logos.cjs a partir de grilo-logos/. Não editar à mão.
export type Part = { d: string; fill: string };
export type SymbolData = { tx: number; ty: number; s: number; maskStroke: number; left: Part; right: Part; letters: Part[] };
export type LogoData = {
  vb: [number, number, number, number];
  box: [number, number, number, number];
  symbol: SymbolData | null;
  balloons: { left: string; right: string };
  rest: string;
};

export const logoParts: Record<string, LogoData> = `;

fs.writeFileSync(OUT, header + JSON.stringify(result, null, 2) + ";\n");
console.log(`Gerado ${OUT} com ${Object.keys(result).length} variações`);
