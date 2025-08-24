const express = require("express");
const router = express.Router();
const validUrl = require("valid-url");
const shortid = require("shortid");

const Url = require("../models/Url");

const baseUrl = process.env.BASE_URL || "http://localhost:5000";

router.post("/shorten", async (req, res) => {
  const { longUrl } = req.body;

  // Verificar URL válida
  if (!validUrl.isUri(longUrl)) {
    return res.status(401).json("URL inválida");
  }

  try {
    // Verificar se existe no banco
    let url = await Url.findOne({ longUrl });
    if (url) {
      res.json(url);
    } else {
      const shortId = shortid.generate();
      const shortUrl = `${baseUrl}/${shortId}`;

      url = new Url({
        longUrl,
        shortId,
      });

      await url.save();

      res.json(url);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Erro no servidor");
  }
});

module.exports = router;
