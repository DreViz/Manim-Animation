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

  const command = isVideo ? "python generate_video.py" : "python inference.py";

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }

    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return res.status(500).json({ error: stderr });
    }

    if (isVideo) {
      const videoPath = path.join(__dirname, "output.mp4");
      if (fs.existsSync(videoPath)) {
        res.sendFile(videoPath);
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
