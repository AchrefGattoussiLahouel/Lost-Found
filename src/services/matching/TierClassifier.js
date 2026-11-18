export class TierClassifier {
  constructor(cfg) {
    this.cfg = cfg;
  }

  classify(total) {
    if (total >= this.cfg.alertThreshold) return 'ALERT';
    if (total >= this.cfg.possibleThreshold) return 'POSSIBLE';
    return 'DISCARD';
  }
}
