const express = require('express');
const cors = require('cors');
require('dotenv').config()
const port=process.env.PORT || 5000;
const app=express()

//meddle ware
app.use(cors());
app.use(express.json()) 



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.nzb6w.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const collection = client.db("smartphoneWarehouse").collection("warehouse");
  console.log("DB Connected so cool")
  // perform actions on the collection object
  client.close();
});








app.get('/',(req,res)=>{
    res.send('running genuse server')
})
app.listen(port,()=>{
    console.log('lising the port',port)
})
