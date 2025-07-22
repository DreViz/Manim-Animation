const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

app.post("/generate", (req, res) => {
  const prompt = req.body.prompt;
  const isVideo = req.query.type === "video";

  const command = isVideo
    ? `python generate_video.py ${JSON.stringify(prompt || "")}`
    : `python inference.py ${JSON.stringify(prompt || "")}`;

  exec(command, { timeout: 60000, cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: error.message, stderr });
    }

    if (isVideo) {
      // Find the latest output_*.mp4 file
      const files = fs.readdirSync(__dirname)
        .filter(f => /^output_\d{8}_\d{6}\.mp4$/.test(f))
        .sort()
        .reverse();
      const latestVideo = files.length > 0 ? path.join(__dirname, files[0]) : null;

      if (latestVideo && fs.existsSync(latestVideo)) {
        res.sendFile(latestVideo);
      } else {
        res.status(404).send("Video file not found.");
      }
    } else {
      res.json({ result: stdout });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Node.js API running at http://localhost:${PORT}`);
});

