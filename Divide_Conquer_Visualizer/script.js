/* ══════════════════════════════════════════
   ALGORITHM METADATA
   Each entry drives both the info panel and
   controls which visualizer type is used.
═══════════════════════════════════════════ */
const ALGOS = {
  merge: {
    name: 'Merge Sort',
    description:
      'Recursively splits the array into two halves, sorts each half, then merges them back in sorted order. The key insight: merging two sorted halves takes only O(n) time.',
    recurrence: 'T(n) = 2T(n/2) + Θ(n)',
    time:  'Θ(n log n)  — all cases',
    space: 'O(n) auxiliary',
    type: 'sort', legend: true,
  },
  quick: {
    name: 'Quick Sort',
    description:
      'Picks a pivot, partitions elements into those ≤ and > the pivot, then recursively sorts each side. In-place; the partition step is O(n) per level.',
    recurrence: 'T(n) = T(k) + T(n−k−1) + Θ(n)',
    time:  'Θ(n log n) avg  ·  O(n²) worst',
    space: 'O(log n) stack — average',
    type: 'sort', legend: true,
  },
  minmax: {
    name: 'Min & Max',
    description:
      'Splits the array in half, recursively finds min and max of each half, then combines. Uses ≤ 3n/2 − 2 comparisons versus 2n − 2 for the naive approach.',
    recurrence: 'T(n) = 2T(n/2) + Θ(1)',
    time:  'Θ(n)',
    space: 'O(log n) stack',
    type: 'minmax', legend: false,
  },
  subarray: {
    name: 'Maximum Subarray',
    description:
      'Divides the array at the midpoint and finds the maximum subarray in: the left half, the right half, or crossing the midpoint. The crossing check scans both sides in O(n).',
    recurrence: 'T(n) = 2T(n/2) + Θ(n)',
    time:  'Θ(n log n)',
    space: 'O(log n) stack',
    type: 'subarray', legend: false,
  },
  matrix: {
    name: 'Matrix Multiplication',
    description:
      'Splits each n×n matrix into four n/2×n/2 submatrices and makes 8 recursive calls. By the Master Theorem (a=8, b=2, f=n²), work is dominated by the 8 recursive calls.',
    recurrence: 'T(n) = 8T(n/2) + Θ(n²)',
    time:  'Θ(n³)',
    space: 'O(n²)',
    type: 'matrix', legend: false,
  },
  strassen: {
    name: "Strassen's Algorithm",
    description:
      'Uses 7 cleverly constructed products M₁–M₇ instead of 8, replacing one multiplication with extra additions. Asymptotically beats standard D&C matrix multiplication for large n.',
    recurrence: 'T(n) = 7T(n/2) + Θ(n²)',
    time:  'Θ(n^log₂7) ≈ Θ(n^2.807)',
    space: 'O(n²)',
    type: 'matrix', legend: false,
  },
  closest: {
    name: 'Closest Pair of Points',
    description:
      'Sorts by x, divides at median. Recursively finds closest pair in each half (distance δ), then checks the 2δ-wide strip around the divide line — at most 7 comparisons per point.',
    recurrence: 'T(n) = 2T(n/2) + Θ(n log n)',
    time:  'Θ(n log n)',
    space: 'O(n)',
    type: 'points', legend: false,
  },
  convex: {
    name: 'Convex Hull',
    description:
      'Sorts points by x, splits in half, recursively builds the hull of each half, then merges by computing upper and lower tangent lines connecting the two sub-hulls.',
    recurrence: 'T(n) = 2T(n/2) + Θ(n)',
    time:  'Θ(n log n)',
    space: 'O(n)',
    type: 'points', legend: false,
  },
};

/* ══════════════════════════════════════════
   GLOBAL STATE
═══════════════════════════════════════════ */
let currentArr    = [];   // array used by sort / minmax / subarray
let currentPoints = [];   // points used by closest / convex
let matA = null;          // matrix A
let matB = null;          // matrix B
let steps     = [];       // recorded animation steps for sort algorithms
let isRunning = false;    // prevents re-entry during animation

