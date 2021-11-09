import fetch from "node-fetch";
import cheerio from "cheerio";
import puppeteer from "puppeteer";

const searchUrl = "https://www.imdb.com/find?s=tt&ttype=ft&ref_=fn_ft&q=";
const movieUrl = "https://www.imdb.com/title/";
const trailerUrl = "https://www.imdb.com/video/";

const searchCache = {};
const movieCache = {};
export function searchMovies(searchTerm) {
  if (searchCache[searchTerm]) {
    console.log("Serving from cache:", searchTerm);
    return Promise.resolve(searchCache[searchTerm]);
  }

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
export async function getTrailer(trailerAttr) {
  var div;
  const browser = await puppeteer.launch({ headless: false }); // for test disable the headlels mode,
  const page = await browser.newPage();
  await page.setViewport({ width: 1000, height: 926 });
  await page.goto(`${trailerUrl}${trailerAttr}`, { waitUntil: "networkidle2" });
  console.log("start evaluate javascript");
  /** @type {string[]} */
  try {
    await page.waitForSelector("video", 500000);
    div = await page.$eval("video", (elem) => elem.src);
    //console.log(div);
  } catch (error) {
    console.log("hgahsbiff261");
    console.log(error);
  }

  await browser.close();
  //console.log(div);
  return div;
}

export async function getMovie(imdbID) {
  if (movieCache[imdbID]) {
    console.log("Serving from cache:", imdbID);
    return Promise.resolve(movieCache[imdbID]);
  }

  return fetch(`${movieUrl}${imdbID}`)
    .then((response) => response.text())
    .then(async (body) => {
      const $ = cheerio.load(body);
      const title = $(".TitleHeader__TitleText-sc-1wu6n3d-0").text();
      //const rating = $('meta[itemProp="contentRating"]').attr("content");
      const year = $(".TitleBlockMetaData__MetaDataList-sc-12ein40-0")
        .text()
        .substring(0, 4);
      const runTime = $(
        ".TitleBlockMetaData__MetaDataList-sc-12ein40-0 :nth-child(3)"
      ).text();
      const genres = [];
      $(".GenresAndPlot__GenreChip-cum89p-3").each(function (i, element) {
        const genre = $(element).text();
        genres.push(genre);
      });

      const poster = $(".ipc-image").attr("src");
      const summary = $(".GenresAndPlot__TextContainerBreakpointL-cum89p-1")
        .text()
        .trim();
      const storyLine = $(
        ".Storyline__StorylineWrapper-sc-1b58ttw-0 div.ipc-html-content div"
      )
        .text()
        .trim();

      const trailerAttr = $(
        "#__next > main > div > section.ipc-page-background.ipc-page-background--base.TitlePage__StyledPageBackground-wzlr49-0.dDUGgO > section > div:nth-child(4) > section > section > div.Hero__MediaContentContainer__Video-kvkd64-2.kmTkgc > div.Hero__MediaContainer__Video-kvkd64-3.FKYGY > div > div.Media__SlateContainer-sc-1x98dcb-4.dDhYrh > div.ipc-slate.ipc-slate--baseAlt.ipc-slate--dynamic-width.Slatestyles__SlateContainer-sc-1t1hgxj-0.hZESQm.undefined.celwidget.ipc-sub-grid-item.ipc-sub-grid-item--span-4 > a"
      )
        .attr("href")
        .match(/video\/(.*)\?/)[1];

      var trailer = "hbjdv544";
      try {
        trailer = await getTrailer(trailerAttr);
        console.log(trailer);
      } catch (error) {
        console.log(error);
      }
      const movie = {
        imdbID,
        title,
        runTime,
        year,
        genres,
        poster,
        summary,
        storyLine,
        trailer,
      };

      movieCache[imdbID] = movie;

      return movie;
    });
}
