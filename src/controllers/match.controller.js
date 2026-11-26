import postService from "../services/post.service.js";
import { TicketService } from "../services/ticket.service.js";

const tickets = new TicketService();

const mine = async (req, res) => {
  const data = await tickets.listForUser(req.user);
  return res.status(200).json({ data });
};

const history = async (req, res) => {
  const data = await tickets.listAll(req.user, req.validated.query);
  return res.status(200).json({ data });
};

const forPost = async (req, res) => {
  const { postId } = req.validated.params;
  await postService.getById(postId, req.user);

  const data = await tickets.listForPost(postId);
  return res.status(200).json({ data });
};

const getById = async (req, res) => {
  const { ticketId } = req.validated.params;
  const data = await tickets.getById(ticketId, req.user);
  return res.status(200).json({ data });
};

const accept = async (req, res) => {
  const { ticketId } = req.validated.params;
  const data = await tickets.accept(ticketId, req.user);
  return res.status(200).json({ message: "Match accepted.", data });
};

const refuse = async (req, res) => {
  const { ticketId } = req.validated.params;
  const data = await tickets.refuse(ticketId, req.user);
  return res.status(200).json({ message: "Match refused.", data });
};

export default { mine, history, forPost, getById, accept, refuse };
