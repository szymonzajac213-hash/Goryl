const SUFFIXES = [
  '',
  'K',
  'M',
  'B',
  'T',
  'Qa',
  'Qi',
  'Sx',
  'Sp',
  'Oc',
  'No',
  'Dc',
  'Ud',
  'Dd',
  'Td',
  'Qad',
  'Qid',
  'Sxd',
  'Spd',
  'Ocd',
  'Nod',
  'Vg',
];

export function formatNumber(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return '∞';
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);

  if (abs < 1000) {
    if (abs < 10 && Math.abs(abs - Math.round(abs)) > 0.05 && decimals > 0) {
      return `${sign}${abs.toFixed(1).replace(/\.0$/, '')}`;
    }
    return `${sign}${Math.floor(abs).toLocaleString('pl-PL')}`;
  }

  const tier = Math.floor(Math.log10(abs) / 3);
  if (tier < SUFFIXES.length) {
    const scaled = abs / Math.pow(10, tier * 3);
    const formatted =
      scaled >= 100
        ? scaled.toFixed(0)
        : scaled >= 10
          ? scaled.toFixed(1).replace(/\.0$/, '')
          : scaled.toFixed(decimals).replace(/\.?0+$/, '');
    return `${sign}${formatted}${SUFFIXES[tier]}`;
  }

  return `${sign}${abs.toExponential(2)}`;
}

export function formatInteger(value: number): string {
  if (!Number.isFinite(value)) return '∞';
  const abs = Math.abs(value);
  if (abs < 1000) return Math.floor(value).toString();
  return formatNumber(value, 1);
}

export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (hrs > 0) {
    return `${hrs}h ${mins}m ${secs}s`;
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}
