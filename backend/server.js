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
  const prompt = req.body.prompt || "";
  const isVideo = req.query.type === "video";

  // Use venv python explicitly for reliability
  const py = path.join(__dirname, "venv", "Scripts", "python.exe");
  const command = isVideo
    ? `"${py}" generate_video.py ${JSON.stringify(prompt)}`
    : `"${py}" inference.py ${JSON.stringify(prompt)}`;

  console.log("========================================");
  console.log("[/generate] Received request");
  console.log("Prompt:", prompt);
  console.log("Mode:", isVideo ? "video" : "code");
  console.log("CWD (server):", __dirname);
  console.log("Command:", command);

  exec(command, { timeout: 180000, cwd: __dirname }, (error, stdout, stderr) => {
    console.log("---- Python STDOUT ----\n", stdout);
    console.log("---- Python STDERR ----\n", stderr);

    if (error) {
      console.error("exec error:", error);
      return res.status(500).json({ error: error.message, stderr });
    }

    if (isVideo) {
      let dirFiles = [];
      try {
        dirFiles = fs.readdirSync(__dirname);
      } catch (e) {
        console.error("Failed to read __dirname:", e);
      }
      console.log("Files in __dirname after Python run:", dirFiles);

      const candidates = dirFiles
        .filter((f) => /^output_\d{8}_\d{6}\.mp4$/.test(f))
        .sort()
        .reverse();

      console.log("MP4 candidates found:", candidates);

      let latestVideo = candidates.length > 0 ? path.join(__dirname, candidates[0]) : null;
      console.log("Latest video resolved path:", latestVideo);

      if (latestVideo && fs.existsSync(latestVideo)) {
        console.log("Sending file:", latestVideo);
        res.type("video/mp4"); // ✅ Ensure correct Content-Type
        return res.sendFile(latestVideo, (sendErr) => {
          if (sendErr) console.error("sendFile error:", sendErr);
          else console.log("sendFile completed successfully.");
        });
      }

      // Fallback: search in media directory recursively
      const mediaDir = path.join(__dirname, "media");
      try {
        console.log("Searching fallback media directory:", mediaDir);
        const walk = (dir) => {
          const out = [];
          if (!fs.existsSync(dir)) return out;
          for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const p = path.join(dir, entry.name);
            if (entry.isDirectory()) out.push(...walk(p));
            else out.push(p);
          }
          return out;
        };
        const all = walk(mediaDir);
        const mp4s = all
          .filter((p) => /(?:\\|\/)output_\d{8}_\d{6}\.mp4$/.test(p))
          .sort()
          .reverse();
        console.log("Fallback MP4 candidates:", mp4s);
        if (mp4s.length) {
          console.log("Sending fallback file:", mp4s[0]);
          res.type("video/mp4"); // ✅ Ensure correct Content-Type
          return res.sendFile(mp4s[0]);
        }
      } catch (e) {
        console.error("Fallback media search failed:", e);
      }

      console.error("Video file not found. Check Python STDOUT for final path.");
      return res.status(404).send("Video file not found.");
    } else {
      return res.json({ result: stdout });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Node.js API running at http://localhost:${PORT}`);
});
