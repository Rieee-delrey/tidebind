// Everything the eye sees: the felt table, the two hands, the played cards,
// the life and Tide totals, and the title, win and loss screens. All drawing
// is canvas shapes and text, no images, so the game needs no network at all.
import { CANVAS_HEIGHT, CANVAS_WIDTH, MAX_TIDE, SUITS, keywordLabel } from './config.js';

const CARD_W = 132;
const CARD_H = 186;
const BIG_W = 168;
const BIG_H = 236;

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

// Each suit's shape: flame, wave, leaf, diamond. Colour and shape together
// carry the suit, never text alone.
export function drawGlyph(ctx, glyph, x, y, size, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, size * 0.09);
  ctx.lineJoin = 'round';
  if (glyph === 'flame') {
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.55);
    ctx.quadraticCurveTo(x - size * 0.55, y + size * 0.1, x - size * 0.15, y - size * 0.35);
    ctx.quadraticCurveTo(x - size * 0.05, y - size * 0.05, x + size * 0.08, y - size * 0.28);
    ctx.quadraticCurveTo(x + size * 0.1, y - size * 0.62, x + size * 0.28, y - size * 0.55);
    ctx.quadraticCurveTo(x + size * 0.55, y - size * 0.05, x + size * 0.3, y + size * 0.55);
    ctx.quadraticCurveTo(x, y + size * 0.75, x, y + size * 0.55);
    ctx.fill();
  } else if (glyph === 'wave') {
    ctx.beginPath();
    for (let wave = 0; wave < 3; wave += 1) {
      const wy = y - size * 0.3 + wave * size * 0.32;
      ctx.moveTo(x - size * 0.5, wy);
      ctx.quadraticCurveTo(x - size * 0.25, wy - size * 0.28, x, wy);
      ctx.quadraticCurveTo(x + size * 0.25, wy + size * 0.28, x + size * 0.5, wy);
    }
    ctx.stroke();
  } else if (glyph === 'leaf') {
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.55);
    ctx.quadraticCurveTo(x + size * 0.55, y - size * 0.2, x + size * 0.2, y + size * 0.4);
    ctx.quadraticCurveTo(x - size * 0.1, y + size * 0.6, x - size * 0.45, y + size * 0.25);
    ctx.quadraticCurveTo(x - size * 0.5, y - size * 0.3, x, y - size * 0.55);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.55);
    ctx.lineTo(x + size * 0.12, y + size * 0.75);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.55);
    ctx.lineTo(x + size * 0.45, y);
    ctx.lineTo(x, y + size * 0.55);
    ctx.lineTo(x - size * 0.45, y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.55);
    ctx.lineTo(x + size * 0.45, y);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawTidePips(ctx, x, y, filled, total) {
  for (let index = 0; index < total; index += 1) {
    const px = x + index * 20;
    ctx.beginPath();
    ctx.arc(px, y, 7, 0, Math.PI * 2);
    ctx.fillStyle = index < filled ? '#4ab8ff' : 'rgba(255,255,255,0.18)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

function drawLife(ctx, x, y, life, maxLife, alignRight) {
  const barWidth = 150;
  const bx = alignRight ? x - barWidth : x;
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  roundRect(ctx, bx, y, barWidth, 14, 7);
  ctx.fill();
  ctx.fillStyle = life > 6 ? '#ff5d73' : '#ffb02e';
  roundRect(ctx, bx, y, Math.max(0, (barWidth * life) / maxLife), 14, 7);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px Georgia, serif';
  ctx.textAlign = alignRight ? 'right' : 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`♥ ${life}`, alignRight ? bx - 12 : bx + barWidth + 12, y + 7);
}

function drawCardFace(ctx, card, x, y, width, height, opts = {}) {
  const suit = SUITS[card.suit];
  const scale = width / CARD_W;
  ctx.save();
  if (opts.winner) {
    ctx.shadowColor = '#ffd76a';
    ctx.shadowBlur = 26;
  }
  ctx.fillStyle = '#fdf6e3';
  roundRect(ctx, x, y, width, height, 12 * scale);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = suit.dark;
  ctx.lineWidth = 3 * scale;
  roundRect(ctx, x + 1.5, y + 1.5, width - 3, height - 3, 12 * scale);
  ctx.stroke();
  ctx.fillStyle = suit.color;
  roundRect(ctx, x, y, width, 34 * scale, 12 * scale);
  ctx.fill();
  ctx.fillRect(x, y + 22 * scale, width, 12 * scale);
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${15 * scale}px Georgia, serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(suit.label.toUpperCase(), x + 10 * scale, y + 17 * scale);
  ctx.textAlign = 'right';
  ctx.fillText(`◈ ${card.cost}`, x + width - 10 * scale, y + 17 * scale);
  ctx.fillStyle = suit.dark;
  ctx.font = `bold ${58 * scale}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.fillText(String(card.power), x + width / 2, y + height * 0.42);
  drawGlyph(ctx, suit.glyph, x + width / 2, y + height * 0.68, 34 * scale, suit.color);
  ctx.fillStyle = '#2b2b26';
  ctx.font = `bold ${14.5 * scale}px Georgia, serif`;
  ctx.fillText(card.name, x + width / 2, y + height - 34 * scale);
  if (card.keyword) {
    ctx.fillStyle = suit.dark;
    ctx.font = `${11 * scale}px Georgia, serif`;
    ctx.fillText(keywordLabel(card.keyword), x + width / 2, y + height - 16 * scale);
  }
  if (opts.dimmed) {
    ctx.fillStyle = 'rgba(20,30,40,0.45)';
    roundRect(ctx, x, y, width, height, 12 * scale);
    ctx.fill();
  }
  ctx.restore();
}

function drawCardBack(ctx, x, y, width, height) {
  const scale = width / CARD_W;
  ctx.fillStyle = '#14586b';
  roundRect(ctx, x, y, width, height, 12 * scale);
  ctx.fill();
  ctx.strokeStyle = '#ffd76a';
  ctx.lineWidth = 2.5 * scale;
  roundRect(ctx, x + 4, y + 4, width - 8, height - 8, 9 * scale);
  ctx.stroke();
  drawGlyph(ctx, 'wave', x + width / 2, y + height * 0.42, 44 * scale, '#ffd76a');
  ctx.fillStyle = '#ffd76a';
  ctx.font = `bold ${13 * scale}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.fillText('TIDE', x + width / 2, y + height * 0.66);
  ctx.fillText('BIND', x + width / 2, y + height * 0.66 + 16 * scale);
}

function drawTable(ctx) {
  const gradient = ctx.createRadialGradient(640, 360, 80, 640, 360, 760);
  gradient.addColorStop(0, '#1d5a66');
  gradient.addColorStop(0.6, '#123f4a');
  gradient.addColorStop(1, '#0a2830');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.strokeStyle = 'rgba(255,215,106,0.55)';
  ctx.lineWidth = 3;
  roundRect(ctx, 14, 14, CANVAS_WIDTH - 28, CANVAS_HEIGHT - 28, 22);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(640, 360, 205, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(640, 360, 150, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.font = 'bold 120px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('~', 640, 352);
}

function drawTopBar(ctx, state) {
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('TIDEBIND', 34, 40);
  ctx.font = '16px Georgia, serif';
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.textAlign = 'center';
  ctx.fillText(`Round ${state.round}   •   You ${state.playerRounds} — ${state.rivalRounds} Rook`, 640, 40);
  ctx.textAlign = 'right';
  ctx.fillText('1-5 play  •  D discard  •  R restart', 1246, 40);
}

function drawSidePanel(ctx, state, side) {
  const isPlayer = side === 'player';
  const name = isPlayer ? 'YOU' : 'ROOK';
  const life = isPlayer ? state.playerLife : state.rivalLife;
  const tide = isPlayer ? state.playerTide : state.rivalTide;
  const x = isPlayer ? 34 : 1246;
  const y = isPlayer ? 628 : 104;
  const alignRight = !isPlayer;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.textAlign = alignRight ? 'right' : 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, x, y - 22);
  drawLife(ctx, x, y, life, 20, alignRight);
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.font = '14px Georgia, serif';
  ctx.fillText('Tide', alignRight ? x - 118 : x, y + 30);
  drawTidePips(ctx, alignRight ? x - 108 : x + 40, y + 30, tide, MAX_TIDE);
  if (!isPlayer && state.lastRivalSuit) {
    ctx.fillStyle = '#ffd76a';
    ctx.font = 'bold 14px Georgia, serif';
    ctx.fillText(`Rook's last suit: ${SUITS[state.lastRivalSuit].label}`, x, y + 52);
  }
  if (isPlayer && state.lastPlayerSuit) {
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '14px Georgia, serif';
    ctx.fillText(`Your last suit: ${SUITS[state.lastPlayerSuit].label}`, x, y + 52);
  }
}

function drawHand(ctx, state, view) {
  const hand = state.playerHand;
  const totalWidth = hand.length * 118;
  const startX = 640 - totalWidth / 2;
  const baseY = 496;
  view.handRects = [];
  hand.forEach((card, index) => {
    const hovered = view.hoverIndex === index;
    const x = startX + index * 118;
    const y = hovered ? baseY - 26 : baseY;
    const affordable = card.cost <= state.playerTide;
    view.handRects.push({ x, y, width: CARD_W, height: CARD_H, card, index });
    drawCardFace(ctx, card, x, y, CARD_W, CARD_H, {
      dimmed: state.phase === 'choose' && !affordable,
    });
    if (state.discardMode) {
      ctx.fillStyle = '#ffd76a';
      ctx.font = 'bold 13px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('DISCARD?', x + CARD_W / 2, y - 8);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.font = '13px Georgia, serif';
    ctx.fillText(`[${index + 1}]`, x + CARD_W / 2, y + CARD_H + 16);
  });
}

function drawRivalHand(ctx, state) {
  const count = state.rivalHand.length;
  const totalWidth = count * 62;
  const startX = 640 - totalWidth / 2;
  for (let index = 0; index < count; index += 1) {
    drawCardBack(ctx, startX + index * 62, 66, 54, 76);
  }
}

function drawPlayed(ctx, state) {
  const playerCard = state.playerPlayed;
  const rivalCard = state.rivalPlayed;
  const result = state.lastResult;
  if (!playerCard && !rivalCard) {
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = 'italic 18px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('Play a card — the duel is yours to open.', 640, 330);
    return;
  }
  if (rivalCard) {
    const winner = result && result.winner === 'rival';
    drawCardFace(ctx, rivalCard, 640 - BIG_W - 24, 168, BIG_W, BIG_H, { winner });
    if (result) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(result.rivalPower), 640 - BIG_W / 2 - 24, 168 + BIG_H + 28);
    }
  }
  if (playerCard) {
    const winner = result && result.winner === 'player';
    drawCardFace(ctx, playerCard, 640 + 24, 168, BIG_W, BIG_H, { winner });
    if (result) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(result.playerPower), 640 + 24 + BIG_W / 2, 168 + BIG_H + 28);
    }
  }
  if (result && result.winner !== 'tie') {
    ctx.fillStyle = '#ffd76a';
    ctx.font = 'bold 20px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      result.winner === 'player' ? `You take the trick — ${result.damage} damage` : `Rook takes the trick — ${result.damage} damage`,
      640,
      150,
    );
  } else if (result) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('A dead tie — no damage.', 640, 150);
  }
}