/* ══════════════════════════════════════════
   UTILITY HELPERS
═══════════════════════════════════════════ */
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/** Returns animation delay in ms based on the Speed slider (1–10). */
function getDelay() {
  const s = parseInt(document.getElementById('speedSlider').value);
  return Math.max(15, 580 - s * 52);
}

/** Updates the bottom step-message bar. Pass running=true to show the pulse dot. */
function setStepMsg(html, running = false) {
  const el = document.getElementById('stepMsg');
  el.innerHTML = running
    ? `<div class="pulse-dot"></div><span>${html}</span>`
    : `<span>${html}</span>`;
}

/* ══════════════════════════════════════════
   INFO PANEL — updates on every algorithm change
═══════════════════════════════════════════ */
function onAlgoChange() {
  const key  = document.getElementById('algorithm').value;
  const info = ALGOS[key];

  document.getElementById('algoName').textContent    = info.name;
  document.getElementById('description').textContent = info.description;
  document.getElementById('recurrence').textContent  = info.recurrence;
  document.getElementById('timeComp').textContent    = info.time;
  document.getElementById('spaceComp').textContent   = info.space;

  // Show sorting legend only for sort algorithms
  document.getElementById('legend').style.display = info.legend ? 'flex' : 'none';

  generateData();
}

/* ══════════════════════════════════════════
   DATA GENERATION — dispatches by algorithm type
═══════════════════════════════════════════ */
function generateData() {
  if (isRunning) return;
  const type = ALGOS[document.getElementById('algorithm').value].type;

  if      (type === 'sort' || type === 'minmax') genBarData(false);
  else if (type === 'subarray')                  genBarData(true);
  else if (type === 'matrix')                    genMatrixData();
  else if (type === 'points')                    genPointsData();
}

/* ══════════════════════════════════════════
   BAR DATA & RENDERING
═══════════════════════════════════════════ */

/** Generates a random integer array and renders it as bars.
 *  withNeg=true allows negative values (used by Maximum Subarray). */
function genBarData(withNeg) {
  const N = 30;
  currentArr = Array.from({ length: N }, () => {
    if (withNeg) {
      const v = Math.floor(Math.random() * 90) - 25;
      return v === 0 ? 5 : v;
    }
    return Math.floor(Math.random() * 90) + 10;
  });
  drawBars(currentArr, withNeg);
  setStepMsg('Data generated — click ▶ Start to run.');
}

/** Renders the current array as a bar chart inside the viz stage. */
function drawBars(arr, withNeg = false) {
  const stage = document.getElementById('vizStage');
  stage.innerHTML = '';

  const chart = document.createElement('div');
  chart.className = 'bar-chart';
  chart.id = 'barChart';
  stage.appendChild(chart);

  const maxAbs  = Math.max(...arr.map(Math.abs));
  const stageH  = stage.clientHeight || 280;
  const maxBarH = stageH - 32;

  arr.forEach((val, i) => {
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.id = `b${i}`;

    if (withNeg) {
      const h = Math.max(4, (Math.abs(val) / maxAbs) * (maxBarH * 0.46));
      bar.style.height = h + 'px';
      if (val < 0) {
        bar.style.alignSelf    = 'flex-start';
        bar.style.opacity      = '0.55';
        bar.style.marginBottom = 'auto';
      }
    } else {
      const h = Math.max(4, (val / maxAbs) * maxBarH);
      bar.style.height = h + 'px';
    }

    chart.appendChild(bar);
  });

  if (withNeg) {
    chart.style.alignItems = 'center';
    const base = document.createElement('div');
    base.style.cssText =
      'position:absolute;left:0;right:0;height:1px;background:rgba(255,255,255,.12);pointer-events:none;';
    stage.appendChild(base);
  }
}

/** Returns the DOM element for bar at index i. */
function getBar(i) {
  return document.getElementById(`b${i}`);
}

/* ══════════════════════════════════════════
   MATRIX DATA & RENDERING
═══════════════════════════════════════════ */

/** Generates two random 4×4 matrices and displays them side by side. */
function genMatrixData() {
  const sz = 4;
  matA = Array.from({ length: sz }, () =>
    Array.from({ length: sz }, () => Math.floor(Math.random() * 9) + 1)
  );
  matB = Array.from({ length: sz }, () =>
    Array.from({ length: sz }, () => Math.floor(Math.random() * 9) + 1)
  );
  drawMatrices(matA, matB, null);
  setStepMsg('Matrices generated — click ▶ Start to multiply.');
}

