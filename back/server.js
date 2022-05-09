const express = require("express");
const axios = require("axios").default;
const morgan = require("morgan");
const { createClient } = require("redis");

const client = createClient();

client.on("error", (err) => console.log("Redis Client Error", err));

(async () => {
  await client.connect();
  console.log("successfully connected to redis");

  await client.set("key", "value");
  const value = await client.get("key");

  const app = express();
  const port = 3000;

  async function getFromCache(url) {
    // va dans redis et ramene le resultat si existant.
    return null;
  }

  async function setToCache(url, data) {
    // va dans redis et cree une cle url qui pointe sur data
  }

  async function cacheGet(url) {
    const data = await getFromCache(url);
    if (data) {
      return data;
    }
    const response = await axios.get(url);
    setToCache(url, response.data);
    return response.data;
  }

  app.use(morgan("tiny"));

  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  app.get("/github-users", (req, res) => {
    (async () => {
      try {
        const data = await cacheGet("https://api.github.com/users");
        res.json(data);
      } catch (err) {
        console.log("err: ", err);
        res.status(500).end();
      }
    })();
  });

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
})();
