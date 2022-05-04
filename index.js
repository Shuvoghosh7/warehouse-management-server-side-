const express = require('express');
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;
const app = express()

//meddle ware
app.use(cors());
app.use(express.json())



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.nzb6w.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
  try {
    await client.connect();
    const productCollection = client.db('smartphoneWarehouse').collection('warehouse');

    //load data form database
    app.get('/product', async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);

      //load single product
      app.get('/product/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const product = await productCollection.findOne(query);
        res.send(product)
      });
      // update quantity of products
      app.put("/product/:id", async (req, res) => {
        const id = req.params.id;
        const data = req.body;
        console.log("from update api", data);
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };

        const updateDoc = {
          $set: {
            quantity: data.quantity,

          },
        };

        const result = await productCollection.updateOne(
          filter,
          updateDoc,
          options
        );

        res.send(result);
      });
      // Delete item
      app.delete('/product/:id', async (req, res) => {
        const id = req.params.id
        const query = { _id: ObjectId(id) };
        const result = await productCollection.deleteOne(query)
        res.send(result)
      })
    })

  }
  finally {

  }

}
run().catch(console.dir)







app.get('/', (req, res) => {
  res.send('running genuse server')
})
app.listen(port, () => {
  console.log('lising the port', port)
})
