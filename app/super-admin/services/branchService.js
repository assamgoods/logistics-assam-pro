import Branch from "../models/Branch.js";

export const getBranches = async () => {
  return await Branch.find({ isDeleted: false }).sort({ createdAt: -1 });
};

export const getBranchById = async (id) => {
  return await Branch.findById(id);
};

export const createNewBranch = async (branchData) => {
  return await Branch.create(branchData);
};

export const updateBranch = async (id, data) => {
  return await Branch.findByIdAndUpdate(id, data, {
    new: true,
  });
};

export const deleteBranch = async (id) => {
  return await Branch.findByIdAndUpdate(
    id,
    {
      isDeleted: true,
    },
    {
      new: true,
    }
  );
};