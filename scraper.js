import fetch from "node-fetch";
import cheerio from "cheerio";
const searchUrl = "https://www.imdb.com/find?s=tt&ttype=ft&ref_=fn_ft&q=";

const searchCache = {};
export function searchMovie(searchTerm) {
  return fetch(`${searchUrl}${searchTerm}`)
    .then((response) => response.text())
    .then((body) => {
      const movies = [];
      const $ = cheerio.load(body);
      $(".findResult").each(function (i, element) {
        const $element = $(element);
        const $image = $element.find("td a img");
        const $title = $element.find("td.result_text a");

        const imdbID = $title.attr("href").match(/title\/(.*)\//)[1];

        const movie = {
          image: $image.attr("src"),
          title: $title.text(),
          imdbID,
        };
        movies.push(movie);
      });

      searchCache[searchTerm] = movies;

      return movies;
    });
}
