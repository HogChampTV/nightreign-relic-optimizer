// Runs the combo search on a pool of module workers (one vessel per task),
// adapted for Vite from nightreign-relic-vault's combo-client.js (MIT).
// Falls back to a main-thread search when workers are unavailable.

import { mergeResults, runSearch } from "../engine/combo-core.js";

const POOL_SIZE = Math.max(1, Math.min(8, (navigator.hardwareConcurrency || 4) - 1));
let pool = [];
let rejectCurrent = null;
let workersBroken = null;

export class SearchCancelled extends Error {}

export function cancelSearch() {
  for (const w of pool) w.terminate();
  pool = [];
  if (rejectCurrent) {
    const reject = rejectCurrent;
    rejectCurrent = null;
    reject(new SearchCancelled("cancelled"));
  }
}

function runOnMainThread(input, started) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const res = runSearch(input, {});
        resolve({ ...res, ms: Math.round(performance.now() - started), mainThread: true });
      } catch (err) {
        reject(err);
      }
    }, 30);
  });
}

/** Resolves to { combinations, checked, ms }; rejects with SearchCancelled if superseded. */
export function searchCombos(input) {
  cancelSearch();
  const vesselCount = input.enabled_vessels.length;
  if (vesselCount === 0) return Promise.resolve({ combinations: [], checked: 0, ms: 0 });
  const started = performance.now();
  if (workersBroken) return runOnMainThread(input, started);

  try {
    pool = Array.from(
      { length: Math.min(POOL_SIZE, vesselCount) },
      () => new Worker(new URL("../engine/combo-worker.js", import.meta.url), { type: "module" }),
    );
  } catch (err) {
    workersBroken = String(err?.message ?? err);
    return runOnMainThread(input, started);
  }

  return new Promise((resolve, reject) => {
    const perVessel = new Array(vesselCount);
    let next = 0, done = 0;
    const settle = () => {
      rejectCurrent = null;
      for (const w of pool) w.terminate();
      pool = [];
    };
    const fallBack = (detail) => {
      settle();
      workersBroken = detail;
      console.error("[optimizer] combo worker failed; retrying on the main thread:", detail);
      runOnMainThread(input, started).then(resolve, reject);
    };
    rejectCurrent = reject;

    const dispatch = (worker) => {
      if (next >= vesselCount) return;
      const v = next++;
      worker.postMessage({ id: v, input, vessels: [v], options: {} });
    };
    for (const worker of pool) {
      worker.onmessage = ({ data }) => {
        if (rejectCurrent !== reject) return;
        if (data.error) {
          if (data.phase === "search") {
            settle();
            return reject(new Error(data.error));
          }
          return fallBack(data.error);
        }
        perVessel[data.id] = data.perVessel[0];
        if (++done === vesselCount) {
          rejectCurrent = null;
          settle();
          resolve({ ...mergeResults(perVessel), ms: Math.round(performance.now() - started) });
        } else {
          dispatch(worker);
        }
      };
      worker.onmessageerror = () => rejectCurrent === reject && fallBack("worker messageerror");
      worker.onerror = (e) => {
        e.preventDefault?.();
        if (rejectCurrent === reject) fallBack(e.message || "worker stopped without a reason");
      };
      dispatch(worker);
    }
  });
}
