const express = require("express");

const app = express();

app.use(
  express.static(`${__dirname}/public/`, {
    index: "home.html",
  })
);

app.get("/", (req, res) => {
  res.send("this is home page");
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});
