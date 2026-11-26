import Ticket from "../models/Ticket.js";
import Post from "../models/post.js";
import { isStaff } from "../rules/post.rules.js";
import { TICKET_STATUS, TICKET_TIER } from "../constants/tickets.js";
import errors from "../errors/index.js";

const { NotFoundError, ConflictError, AuthorizationError } = errors;

export class TicketService {
  async insert({ lost, found, scores, tier, reasons = [] }) {
    const key = { lostId: lost._id, foundId: found._id };
    let ticket = await Ticket.findOne(key);

    if (!ticket) {
      ticket = await Ticket.create({
        ...key,
        scores,
        tier,
        reasons,
        status: TICKET_STATUS.PROPOSED,
      });

      return { ticket, notify: tier === TICKET_TIER.ALERT };
    }

    if (ticket.status === TICKET_STATUS.PROPOSED) {
      ticket.scores = scores;
      ticket.tier = tier;
      ticket.reasons = reasons;
      await ticket.save();
    }

    return { ticket, notify: false };
  }

  listForPost(postId) {
    return Ticket.find({
      $or: [{ lostId: postId }, { foundId: postId }],
    })
      .populate("lostId", "intent title status user createdBy")
      .populate("foundId", "intent title status user createdBy")
      .sort({ createdAt: -1 })
      .lean();
  }

  async listAll(actor, { page = 1, limit = 10, status, tier } = {}) {
    if (!isStaff(actor)) throw new AuthorizationError();

    const filter = {};
    if (status) filter.status = status;
    if (tier) filter.tier = tier;

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Ticket.find(filter)
        .populate("lostId", "intent title status user createdBy")
        .populate("foundId", "intent title status user createdBy")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Ticket.countDocuments(filter),
    ]);

    return {
      items,
      meta: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async listForUser(actor) {
    const posts = await Post.find({
      $or: [{ user: actor._id }, { createdBy: actor._id }],
    }).select("_id");

    if (!posts.length) return [];

    const postIds = posts.map((post) => post._id);

    return Ticket.find({
      $or: [{ lostId: { $in: postIds } }, { foundId: { $in: postIds } }],
      status: {
        $in: [TICKET_STATUS.PROPOSED, TICKET_STATUS.ACCEPTED],
      },
    })
      .populate(
        "lostId",
        "intent title description lat lng status user createdBy",
      )
      .populate(
        "foundId",
        "intent title description lat lng status user createdBy",
      )
      .sort({ "scores.total": -1 })
      .lean();
  }

  async getById(ticketId, actor) {
    const ticket = await Ticket.findById(ticketId)
      .populate(
        "lostId",
        "intent title description lat lng status user createdBy",
      )
      .populate(
        "foundId",
        "intent title description lat lng status user createdBy",
      );

    if (!ticket) throw new NotFoundError("Ticket", ticketId);

    this.authorizeRead(ticket, actor);
    return ticket;
  }

  async accept(ticketId, actor) {
    const ticket = await this.loadTicketForOwner(ticketId, actor);

    this.assertTransition(ticket, [TICKET_STATUS.PROPOSED]);

    ticket.status = TICKET_STATUS.ACCEPTED;
    await ticket.save();
    return ticket;
  }

  async refuse(ticketId, actor) {
    const ticket = await this.loadTicketForOwner(ticketId, actor);

    this.assertTransition(ticket, [
      TICKET_STATUS.PROPOSED,
      TICKET_STATUS.ACCEPTED,
    ]);

    ticket.status = TICKET_STATUS.REFUSED;
    await ticket.save();
    return ticket;
  }

  assertTransition(ticket, allowedStatuses) {
    if (!allowedStatuses.includes(ticket.status)) {
      throw new ConflictError(
        { status: ticket.status },
        `Cannot change a ${ticket.status.toLowerCase()} match.`,
      );
    }
  }

  authorizeRead(ticket, actor) {
    const canRead =
      isStaff(actor) ||
      this.isPostOwner(ticket.lostId, actor) ||
      this.isPostOwner(ticket.foundId, actor);

    if (!canRead) throw new AuthorizationError();
  }

  isPostOwner(post, actor) {
    return (
      post?.user?.toString() === actor._id.toString() ||
      post?.createdBy?.toString() === actor._id.toString()
    );
  }

  async loadTicketForOwner(ticketId, actor) {
    const ticket = await Ticket.findById(ticketId)
      .populate("lostId", "user createdBy")
      .populate("foundId", "user createdBy");

    if (!ticket) throw new NotFoundError("Ticket", ticketId);

    if (
      !this.isPostOwner(ticket.lostId, actor) &&
      !this.isPostOwner(ticket.foundId, actor)
    ) {
      throw new AuthorizationError();
    }

    return ticket;
  }
}
