import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
} from "@mui/material";
import axios from "axios";

const UrlShortener = () => {
  const [longUrl, setLongUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setShortUrl("");

    // Validar campo
    if (!longUrl) {
      setError("Por favor insira uma URL");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/url/shorten", {
        longUrl,
      });
      setShortUrl(`http://localhost:5000/${res.data.shortId}`);
    } catch (err) {
      setError(err.response?.data || "Erro ao encurtar URL");
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 5, p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Encurtador de URLs
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Digite a URL longa"
            variant="outlined"
            fullWidth
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            margin="normal"
          />

          <Button variant="contained" type="submit" fullWidth>
            Encurtar
          </Button>
        </form>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {shortUrl && (
          <Alert severity="success" sx={{ mt: 2 }}>
            URL curta criada:{" "}
            <a href={shortUrl} target="_blank" rel="noreferrer">
              {shortUrl}
            </a>
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default UrlShortener;
