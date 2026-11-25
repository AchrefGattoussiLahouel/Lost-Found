import { matchingConfig } from "../config/matching.js";
import { modelsConfig } from "../config/models.js";
import { EmbeddingService } from "./embedding.service.js";
import { TicketService } from "./ticket.service.js";
import { Scorer } from "./matching/Scorer.js";
import { TierClassifier } from "./matching/TierClassifier.js";
import { MatchCriteria } from "./matching/MatchCriteria.js";
import { MatchExplanation } from "./matching/MatchExplanation.js";

export class MatchingService {
  constructor({
    postService,
    embeddingService = new EmbeddingService(modelsConfig),
    scorer = new Scorer(matchingConfig),
    classifier = new TierClassifier(matchingConfig),
    matchCriteria = new MatchCriteria(matchingConfig),
    matchExplanation = new MatchExplanation(),
    ticketService = new TicketService(),
  } = {}) {
    this.postService = postService;
    this.embeddingService = embeddingService;
    this.scorer = scorer;
    this.classifier = classifier;
    this.matchCriteria = matchCriteria;
    this.matchExplanation = matchExplanation;
    this.ticketService = ticketService;
    this.embeddingInitialized = false;
  }

  async initEmbeddings() {
    if (!this.embeddingInitialized) {
      await this.embeddingService.init();
      this.embeddingInitialized = true;
    }
  }

  async preparePost(post) {
    await this.initEmbeddings();

    if (!post.textEmbedding) {
      post.textEmbedding = await this.embeddingService.embedText(
        this.embeddingService.buildPostText(post),
      );
    }

    if (!post.imageEmbedding && post.imagePath) {
      post.imageEmbedding = await this.embeddingService.embedImage(
        post.imagePath,
      );
    }

    return post;
  }

  async findMatches(postId, intent) {
    const post = await this.postService.findById(postId);

    await this.preparePost(post);

    const oppositeIntent = intent === "LOST" ? "FOUND" : "LOST";
    const candidates = await this.postService.findByIntent(oppositeIntent);
    const matches = [];

    for (const candidate of candidates) {
      await this.preparePost(candidate);

      const lost = intent === "LOST" ? post : candidate;
      const found = intent === "LOST" ? candidate : post;

      if (!this.matchCriteria.isSatisfied(lost, found)) continue;

      const scores = this.scorer.scorePair(lost, found);
      const tier = this.classifier.classify(scores.total);
      if (tier === "DISCARD") continue;

      const distance = this.matchCriteria.distance(lost, found);

      const result = await this.ticketService.insert({
        lost,
        found,
        scores,
        tier,
        reasons: this.matchExplanation.build(scores, distance),
      });

      matches.push({
        ticketId: result.ticket._id,
        tier,
        notify: result.notify,
      });
    }

    return matches;
  }
}
