const H = 3600000;
const t = (d) => new Date(d).getTime();

// Hours between the loss and found events.
// Posts may omit end dates, in which case their start date is used.
export const gapHours = (lost, found) => {
  const lossTime = t(lost.end) || t(lost.start);
  const foundTime = t(found.start) || t(found.end);
  if (!lossTime || !foundTime) return 0;
  return Math.max(0, (foundTime - lossTime) / H);
};

// Hours before the loss that the found item was recorded.
export const foundPrecedesLossHours = (lost, found) => {
  const lossTime = t(lost.start);
  const foundTime = t(found.end) || t(found.start);
  if (!lossTime || !foundTime) return 0;
  return Math.max(0, (lossTime - foundTime) / H);
};
