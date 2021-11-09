import express from "express";
import { searchMovies, getMovie, getTrailer } from "./scraper.js";
const app = express();

app.get("/", (req, res) => {
  console.log(req);
  res.send("Scraping is Fun!");
});

// /search/star wars
// /search/fight club
// /search/office space
app.get("/search/:title", (req, res) => {
  searchMovies(req.params.title).then((movies) => {
    res.json(movies);
  });
});
app.get("/movie/:imdbID", async (req, res) => {
  getMovie(req.params.imdbID).then((movie) => {
    res.json(movie);
  });
});
app.get("/trailer/:attr", async (req, res) => {
  await getTrailer(req.params.attr).then(async (url) => {
    res.send(url);
  });
});
const port = 3000;
app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
