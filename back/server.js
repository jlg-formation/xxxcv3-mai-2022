const express = require("express");
const axios = require("axios").default;

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/github-users", (req, res) => {
  (async () => {
    try {
      const response = await axios.get("https://api.github.com/users");
      console.log("ok", response.data);
      res.json(response.data);
    } catch (err) {
      console.log("err: ", err);
      res.status(500).end();
    }
  })();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
