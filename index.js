const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.94yoj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
        await client.connect();
        const database = client.db("droneShop");
        const productsCollection = database.collection("products");
        const ordersCollection = database.collection("orders");
        const usersCollections = database.collection("users");
        const reviewsCollections = database.collection("reviews");


        // GET PRODUCTS API
        app.get('/products', async(req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        })

        //PRODUCT POST API
        app.post('/products', async(req, res) => {
            const product = req.body;
            console.log(req.body);
            const result = await productsCollection.insertOne(product);
            res.json(result)
        })
        //Review POST API
        app.post('/reviews', async(req, res) => {
            const review = req.body;
            const result = await reviewsCollections.insertOne(review);
            res.json(result)
        })

        // GET REVIEWS API
        app.get('/reviews', async(req, res) => {
            const cursor = reviewsCollections.find({});
            const reviews = await cursor.toArray();
            res.send(products);
        })

        // GET SINGLE PRODUCT API
        app.get('/products/:id', async(req, res)=>{
            const id = req.params.id;
            const query = { _id: ObjectId(id)};
            const product = await productsCollection.findOne(query);
            res.json(product);
        })

         // ORDER POST API
         app.post("/order", async(req, res)=> {
            const data = req.body;
            const result = await ordersCollection.insertOne(data);
            res.json(result);
        })


        // USER POST API
        app.post("/users", async (req, res) => {
            const user = req.body;
            const result = await usersCollections.insertOne(user);
            console.log(result);
            res.json(result);
          });


        //   USER GET API TO CHECK ADMIN OR NOT

        app.get("/users/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollections.findOne(query);
            let isAdmin = false;
      
            if (user?.role === "admin") {
              isAdmin = true;
            }
            res.json({ admin: isAdmin });
          });


        // USER PUT API

          app.put("/users", async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollections.updateOne(
              filter,
              updateDoc,
              options
            );
            res.json(result);
          });


        //   PUT TO MAKING ADMIN
        app.put("/users/admin", async (req, res) => {
            const user = req.body;
            const requester = req.decodedEmail;
            if (requester) {
              const requesterAccount = await usersCollections.findOne({
                email: requester,
              });
              if (requesterAccount.role === "admin") {
                const filter = { email: user.email };
                const updateDoc = { $set: { role: "admin" } };
                const result = await usersCollections.updateOne(filter, updateDoc);
                res.json(result);
              }
            } else {
              res
                .status(403)
                .json({ message: "You do not have access to make admin" });
            }
          });

          //GET ORDERS API
        app.get('/orders', async(req,res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        })

        // DELETE ORDER API
        app.delete('/orders/:id', async(req, res)=> {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await ordersCollection.deleteOne(query);
            res.json(result)
        })

        

       
    }
    finally{
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res)=> {
    res.send('Running Server Successfully')
})

app.listen(port, ()=>{
    console.log('Running drone shop Server on port : ', port);
})