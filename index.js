const express = require("express");

const app = express();

const router = express.Router({
  caseSensitive: true,
});

app.use(router);

app.get("/about ", (req, res) => {
  res.send("this is home page");
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});