/**
 * Renders A, B, and optionally C = A×B as styled HTML tables.
 * Cells in C are highlighted with the .lit class.
 */
function drawMatrices(A, B, C) {
  const stage = document.getElementById('vizStage');
  stage.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = 'mat-viz';
  stage.appendChild(wrap);

  /** Creates a labeled matrix table element. */
  const mkMat = (M, lbl, highlight) => {
    const blk = document.createElement('div');
    blk.className = 'mat-block';

    const label = document.createElement('div');
    label.className = 'mat-lbl';
    label.textContent = lbl;
    blk.appendChild(label);

    const tbl = document.createElement('table');
    tbl.className = 'mat-tbl';
    M.forEach(row => {
      const tr = document.createElement('tr');
      row.forEach(v => {
        const td = document.createElement('td');
        td.textContent = v;
        if (highlight) td.classList.add('lit');
        tr.appendChild(td);
      });
      tbl.appendChild(tr);
    });
    blk.appendChild(tbl);
    return blk;
  };

  const mkOp = text => {
    const d = document.createElement('div');
    d.className = 'mat-op';
    d.textContent = text;
    return d;
  };

  wrap.appendChild(mkMat(A, 'Matrix A', false));
  wrap.appendChild(mkOp('×'));
  wrap.appendChild(mkMat(B, 'Matrix B', false));

  if (C) {
    const algo = document.getElementById('algorithm').value;
    const label = algo === 'strassen' ? "Result (Strassen's)" : 'Result (A × B)';
    wrap.appendChild(mkOp('='));
    wrap.appendChild(mkMat(C, label, true));
  }
}

/* ══════════════════════════════════════════
   POINTS DATA & RENDERING
═══════════════════════════════════════════ */

/** Generates 20 random 2D points and draws them on an SVG canvas. */
function genPointsData() {
  currentPoints = Array.from({ length: 20 }, () => ({
    x: Math.random() * 480 + 20,
    y: Math.random() * 280 + 20,
  }));
  drawPoints(currentPoints);
  setStepMsg('Points generated — click ▶ Start to run.');
}

/**
 * Renders all points onto an SVG canvas with optional:
 *   hullIdx  — indices of hull vertices (draws filled polygon)
 *   pairA/B  — indices of closest-pair points (draws connecting line)
 *   divX     — x-coordinate of the divide line
 */
function drawPoints(pts, hullIdx = [], pairA = -1, pairB = -1, divX = null) {
  const stage = document.getElementById('vizStage');
  stage.innerHTML = '';

  const W = stage.clientWidth  || 640;
  const H = stage.clientHeight || 320;
  const m = 30; // margin

  // Normalise point coordinates to fit within the stage
  const xs = pts.map(p => p.x);
  const ys = pts.map(p => p.y);
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  const y0 = Math.min(...ys), y1 = Math.max(...ys);
  const rx = x1 - x0 || 1;
  const ry = y1 - y0 || 1;
  const px = p => ((p.x - x0) / rx) * (W - 2 * m) + m;
  const py = p => ((p.y - y0) / ry) * (H - 2 * m) + m;

  const NS  = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.style.cssText = 'position:absolute;inset:0;';
  stage.appendChild(svg);

  /** Helper: creates an SVG element with given attributes. */
  const mk = (tag, attrs) => {
    const el = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  };

  // Background grid lines
  for (let i = 0; i <= 6; i++) {
    const gx = m + (i / 6) * (W - 2 * m);
    svg.appendChild(mk('line', { x1: gx, y1: m, x2: gx, y2: H - m, stroke: '#1c2d42', 'stroke-width': '1' }));
    const gy = m + (i / 6) * (H - 2 * m);
    svg.appendChild(mk('line', { x1: m, y1: gy, x2: W - m, y2: gy, stroke: '#1c2d42', 'stroke-width': '1' }));
  }

  // Divide line (closest pair)
  if (divX !== null) {
    const svgX = ((divX - x0) / rx) * (W - 2 * m) + m;
    svg.appendChild(mk('line', {
      x1: svgX, y1: m, x2: svgX, y2: H - m,
      stroke: 'rgba(124,106,240,.55)',
      'stroke-width': '1.5',
      'stroke-dasharray': '5,4',
    }));
  }

  // Convex hull polygon
  if (hullIdx.length >= 3) {
    const ptStr = hullIdx.map(i => `${px(pts[i])},${py(pts[i])}`).join(' ');
    svg.appendChild(mk('polygon', {
      points: ptStr,
      fill: 'rgba(0,229,192,.07)',
      stroke: 'rgba(0,229,192,.55)',
      'stroke-width': '1.8',
      'stroke-dasharray': '7,4',
    }));
  }

  // Closest pair connecting line
  if (pairA >= 0 && pairB >= 0) {
    svg.appendChild(mk('line', {
      x1: px(pts[pairA]), y1: py(pts[pairA]),
      x2: px(pts[pairB]), y2: py(pts[pairB]),
      stroke: 'var(--red)',
      'stroke-width': '2',
      'stroke-dasharray': '5,3',
    }));
  }

  // All points
  pts.forEach((p, i) => {
    const isPair = i === pairA || i === pairB;
    const isHull = hullIdx.includes(i);
    svg.appendChild(mk('circle', {
      cx: px(p), cy: py(p),
      r:    isPair ? 7 : isHull ? 6 : 4,
      fill: isPair ? 'var(--red)' : isHull ? 'var(--accent)' : '#3a6db5',
      opacity: '.88',
    }));
  });
}

