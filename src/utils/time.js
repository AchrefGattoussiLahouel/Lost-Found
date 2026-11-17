const H = 3600000;
const t = (d) => new Date(d).getTime();

// Hours between loss and found
export const gapHours = (lost, found) => Math.max(0, (t(found.start) - t(lost.end)) / H);

// Hours before the loss 
export const foundPrecedesLossHours = (lost, found) =>
  Math.max(0, (t(lost.start) - t(found.end)) / H);
