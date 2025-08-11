// server.js
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

  // Use the Python executable from the virtual environment for reliability
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

  // Increased timeout for potentially long video renders (5 minutes)
  exec(command, { timeout: 300000, cwd: __dirname }, (error, stdout, stderr) => {
    console.log("---- Python STDOUT ----\n", stdout);
    console.log("---- Python STDERR ----\n", stderr);

    // 1. Handle script execution error immediately.
    // This catches errors from the Python script itself (e.g., syntax errors, crashes).
    if (error) {
      console.error("exec error:", error);
      // Always use return to stop further execution.
      return res.status(500).json({ error: error.message, stderr: stderr });
    }

    // 2. Handle the video generation success case.
    if (isVideo) {
      // The python script moves the final .mp4 to the project root (__dirname).
      // We will search there first as the primary location.
      let latestVideoPath = null;
      try {
        const filesInRoot = fs.readdirSync(__dirname);
        const videoCandidates = filesInRoot
          .filter((f) => /^output_\d{8}_\d{6}\.mp4$/.test(f))
          .sort()
          .reverse();

        if (videoCandidates.length > 0) {
          latestVideoPath = path.join(__dirname, videoCandidates[0]);
        }
      } catch (e) {
        console.error("Error reading root directory:", e);
        // Fallthrough to the final error response
      }
      
      if (latestVideoPath && fs.existsSync(latestVideoPath)) {
        console.log("Video found in root. Sending file:", latestVideoPath);
        res.type("video/mp4");
        // Return here to ensure the request is closed.
        return res.sendFile(latestVideoPath, (err) => {
          if (err) {
            console.error("Error sending file:", err);
          } else {
            console.log("File sent successfully.");
            // Optional: You could clean up the video file after sending it.
            // fs.unlinkSync(latestVideoPath);
          }
        });
      }

      // If we reach here, the video was not found in the primary location.
      // This indicates a problem with the video generation or file moving process.
      console.error("FATAL: Video file not found after generation.");
      console.error("Check Python script stdout/stderr logs above to see if Manim failed or saved the file elsewhere.");
      return res.status(404).json({ error: "Video file was not found after generation process completed." });
    } 
    
    // 3. Handle the code generation success case.
    else {
      // The python script finished successfully, send its output.
      return res.json({ result: stdout });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Node.js API running at http://localhost:${PORT}`);
});