function drawLog(ctx, state) {
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  roundRect(ctx, 240, 452, 800, 34, 17);
  ctx.fill();
  ctx.fillStyle = '#ffe9b0';
  ctx.font = '15px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(state.log, 640, 470);
}

function drawTitle(ctx, state) {
  drawTable(ctx);
  ctx.fillStyle = '#ffd76a';
  ctx.font = 'bold 92px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('TIDEBIND', 640, 150);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'italic 26px Georgia, serif';
  ctx.fillText('A duel of four tides. One card a round. Twenty life on the line.', 640, 212);
  const sample = [
    { suit: 'ember', power: 6, name: 'Inferno Wyrm', keyword: 'echo', cost: 2 },
    { suit: 'tide', power: 5, name: 'Storm Eel', keyword: 'surge', cost: 2 },
    { suit: 'thorn', power: 4, name: 'Ivy Owl', keyword: null, cost: 1 },
    { suit: 'stone', power: 3, name: 'Slate Badger', keyword: null, cost: 1 },
  ];
  sample.forEach((card, index) => {
    drawCardFace(ctx, card, 640 - 300 + index * 152, 268, CARD_W, CARD_H);
  });
  ctx.fillStyle = '#ffffff';
  ctx.font = '18px Georgia, serif';
  ctx.fillText('Ember burns Thorn  •  Thorn drinks Tide  •  Tide wears Stone  •  Stone smothers Ember', 640, 500);
  ctx.fillText('Suit edge +3  •  Surge +2 on a full Tide  •  Echo returns if you lose  •  Discard a card for +2 Tide', 640, 530);
  ctx.fillStyle = '#ffd76a';
  ctx.font = 'bold 24px Georgia, serif';
  ctx.fillText('Click or press Enter to begin', 640, 592);
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '15px Georgia, serif';
  ctx.fillText('Keys 1-5 play a card  •  D then click discards  •  First to sink the other to 0 life wins', 640, 628);
}