/* ══════════════════════════════════════════
   SORT — STEP RECORDING (Merge Sort)
   Records all operations into `steps[]` before
   animation starts so replay speed can be changed.
═══════════════════════════════════════════ */
function recordMergeSort(a, l, r) {
  if (l >= r) return;
  const m = (l + r) >> 1;
  steps.push({ t: 'range', l, r });
  recordMergeSort(a, l, m);
  recordMergeSort(a, m + 1, r);
  recordMerge(a, l, m, r);
  steps.push({ t: 'sorted', l, r });
}

function recordMerge(a, l, m, r) {
  const L = a.slice(l, m + 1);
  const R = a.slice(m + 1, r + 1);
  let i = 0, j = 0, k = l;

  while (i < L.length && j < R.length) {
    steps.push({ t: 'cmp', i1: l + i, i2: m + 1 + j });
    if (L[i] <= R[j]) { a[k] = L[i++]; } else { a[k] = R[j++]; }
    steps.push({ t: 'set', idx: k, val: a[k] });
    k++;
  }
  // Copy remaining elements
  while (i < L.length) { a[k] = L[i++]; steps.push({ t: 'set', idx: k, val: a[k] }); k++; }
  while (j < R.length) { a[k] = R[j++]; steps.push({ t: 'set', idx: k, val: a[k] }); k++; }
}

/* ══════════════════════════════════════════
   SORT — STEP RECORDING (Quick Sort)
═══════════════════════════════════════════ */
function recordQuickSort(a, l, r) {
  if (l >= r) {
    if (l === r) steps.push({ t: 'sorted', l, r });
    return;
  }
  const pi = recordPartition(a, l, r);
  steps.push({ t: 'sorted', l: pi, r: pi });
  recordQuickSort(a, l, pi - 1);
  recordQuickSort(a, pi + 1, r);
}

function recordPartition(a, l, r) {
  steps.push({ t: 'pivot', idx: r });
  const pivot = a[r];
  let i = l - 1;

  for (let j = l; j < r; j++) {
    steps.push({ t: 'cmp', i1: j, i2: r });
    if (a[j] <= pivot) {
      i++;
      [a[i], a[j]] = [a[j], a[i]];
      if (i !== j) steps.push({ t: 'swap', i1: i, i2: j });
    }
  }
  [a[i + 1], a[r]] = [a[r], a[i + 1]];
  steps.push({ t: 'swap', i1: i + 1, i2: r });
  steps.push({ t: 'unpivot', idx: r });
  return i + 1;
}

