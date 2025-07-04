const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { exec } = require("child_process");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

app.post("/generate", (req, res) => {
  const prompt = req.body.prompt;

  exec(`python inference.py`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return res.status(500).json({ error: stderr });
    }

    console.log(`stdout: ${stdout}`);
    res.json({ result: stdout });
  });
});

app.listen(PORT, () => {
  console.log(`Node.js API running at http://localhost:${PORT}`);
});
