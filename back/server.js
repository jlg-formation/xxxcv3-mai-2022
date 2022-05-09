const express = require("express");
const axios = require("axios").default;

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/github-users", (req, res) => {
  axios
    .get("https://api.github.com/users")
    .then(function (response) {
      // handle success
      console.log("ok", response.data);

      res.json(response.data);
    })
    .catch(function (error) {
      // handle error
      console.log(error);
      res.status(500).end();
    });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
