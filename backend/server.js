require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const urlRoutes = require("./routes/url");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Conectar ao MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.error(err));

// Rotas
app.use("/api/url", urlRoutes);

// Página inicial para teste
app.get("/", (req, res) => {
  res.send("API do Encurtador de URLs funcionando!");
});

// Redirecionar URL curta
const Url = require("./models/Url");
app.get("/:shortId", async (req, res) => {
  try {
    const url = await Url.findOne({ shortId: req.params.shortId });
    if (url) {
      return res.redirect(url.longUrl);
    } else {
      return res.status(404).json("URL não encontrada");
    }
  } catch (err) {
    return res.status(500).json("Erro interno");
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
