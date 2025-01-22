const express = require('express');

const app = express();
const admin = express();

admin.on('mount',(parent)=>{
    console.log('admin mounted');
    console.log('parent');
});

admin.get('/dashboard/hello', (req,res)=>{
    console.log(admin.mountpath);
    res.send('welcome to admin dashboard');
})

app.get('/',(req,res)=>{
    res.send('welcome to application home');
})

app.use('/admin',admin);

app.listen(3000, () => {
  console.log("listening on port 3000");
});
