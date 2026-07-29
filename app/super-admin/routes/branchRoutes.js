import express from "express";
import {
  getAllBranches,
  createBranch,
} from "../controllers/branchController.js";

const router = express.Router();

// Get All Branches
router.get("/", getAllBranches);

// Create Branch
router.post("/", createBranch);

export default router;