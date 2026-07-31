import { ZxcvbnFactory } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en';

const zxcvbnInstance = new ZxcvbnFactory({
  translations: zxcvbnEnPackage.translations,
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
  },
});

export function computeVaultHealth(sites) {
  if (!Array.isArray(sites) || sites.length === 0) {
    return { total: 0, weak: 0, reused: 0, noBackup: 0, score: null };
  }

  // Reuse: count sites whose password appears more than once
  const counts = new Map();
  for (const s of sites) {
    counts.set(s.password, (counts.get(s.password) || 0) + 1);
  }
  const reused = sites.filter((s) => counts.get(s.password) > 1).length;

  // Weak: zxcvbn score <= 2
  const weak = sites.filter((s) => zxcvbnInstance.check(s.password).score <= 2).length;

  // Missing backup codes
  const noBackup = sites.filter((s) => !s.backup_code?.trim()).length;

  // Simple health score: start at 100, subtract weighted penalties, floor at 0
  const total = sites.length;
  const penalty =
    (weak / total) * 45 + (reused / total) * 40 + (noBackup / total) * 15;
  const score = Math.max(0, Math.round(100 - penalty));

  return { total, weak, reused, noBackup, score };
}