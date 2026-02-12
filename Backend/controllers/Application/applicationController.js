import Application from "../../models/Application.js";

// Submit application
export const submitApplication = async (req, res) => {
  const application = await Application.create({
    applicant: req.user.id,
    applicationType: req.body.applicationType,
    referenceId: req.body.referenceId,
    documents: req.files
  });

  res.status(201).json({
    message: "Application submitted successfully",
    application
  });
};

// Officer approval / rejection / resubmission
export const updateApplicationStatus = async (req, res) => {
  const { status, officerComment } = req.body;

  const application = await Application.findById(req.params.id);
  if (!application) return res.status(404).json({ message: "Not found" });

  application.status = status;
  application.officerComment = officerComment;
  application.handledBy = req.user.id;
  application.actionDate = new Date();

  await application.save();

  res.json({
    message: `Application ${status}`,
    application
  });
};

// Applicant status tracking
export const getMyApplications = async (req, res) => {
  const apps = await Application.find({ applicant: req.user.id })
    .sort({ createdAt: -1 });

  res.json(apps);
};

// Officer view
export const getAllApplications = async (req, res) => {
  const apps = await Application.find()
    .populate("applicant", "name email")
    .sort({ createdAt: -1 });

  res.json(apps);
};
