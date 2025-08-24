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

// Permitir o domínio do seu frontend
const allowedOrigins = [
  "https://url-shortner-frontend-kappa-sooty.vercel.app",
  // adicione outros domínios que possam acessar a API
];

const corsOptions = {
  origin: function (origin, callback) {
    // Permite requisições sem origem (como curl/postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `Origin ${origin} não autorizado pelo CORS`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Responde às requisições OPTIONS (preflight)
app.options("*", cors(corsOptions));

// Exporta o handler para o Vercel processar como lambda/serverless function
module.exports.handler = serverless(app);
