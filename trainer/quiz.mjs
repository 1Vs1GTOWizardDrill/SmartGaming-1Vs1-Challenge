import fs from 'node:fs';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function actionLabel(code) {
  if (code === 'F') return 'Fold';
  if (code === 'R') return 'Raise/Jam';
  if (code === 'C') return 'Call';
  return code;
}

async function main() {
  const file = process.argv[2] || './trainer/imported-spots.json';
  if (!fs.existsSync(file)) {
    console.error(`File not found: ${file}`);
    process.exit(1);
  }

  const spots = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!spots.length) {
    console.error('No spots in file.');
    process.exit(1);
  }

  const rl = readline.createInterface({ input, output });
  let total = 0;
  let correct = 0;
  let evLossSum = 0;

  console.log('HRC Trainer MVP (Digite q para sair)\n');

  while (true) {
    const spot = pickRandom(spots);
    const hand = pickRandom(spot.hands);

    console.log(`Spot: player=${spot.player}, street=${spot.street}, arquivo=${spot.sourceFile}`);
    console.log(`Mão: ${hand.hand}`);
    console.log(`Ações: ${spot.actions.map((a) => `${a.code}=${actionLabel(a.code)}(${a.amount})`).join(' | ')}`);

    const ans = (await rl.question('Sua ação (F/R/C...): ')).trim().toUpperCase();
    if (ans === 'Q') break;

    const best = hand.bestAction;
    const bestEv = hand.ev[best];
    const chosenEv = hand.ev[ans] ?? Number.NEGATIVE_INFINITY;
    const evLoss = Number.isFinite(chosenEv) ? (bestEv - chosenEv) : bestEv;

    total += 1;
    if (ans === best) correct += 1;
    evLossSum += Math.max(0, evLoss);

    console.log(`Solver: ${actionLabel(best)} (${best})`);
    console.log(`Mix: ${Object.entries(hand.mix).map(([k, v]) => `${k}:${(v * 100).toFixed(1)}%`).join(', ')}`);
    console.log(`EV loss: ${Math.max(0, evLoss).toFixed(5)}`);
    console.log(`Score: ${correct}/${total} | Accuracy ${(correct / total * 100).toFixed(1)}%\n`);
  }

  rl.close();
  console.log(`\nFinal: ${correct}/${total} | Accuracy ${total ? (correct / total * 100).toFixed(1) : '0.0'}% | Avg EV loss ${total ? (evLossSum / total).toFixed(5) : '0.00000'}`);
}

main();
