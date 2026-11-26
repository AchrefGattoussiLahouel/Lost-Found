import { matchingConfig } from "../config/matching.js";
import { modelsConfig } from "../config/models.js";
import { EmbeddingService } from "./embedding.service.js";
import { TicketService } from "./ticket.service.js";
import { Scorer } from "./matching/Scorer.js";
import { TierClassifier } from "./matching/TierClassifier.js";
import { MatchCriteria } from "./matching/MatchCriteria.js";
import { MatchExplanation } from "./matching/MatchExplanation.js";
import notificationService from "./notification.service.js";

export class MatchingService {
  constructor({
    posts,
    embedder = new EmbeddingService(modelsConfig),
    scorer = new Scorer(matchingConfig),
    classifier = new TierClassifier(matchingConfig),
    criteria = new MatchCriteria(matchingConfig),
    explanation = new MatchExplanation(),
    tickets = new TicketService(),
  } = {}) {
    if (!posts) throw new Error("posts service is required");

    this.posts = posts;
    this.embedder = embedder;
    this.scorer = scorer;
    this.classifier = classifier;
    this.criteria = criteria;
    this.explanation = explanation;
    this.tickets = tickets;
    this.embeddingsReady = false;
  }

  async initEmbeddings() {
    if (this.embeddingsReady) return;

    await this.embedder.init();
    this.embeddingsReady = true;
  }

  async prepare(post) {
    await this.initEmbeddings();

    post.location = {
      coordinates: [post.lng ?? 0, post.lat ?? 0],
    };

    if (!post.textEmbedding) {
      post.textEmbedding = await this.embedder.embedText(
        this.embedder.buildPostText(post),
      );
    }

    const image = post.imagePath ?? post.photos?.[0];
    if (!post.imageEmbedding && image) {
      post.imageEmbedding = await this.embedder.embedImage(image);
    }

    return post;
  }

  async findMatches(lostId) {
    const lost = await this.posts.findById(lostId);
    await this.prepare(lost);

    const candidates = await this.posts.findByIntent("found");
    const matches = [];

    for (const found of candidates) {
      const match = await this.evaluate(lost, found);
      if (match) matches.push(match);
    }

    return matches;
  }

  async evaluate(lost, found) {
    await this.prepare(found);

    if (!this.criteria.isSatisfied(lost, found)) return null;

    const scores = this.scorer.scorePair(lost, found);
    const tier = this.classifier.classify(scores.total);
    if (tier === "DISCARD") return null;

    const distance = this.criteria.distance(lost, found);
    const result = await this.tickets.insert({
      lost,
      found,
      scores,
      tier,
      reasons: this.explanation.build(scores, distance),
    });

    if (result.notify) {
      await notificationService.notifyMatchingFound({
        recipient: lost.user,
        matchingId: result.ticket._id,
        postId: found._id,
        score: scores.total,
      });
    }

    return {
      ticketId: result.ticket._id,
      tier,
      notify: result.notify,
    };
  }
}
