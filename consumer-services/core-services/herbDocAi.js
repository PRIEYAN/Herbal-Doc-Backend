const express = require("express");
const { spawn } = require("child_process");
const path = require("path");

const router = express.Router();

// Paths
const venvPath = path.join(__dirname, "../../../HebDocAi/venv");
const runInterfaceScript = path.join(__dirname, "../../../HebDocAi/run_interface.py");
const python = path.join(venvPath, "bin", "python");

// POST /api/ask-herbdoc
router.post("/ask-herbdoc", (req, res) => {
  const { instruction } = req.body;
  if (!instruction) {
    return res.status(400).json({ error: "Missing instruction in request body" });
  }

  const child = spawn(python, [runInterfaceScript, instruction]);

  let output = "";
  let error = "";

  child.stdout.on("data", (data) => (output += data.toString()));
  child.stderr.on("data", (data) => (error += data.toString()));

  child.on("close", (code) => {
    if (code !== 0) {
      console.error("❌ Python error:", error);
      return res.status(500).json({ error: "Model execution failed", details: error });
    }

    try {
      const parsed = JSON.parse(output.trim());
      res.json(parsed);
    } catch {
      res.json({ result: output.trim() });
    }
  });
});

module.exports = router;
