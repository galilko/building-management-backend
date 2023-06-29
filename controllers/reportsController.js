const Report = require("../models/Report");
const User = require("../models/User");

// @desc Get all reports
// @route GET /reports
// @access Private
const getAllReports = async (req, res) => {
  // Get all reports from MongoDB
  const reports = await Report.find().lean();

  // If no reports
  if (!reports?.length) {
    return res.status(400).json({ message: "No reports found" });
  }

  // Add username to each report before sending the response
  // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE
  // You could also do this with a for...of loop
  const reportsWithUser = await Promise.all(
    reports.map(async (report) => {
      const user = await User.findById(report.user).lean().exec();
      return { ...report, username: user.name };
    })
  );

  res.json(reportsWithUser);
};

// @desc Create new report
// @route POST /reports
// @access Private
const createNewReport = async (req, res) => {
  const { user, title, text } = req.body;

  // Confirm data
  if (!user || !title || !text) {
    return res.status(400).json({ message: "All fields are required" });
  }

  //check if user exists
  const userExists = await User.findById(user).lean().exec();
  if (!userExists) {
    return res.status(400).json({ message: "User not found" });
  }

  /*
    // Check for duplicate title
    const duplicate = await Report.findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate report title' })
    }
    */

  // Create and store the new user
  const report = await Report.create({ user, title, text });

  if (report) {
    // Created
    return res.status(201).json({ message: "New report created" });
  } else {
    return res.status(400).json({ message: "Invalid report data received" });
  }
};

// @desc Update a report
// @route PATCH /reports
// @access Private
const updateReport = async (req, res) => {
  const { id, user, title, text, completed } = req.body;

  // Confirm data
  if (!id || !user || !title || !text || typeof completed !== "boolean") {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Confirm report exists to update
  const report = await Report.findById(id).exec();

  if (!report) {
    return res.status(400).json({ message: "Report not found" });
  }

  /*
    // Check for duplicate title
    const duplicate = await Report.findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec()

    // Allow renaming of the original report 
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate report title' })
    }*/

  report.user = user;
  report.title = title;
  report.text = text;
  report.completed = completed;

  const updatedReport = await report.save();

  res.json(`'${updatedReport.title}' updated`);
};

// @desc Delete a report
// @route DELETE /reports
// @access Private
const deleteReport = async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "Report ID required" });
  }

  // Confirm report exists to delete
  const report = await Report.findById(id).exec();

  if (!report) {
    return res.status(400).json({ message: "Report not found" });
  }

  const result = await report.deleteOne();

  const reply = `Report '${result.title}' with ID ${result._id} deleted`;

  res.json(reply);
};

module.exports = {
  getAllReports,
  createNewReport,
  updateReport,
  deleteReport,
};
