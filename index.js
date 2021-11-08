import express from "express";
import { searchMovie } from "./scraper.js";
const app = express();

app.get("/", (req, res) => {
  console.log(req);
  res.send("Scraping is Fun!");
});

// /search/star wars
// /search/fight club
// /search/office space
app.get("/search/:title", (req, res) => {
  searchMovie(req.params.title).then((movies) => {
    res.send(movies);
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
