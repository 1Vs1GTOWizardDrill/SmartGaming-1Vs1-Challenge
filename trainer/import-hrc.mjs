import fs from 'node:fs';
import path from 'node:path';

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (flag, fallback) => {
    const idx = args.indexOf(flag);
    return idx >= 0 && args[idx + 1] ? args[idx + 1] : fallback;
  };
  return {
    inputDir: get('--input', './samples'),
    outFile: get('--out', './trainer/imported-spots.json')
  };
}

function normalizeNode(node, sourceFile) {
  const actions = (node.actions || []).map((a, idx) => ({
    idx,
    code: a.type,
    amount: a.amount,
    nextNode: a.node
  }));

  const hands = Object.entries(node.hands || {}).map(([hand, data]) => {
    const mix = {};
    const ev = {};

    for (const action of actions) {
      mix[action.code] = data.played?.[action.idx] ?? 0;
      ev[action.code] = data.evs?.[action.idx] ?? Number.NEGATIVE_INFINITY;
    }

    const bestAction = actions
      .map((a) => a.code)
      .reduce((best, code) => (ev[code] > ev[best] ? code : best), actions[0]?.code ?? 'F');

    return {
      hand,
      weight: data.weight ?? 1,
      bestAction,
      mix,
      ev
    };
  });

  return {
    sourceFile,
    player: node.player ?? -1,
    street: node.street ?? -1,
    actions,
    hands
  };
}

function readJsonFiles(dir) {
  const files = fs.readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith('.json'))
    .map((f) => path.join(dir, f));

  return files.map((file) => ({ file, json: JSON.parse(fs.readFileSync(file, 'utf8')) }));
}

function main() {
  const { inputDir, outFile } = parseArgs();

  if (!fs.existsSync(inputDir)) {
    console.error(`Input directory not found: ${inputDir}`);
    process.exit(1);
  }

  const parsed = readJsonFiles(inputDir);
  const normalized = parsed.map(({ file, json }) => normalizeNode(json, file));

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(normalized, null, 2));

  console.log(`Imported ${normalized.length} spot(s) into ${outFile}`);
}

main();