/* ══════════════════════════════════════════
   SORT — STEP REPLAY (animates recorded steps)
═══════════════════════════════════════════ */
async function replaySort(orig) {
  const arr    = [...orig];
  const maxAbs = Math.max(...arr);
  const stageH = document.getElementById('vizStage').clientHeight || 280;
  const maxH   = stageH - 32;
  const ht     = v => Math.max(4, (v / maxAbs) * maxH) + 'px';

  const sorted = new Set();
  let   pivotI = -1;
  const d      = getDelay();
  const bar    = i => getBar(i);

  for (const s of steps) {
    if (!isRunning) break;

    switch (s.t) {

      case 'range':
        for (let i = s.l; i <= s.r; i++) {
          if (!sorted.has(i) && i !== pivotI) bar(i).className = 'bar active';
        }
        await sleep(d * 0.35);
        break;

      case 'cmp':
        bar(s.i1).className = 'bar cmp';
        if (s.i2 !== pivotI) bar(s.i2).className = 'bar cmp';
        await sleep(d * 0.8);
        if (!sorted.has(s.i1)) bar(s.i1).className = 'bar active';
        if (s.i2 !== pivotI && !sorted.has(s.i2)) bar(s.i2).className = 'bar active';
        break;

      case 'pivot':
        pivotI = s.idx;
        bar(s.idx).className = 'bar pivot';
        await sleep(d * 0.25);
        break;

      case 'unpivot':
        pivotI = -1;
        break;

      case 'swap': {
        const b1 = bar(s.i1), b2 = bar(s.i2);
        const h1 = b1.style.height, h2 = b2.style.height;
        b1.style.height = h2;
        b2.style.height = h1;
        b1.className = 'bar cmp';
        b2.className = 'bar cmp';
        await sleep(d * 0.55);
        if (!sorted.has(s.i1)) b1.className = 'bar active';
        if (!sorted.has(s.i2)) b2.className = 'bar active';
        break;
      }

      case 'set':
        arr[s.idx] = s.val;
        bar(s.idx).style.height = ht(s.val);
        bar(s.idx).className = 'bar cmp';
        await sleep(d * 0.28);
        if (!sorted.has(s.idx)) bar(s.idx).className = 'bar active';
        break;

      case 'sorted':
        for (let i = s.l; i <= s.r; i++) {
          sorted.add(i);
          bar(i).className = 'bar sorted';
        }
        await sleep(d * 0.15);
        break;
    }
  }
}

/* ══════════════════════════════════════════
   MIN & MAX — Divide & Conquer
═══════════════════════════════════════════ */
function doMinMax(a, l, r) {
  if (l === r) return { min: a[l], minI: l, max: a[l], maxI: l };
  const m = (l + r) >> 1;
  const L = doMinMax(a, l, m);
  const R = doMinMax(a, m + 1, r);
  return {
    min:  L.min  <= R.min  ? L.min  : R.min,
    minI: L.min  <= R.min  ? L.minI : R.minI,
    max:  L.max  >= R.max  ? L.max  : R.max,
    maxI: L.max  >= R.max  ? L.maxI : R.maxI,
  };
}

/* ══════════════════════════════════════════
   MAXIMUM SUBARRAY — Divide & Conquer (Kadane variant)
═══════════════════════════════════════════ */

/** Finds the maximum crossing subarray at the midpoint. */
function maxCross(a, l, m, r) {
  let lSum = -Infinity, sum = 0, lo = m;
  for (let i = m; i >= l; i--) {
    sum += a[i];
    if (sum > lSum) { lSum = sum; lo = i; }
  }
  let rSum = -Infinity; sum = 0; let hi = m + 1;
  for (let j = m + 1; j <= r; j++) {
    sum += a[j];
    if (sum > rSum) { rSum = sum; hi = j; }
  }
  return { sum: lSum + rSum, lo, hi };
}

/** Recursively finds the maximum subarray in a[l..r]. */
function maxSub(a, l, r) {
  if (l === r) return { sum: a[l], lo: l, hi: l };
  const m = (l + r) >> 1;
  const L = maxSub(a, l, m);
  const R = maxSub(a, m + 1, r);
  const C = maxCross(a, l, m, r);
  if (L.sum >= R.sum && L.sum >= C.sum) return L;
  if (R.sum >= L.sum && R.sum >= C.sum) return R;
  return C;
}

