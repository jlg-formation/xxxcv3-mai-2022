import express from "express";
import axios from "axios";
import morgan from "morgan";
import { createClient } from "redis";
import session from "express-session";
import connectRedis from "connect-redis";

const client = createClient();
client.on("error", (err) => console.log("Redis Client Error", err));

const RedisStore = connectRedis(session);
const redisClient = createClient({
  url: "redis://localhost:6379",
  legacyMode: true,
});
redisClient.on("error", function (err) {
  console.log("Could not establish a connection with redis. " + err);
});

(async () => {
  await client.connect();
  await redisClient.connect();
  console.log("successfully connected to redis");

  const app = express();
  const port = 3000;

  async function getFromCache(url) {
    const value = await client.get("url:" + url);
    return JSON.parse(value);
  }

  async function setToCache(url, data) {
    await client.set("url:" + url, JSON.stringify(data), { EX: 10 });
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

  app.use(
    session({
      secret: "le secret connu que par le serveur web 123!",
      resave: false,
      saveUninitialized: true,
      name: "redis-example.sid",
      cookie: {
        secure: false, // if true only transmit cookie over https
        httpOnly: false, // if true prevent client side JS from reading the cookie
        maxAge: 1000 * 60 * 10, // session max age in miliseconds
      },
      store: new RedisStore({ client: redisClient }),
    })
  );

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