function drawEnd(ctx, state, won) {
  drawTable(ctx);
  if (won) {
    const glow = ctx.createRadialGradient(640, 300, 40, 640, 300, 420);
    glow.addColorStop(0, 'rgba(255,215,106,0.35)');
    glow.addColorStop(1, 'rgba(255,215,106,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }
  ctx.fillStyle = won ? '#ffd76a' : '#9db8c4';
  ctx.font = 'bold 76px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(won ? 'THE TIDE IS YOURS' : 'THE TIDE TAKES YOU', 640, 250);
  ctx.fillStyle = '#ffffff';
  ctx.font = '28px Georgia, serif';
  ctx.fillText(
    won ? 'Rook sinks beneath the waves. The table is yours.' : 'Rook stands over the table. The tide was stronger today.',
    640,
    318,
  );
  ctx.font = 'bold 34px Georgia, serif';
  ctx.fillText(`Final life  You ${Math.max(0, state.playerLife)}  —  ${Math.max(0, state.rivalLife)} Rook`, 640, 396);
  ctx.font = '22px Georgia, serif';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText(`Tricks won  You ${state.playerRounds}  —  ${state.rivalRounds} Rook   •   ${state.round} rounds played`, 640, 444);
  ctx.fillStyle = '#ffd76a';
  ctx.font = 'bold 24px Georgia, serif';
  ctx.fillText('Press R to play again', 640, 520);
}

export function render(ctx, state, view) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  if (state.screen === 'title') {
    drawTitle(ctx, state);
    return;
  }
  if (state.screen === 'win') {
    drawEnd(ctx, state, true);
    return;
  }
  if (state.screen === 'loss') {
    drawEnd(ctx, state, false);
    return;
  }
  drawTable(ctx);
  drawTopBar(ctx, state);
  drawSidePanel(ctx, state, 'rival');
  drawSidePanel(ctx, state, 'player');
  drawRivalHand(ctx, state);
  drawPlayed(ctx, state);
  drawLog(ctx, state);
  drawHand(ctx, state, view);
}