/* ══════════════════════════════════════════
   MATRIX MULTIPLICATION
═══════════════════════════════════════════ */

/** Standard O(n³) matrix multiplication. */
function matMul(A, B) {
  const n = A.length;
  const C = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      for (let k = 0; k < n; k++)
        C[i][j] += A[i][k] * B[k][j];
  return C;
}

/**
 * Strassen's algorithm — uses 7 recursive multiplications (M₁–M₇)
 * instead of 8, replacing one multiplication with additions.
 */
function strassen(A, B) {
  const n = A.length;
  if (n === 1) return [[A[0][0] * B[0][0]]];

  const add = (X, Y) => X.map((row, i) => row.map((v, j) => v + Y[i][j]));
  const sub = (X, Y) => X.map((row, i) => row.map((v, j) => v - Y[i][j]));
  const h   = n >> 1;

  // Split matrix M into 4 submatrices [A11, A12, A21, A22]
  const split = M => {
    const a = [], b = [], c = [], d = [];
    for (let i = 0; i < h; i++) {
      a.push(M[i].slice(0, h));
      b.push(M[i].slice(h));
      c.push(M[i + h].slice(0, h));
      d.push(M[i + h].slice(h));
    }
    return [a, b, c, d];
  };

  const [A11, A12, A21, A22] = split(A);
  const [B11, B12, B21, B22] = split(B);

  // The 7 Strassen products
  const M1 = strassen(add(A11, A22), add(B11, B22));
  const M2 = strassen(add(A21, A22), B11);
  const M3 = strassen(A11,           sub(B12, B22));
  const M4 = strassen(A22,           sub(B21, B11));
  const M5 = strassen(add(A11, A12), B22);
  const M6 = strassen(sub(A21, A11), add(B11, B12));
  const M7 = strassen(sub(A12, A22), add(B21, B22));

  // Combine into result matrix C
  const C = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < h; i++) {
    for (let j = 0; j < h; j++) {
      C[i][j]         = M1[i][j] + M4[i][j] - M5[i][j] + M7[i][j];
      C[i][j + h]     = M3[i][j] + M5[i][j];
      C[i + h][j]     = M2[i][j] + M4[i][j];
      C[i + h][j + h] = M1[i][j] - M2[i][j] + M3[i][j] + M6[i][j];
    }
  }
  return C;
}

/* ══════════════════════════════════════════
   GEOMETRIC ALGORITHMS
═══════════════════════════════════════════ */

/** Brute-force closest pair (sufficient for n≤20 demo). */
function closestPair(pts) {
  let minD = Infinity, a = 0, b = 1;
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const dx = pts[i].x - pts[j].x;
      const dy = pts[i].y - pts[j].y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < minD) { minD = d; a = i; b = j; }
    }
  }
  return { dist: minD, a, b };
}

/** Andrew's monotone chain convex hull (O(n log n)). */
function convexHull(pts) {
  const n = pts.length;
  if (n < 3) return pts.map((_, i) => i);

  const cross = (O, A, B) =>
    (A.x - O.x) * (B.y - O.y) - (A.y - O.y) * (B.x - O.x);

  const sorted = pts
    .map((p, i) => ({ ...p, i }))
    .sort((a, b) => a.x - b.x || a.y - b.y);

  const lo = [], hi = [];

  for (const p of sorted) {
    while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], p) <= 0)
      lo.pop();
    lo.push(p);
  }
  for (const p of [...sorted].reverse()) {
    while (hi.length >= 2 && cross(hi[hi.length - 2], hi[hi.length - 1], p) <= 0)
      hi.pop();
    hi.push(p);
  }

  hi.pop();
  lo.pop();
  return [...lo, ...hi].map(p => p.i);
}

/* ══════════════════════════════════════════
   RESULT OVERLAY
═══════════════════════════════════════════ */

/** Appends a translucent overlay at the bottom of the viz stage. */
function addOverlay(html) {
  const stage = document.getElementById('vizStage');
  const d = document.createElement('div');
  d.className = 'result-overlay';
  d.innerHTML = html;
  stage.appendChild(d);
}

