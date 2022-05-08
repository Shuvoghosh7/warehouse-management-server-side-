const express = require('express');
const crypto = require("crypto");
const cors = require('cors');
const base64url = require('base64url');
const jwt = require('jsonwebtoken');
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
    const myitemCollection = client.db('smartphoneWarehouse').collection('myItem');

    console.log('db connected')
    //load data form database
    app.get('/product', async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products)
    })
    //my item
    app.get('/products', async (req, res) => {
      const email = req.query
      const query = { email: email };
      const cursor = productCollection.filter(query);
      const products = await cursor.toArray();
      res.send(products)
    })

    //load single product
    app.get('/product/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product)
    });
    // jwt 
    app.post('/login', async (req, res) => {
      const email = req.body
      const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET)
      res.send({ token })
    })
    // update quantity of products
    app.put("/product/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      console.log("from update api", data);
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };

      const updateDoc = {
        $set: {
          quantity: data.addQuantity
        },
      };

      const result = await productCollection.updateOne(
        filter,
        updateDoc,
        options
      );

      res.send(result);
    });
    // Reduce quantity of products
    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      console.log("from update api", data);
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };

      const updateDoc = {
        $set: {
          quantity: data.quantityReduce
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

    // add item api
    app.post('/product', async (req, res) => {
      const newService = req.body
      const tokenAccess = req.headers.authorization;
      console.log(tokenAccess)
      const [email, tokeninfo] = tokenAccess.split(" ")
      const decoded = checkToken(tokeninfo)
      console.log(decoded)
      if (email === decoded.email) {
        const result = await productCollection.insertOne(newService)
        res.send({ success: 'products upload successfull' })
      }
      else {
        res.send({ success: 'UnAuthorization Access' })
      }
    })
    // update Item 
    app.put("/updateItem/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      console.log("from update api", data);
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };

      const updateDoc = {
        $set: {
          price: data.price,
          quantity: data.quantity,
          sellStatus: data.sellStatus,
          supplierName: data.supplierName
        },
      };

      const result = await productCollection.updateOne(
        filter,
        updateDoc,
        options
      );

      res.send(result);
    });

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

function checkToken(token) {
  let email;
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      email = 'This email is Invalid email'
      console.log(email)
    }
    if (decoded) {
      console.log(decoded)
      email = decoded
    }
  });
  return email;
}