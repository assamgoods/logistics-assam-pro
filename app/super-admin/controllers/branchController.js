import Branch from "../models/Branch.js";

// Get All Branches
export const getAllBranches = async (req, res) => {
  try {
    const branches = await Branch.find({ isDeleted: false }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: branches,
    });
  } catch (error) {
    console.error("Get Branches Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch branches.",
    });
  }
};

// Create Branch
export const createBranch = async (req, res) => {
  try {
    const {
      branchCode,
      branchName,
      contactPerson,
      mobile,
      email,
      password,
      gstNumber,
      panNumber,
      address,
      city,
      state,
      pincode,
    } = req.body;

    // Check duplicate branch code
    const codeExists = await Branch.findOne({ branchCode });

    if (codeExists) {
      return res.status(400).json({
        success: false,
        message: "Branch Code already exists.",
      });
    }

    // Check duplicate email
    const emailExists = await Branch.findOne({ email });

    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists.",
      });
    }

    const branch = await Branch.create({
      branchCode,
      branchName,
      contactPerson,
      mobile,
      email,
      password,
      gstNumber,
      panNumber,
      address,
      city,
      state,
      pincode,
    });

    return res.status(201).json({
      success: true,
      message: "Branch created successfully.",
      data: branch,
    });
  } catch (error) {
    console.error("Create Branch Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create branch.",
    });
  }
};