/* ══════════════════════════════════════════
   MAIN DISPATCHER — runAlgorithm()
   Called by the ▶ Start button.
═══════════════════════════════════════════ */
async function runAlgorithm() {
  if (isRunning) return;
  isRunning = true;

  const startBtn = document.getElementById('startBtn');
  startBtn.disabled    = true;
  startBtn.textContent = '⏳ Running…';

  try {
    const key  = document.getElementById('algorithm').value;
    const type = ALGOS[key].type;

    /* ── Sorting Algorithms ── */
    if (type === 'sort') {
      steps = [];
      const arr = [...currentArr];
      if (key === 'merge') recordMergeSort(arr, 0, arr.length - 1);
      else                 recordQuickSort(arr, 0, arr.length - 1);
      setStepMsg(`Running ${ALGOS[key].name}… ${steps.length} operations recorded`, true);
      await replaySort(currentArr);
      setStepMsg(`✓ ${ALGOS[key].name} complete — ${steps.length} steps`);
    }

    /* ── Min & Max ── */
    else if (type === 'minmax') {
      setStepMsg('Searching for minimum and maximum…', true);
      await sleep(250);
      const r = doMinMax(currentArr, 0, currentArr.length - 1);
      currentArr.forEach((_, i) => {
        const b = getBar(i);
        b.className = 'bar';
        if (i === r.minI)      b.classList.add('min-b');
        else if (i === r.maxI) b.classList.add('max-b');
      });
      addOverlay(
        `<span style="color:var(--red)">■ Min = ${r.min}</span>&nbsp;&nbsp;&nbsp;` +
        `<span style="color:var(--green)">■ Max = ${r.max}</span>`
      );
      setStepMsg(`✓ Min = ${r.min} (index ${r.minI})  |  Max = ${r.max} (index ${r.maxI})`);
    }

    /* ── Maximum Subarray ── */
    else if (type === 'subarray') {
      setStepMsg('Finding maximum subarray sum…', true);
      await sleep(350);
      const r = maxSub(currentArr, 0, currentArr.length - 1);
      currentArr.forEach((v, i) => {
        const b = getBar(i);
        if (i >= r.lo && i <= r.hi) { b.className = 'bar hi'; b.style.opacity = '1'; }
        else                        { b.className = 'bar dim'; }
      });
      addOverlay(
        `Max sum = <strong style="color:var(--gold)">${r.sum}</strong>` +
        `&nbsp;&nbsp;|&nbsp;&nbsp;indices [${r.lo} … ${r.hi}]`
      );
      setStepMsg(`✓ Maximum subarray: [${r.lo}…${r.hi}]  sum = ${r.sum}`);
    }

    /* ── Matrix Algorithms ── */
    else if (type === 'matrix') {
      setStepMsg(`Computing ${ALGOS[key].name}…`, true);
      await sleep(400);
      const C    = key === 'strassen' ? strassen(matA, matB) : matMul(matA, matB);
      const note = key === 'strassen' ? '7 multiplications (Strassen)' : '8 multiplications (standard)';
      drawMatrices(matA, matB, C);
      setStepMsg(`✓ Result computed using ${note}`);
    }

    /* ── Geometric Algorithms ── */
    else if (type === 'points') {
      setStepMsg(`Running ${ALGOS[key].name}…`, true);
      await sleep(300);
      if (key === 'closest') {
        const r    = closestPair(currentPoints);
        const midX = (currentPoints[r.a].x + currentPoints[r.b].x) / 2;
        drawPoints(currentPoints, [], r.a, r.b, midX);
        setStepMsg(`✓ Closest pair: points #${r.a} & #${r.b}  distance = ${r.dist.toFixed(2)}`);
      } else {
        const hull = convexHull(currentPoints);
        drawPoints(currentPoints, hull);
        setStepMsg(`✓ Convex hull: ${hull.length} vertices`);
      }
    }

  } finally {
    isRunning            = false;
    startBtn.disabled    = false;
    startBtn.textContent = '▶ Start';
  }
}

/* ══════════════════════════════════════════
   INITIALISE — populate info panel on page load
═══════════════════════════════════════════ */
onAlgoChange();
