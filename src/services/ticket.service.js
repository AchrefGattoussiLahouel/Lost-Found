import Ticket from "../models/Ticket.js";
import { TICKET_STATUS, TICKET_TIER } from "../constants/tickets.js";
import errors from "../errors/index.js";

const { NotFoundError, ConflictError } = errors;

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

    //when a post is updated the score need to be recalculated only if ticket status
    // still proposed
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
      status: {
        $in: [TICKET_STATUS.PROPOSED, TICKET_STATUS.ACCEPTED],
      },
    })
      .sort({ "scores.total": -1 })
      .lean();
  }

  async accept(ticketId) {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) throw new NotFoundError("Ticket", ticketId);

    if (ticket.status !== TICKET_STATUS.PROPOSED) {
      throw new ConflictError(
        { status: ticket.status },
        `cannot accept a ${ticket.status} ticket`,
      );
    }

    ticket.status = TICKET_STATUS.ACCEPTED;
    await ticket.save();

    return ticket;
  }

  async refuse(ticketId) {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) throw new NotFoundError("Ticket", ticketId);

    if (
      ![TICKET_STATUS.PROPOSED, TICKET_STATUS.ACCEPTED].includes(ticket.status)
    ) {
      throw new ConflictError(
        { status: ticket.status },
        `cannot refuse a ${ticket.status} ticket`,
      );
    }

    ticket.status = TICKET_STATUS.REFUSED;
    await ticket.save();

    return ticket;
  }
}
