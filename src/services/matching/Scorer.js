import { cosine, clamp } from "../../utils/vector.js";
import { haversineMeters } from "../../utils/geo.js";
import { gapHours } from "../../utils/time.js";

export class Scorer {
  constructor(cfg) {
    this.cfg = cfg;
  }

  semanticScore(a, b) {
    return clamp(cosine(a.textEmbedding, b.textEmbedding));
  }

  visualScore(a, b) {
    if (!a.imageEmbedding?.length || !b.imageEmbedding?.length) return null;
    return clamp(cosine(a.imageEmbedding, b.imageEmbedding));
  }

  spatialScore(d) {
    const s = this.cfg.sigmaMeters;
    return Math.exp(-(d * d) / (2 * s * s));
  }

  temporalScore(gap) {
    return Math.exp(-gap / this.cfg.tauHours);
  }

  calculate(scores) {
    const { weights } = this.cfg;

    return (
      scores.semantic * weights.semantic +
      scores.visual * weights.visual +
      scores.spatial * weights.spatial +
      scores.temporal * weights.temporal
    );
  }

  scorePair(lost, found) {
    const [lngL, latL] = lost.location.coordinates;
    const [lngF, latF] = found.location.coordinates;

    const scores = {
      semantic: this.semanticScore(lost, found),
      visual: this.visualScore(lost, found),
      spatial: this.spatialScore(haversineMeters(latL, lngL, latF, lngF)),
      temporal: this.temporalScore(gapHours(lost, found)),
    };

    return {
      ...scores,
      total: this.calculate(scores),
    };
  }
}
