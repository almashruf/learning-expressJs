const express = require("express");

const app = express();

app.set("view engine", "ejs");

app.get("/about", (req, res) => {
  console.log(res.headersSent);
  res.render("pages/about", {
    name: "Bangladesh",
  });
  console.log(res.headersSent);
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});
