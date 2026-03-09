const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const { cloneRepository, cleanupRepository } = require('./services/gitService');
const { analyzeRepository } = require('./services/analysisService');
const { generateRoast } = require('./services/roastService');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Ensure temp directory exists
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

app.post('/api/roast', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'Repository URL is required' });
  }

  const repoId = Date.now().toString(); // unique ID for concurrent requests
  const repoPath = path.join(tempDir, repoId);

  try {
    console.log(`Cloning ${url}...`);
    await cloneRepository(url, repoPath);

    console.log(`Analyzing ${url}...`);
    const metrics = await analyzeRepository(repoPath);

    console.log(`Generating roast...`);
    const roastContent = generateRoast(metrics);

    res.json({
      metrics,
      roast: roastContent,
    });
  } catch (error) {
    console.error('Error roasting repository:', error);
    res.status(500).json({ error: 'Failed to roast repository. Make sure the URL is a public git repo.' });
  } finally {
    await cleanupRepository(repoPath);
  }
});

app.listen(PORT, () => {
  console.log(`Repo Roaster backend running on port ${PORT}`);
});
