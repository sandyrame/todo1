const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const gTTS = require('gtts');
const ytdl = require('ytdl-core');

const router = express.Router();

const upload = multer({ dest: 'uploads/' });

// Text to Voice
router.post('/text-to-voice', (req, res) => {
  const { text, lang } = req.body;
  const gtts = new gTTS(text, lang);
  const filename = `voice_${Date.now()}.mp3`;
  const filepath = path.join('outputs', filename);

  gtts.save(filepath, function (err) {
    if (err) return res.status(500).send('Conversion error');
    res.json({ url: `/outputs/${filename}` });
  });
});

// YouTube Downloader
router.post('/youtube', async (req, res) => {
  const { url, format } = req.body;
  const filename = `yt_${Date.now()}.${format}`;
  const filepath = path.join(__dirname, '..', 'outputs', filename);

  try {
    const stream = ytdl(url, { quality: format === 'mp3' ? 'highestaudio' : 'highestvideo' });
    const output = fs.createWriteStream(filepath);
    stream.pipe(output);

    output.on('finish', () => {
      res.json({ url: `/outputs/${filename}` });
    });
  } catch (err) {
    res.status(500).send('Download error');
  }
});

module.exports = router;
