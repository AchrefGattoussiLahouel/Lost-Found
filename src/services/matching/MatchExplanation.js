export class MatchExplanation {
  semantic(score) {
    return `Text similarity: ${(score * 100).toFixed(1)}%`;
  }

  visual(score) {
    if (score === null) return "Visual similarity unavailable";
    return `Image similarity: ${(score * 100).toFixed(1)}%`;
  }

  spatial(score, distance) {
    return `Location match: ${(score * 100).toFixed(1)}% (${Math.round(distance)} m apart)`;
  }

  temporal(score) {
    return `Time match: ${(score * 100).toFixed(1)}%`;
  }

  build(scores, distance) {
    const explanations = [
      this.semantic(scores.semantic),
      this.spatial(scores.spatial, distance),
      this.temporal(scores.temporal),
    ];

    if (scores.visual !== null) {
      explanations.push(this.visual(scores.visual));
    }

    return explanations;
  }
}
