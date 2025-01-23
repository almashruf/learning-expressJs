const express = require("express");

const app = express();

app.set("view engine", "ejs");

app.get('/about', (req,res)=>{
  //res.send('About');
  //res.end();
  //res.sendStatus(403;);

  res.format({
    'text/plain':()=>{
      res.send('hi');
    }
  })

  default: ()=>{
    res.status(406).send('not acceptable');
  }
})

app.listen(3000, () => {
  console.log("listening on port 3000");
});
