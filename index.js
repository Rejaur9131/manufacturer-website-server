const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const app = express();

// Middleware
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pjo3h.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect();
    const toolCollection = client.db('manufacturer').collection('tools');
    const orderCollection = client.db('manufacturer').collection('orders');
    const userCollection = client.db('manufacturer').collection('users');

    app.post('/orders', async (req, res) => {
      const order = req.body;
      const query = { order };
      const result = await orderCollection.insertOne(order);
      return res.send({ success: true, result });
    });

    app.get('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const order = await orderCollection.findOne(query);
      res.send(order);
    });

    app.get('/orders/:email', async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const cursor = orderCollection.find(filter);
      const orders = await cursor.toArray();
      res.send(orders);
    });
    app.get('/user', async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    });

    app.put('/user/admin/:email', async (req, res) => {
      const email = req.params.email;

      const filter = { email: email };
      const updateDoc = {
        $set: { role: 'admin' }
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send({ result });
    });

    app.put('/user/:email', async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const option = { upsert: true };
      const updateDoc = {
        $set: user
      };
      const result = await userCollection.updateOne(filter, updateDoc, option);
      const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      res.send({ result, token });
    });

    app.get('/tools', async (req, res) => {
      const query = {};
      const cursor = toolCollection.find(query);
      const tools = await cursor.toArray();
      res.send(tools);
    });

    app.get('/tools/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const toolItem = await toolCollection.findOne(query);
      res.send(toolItem);
    });
  } finally {
  }
}

run().catch(console.dir());

app.get('/', (req, res) => {
  res.send('Welcome to my Manufacturing Site');
});

app.listen(port, () => {
  console.log(`Manufacturing Site listening on port ${port}`);
});
