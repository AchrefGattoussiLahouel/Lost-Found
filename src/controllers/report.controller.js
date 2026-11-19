import reportService from "../services/report.service.js";

// ---- user side
const create = async (req, res) => {
  const report = await reportService.create(req.user, req.validated.body);

  return res.status(201).json({
    message: "Report submitted. Thank you.",
    data: { report },
  });
};

const listMine = async (req, res) => {
  const { items, meta } = await reportService.listMine(
    req.user._id,
    req.validated.query,
  );

  return res.status(200).json({ data: items, meta });
};

// ---- admin / 
const adminList = async (req, res) => {
  const { items, meta } = await reportService.list(req.validated.query);

  return res.status(200).json({ data: items, meta });
};

const adminGet = async (req, res) => {
  const report = await reportService.getById(req.validated.params.id);

  return res.status(200).json({ data: { report } });
};

const adminProcess = async (req, res) => {
  const report = await reportService.process(
    req.validated.params.id,
    req.user,
    req.validated.body,
  );

  return res.status(200).json({
    message: "Report processed.",
    data: { report },
  });
};

export default { create, listMine, adminList, adminGet, adminProcess };
