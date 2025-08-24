// Importar tudo que precisa
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const validUrl = require("valid-url");
const shortid = require("shortid");
const serverless = require("serverless-http");
require("dotenv").config();

const app = express();

// Modelo Url (ajuste o caminho se seu modelo está em outro lugar)
const Url = require("../models/Url");

app.use(cors());
app.use(express.json());

// Conectar ao MongoDB (garantindo que a conexão seja feita uma vez)
const MONGO_URI = process.env.MONGO_URI;

if (!mongoose.connection.readyState) {
  mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

// Rota POST para encurtar URL
app.post("/api/url/shorten", async (req, res) => {
  const { longUrl } = req.body;

  if (!validUrl.isUri(longUrl)) {
    return res.status(401).json("URL inválida");
  }

  try {
    let url = await Url.findOne({ longUrl });
    if (url) {
      return res.json({
        longUrl: url.longUrl,
        shortId: url.shortId,
        shortUrl: `${process.env.BASE_URL}/${url.shortId}`,
      });
    }

    const shortId = shortid.generate();

    url = new Url({
      longUrl,
      shortId,
    });

    await url.save();

    return res.json({
      longUrl: url.longUrl,
      shortId: url.shortId,
      shortUrl: `${process.env.BASE_URL}/${shortId}`,
    });
  } catch (err) {
    return res.status(500).json("Erro no servidor");
  }
});

// Rota GET para redirecionar a URL curta para a URL longa
app.get("/:shortId", async (req, res) => {
  try {
    const url = await Url.findOne({ shortId: req.params.shortId });
    if (url) {
      return res.redirect(url.longUrl);
    } else {
      return res.status(404).json("URL não encontrada");
    }
  } catch (err) {
    return res.status(500).json("Erro no servidor");
  }
});

// Exporta o handler para o Vercel processar como lambda/serverless function
module.exports.handler = serverless(app);
