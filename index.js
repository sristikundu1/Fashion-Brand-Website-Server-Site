const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());


                


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.iz3zu0d.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const productCollection = client.db("productDB").collection("products");
    

    // app.get("/products/:brand", async (req, res) => {
    //   const id = req.params.brand;
    //   const query = { brandName: id }
    //   const cursor = productCollection.findOne(query);
    //   const result = await cursor.toArray();//find data in array
    //   res.send(result);
    // })

    app.get("/products", async (req, res) => {
      const cursor = productCollection.find();
      const result = await cursor.toArray();//find data in array
      res.send(result);
    })

   

    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      console.log("new products:", newProduct);
      // Insert the defined document into the "productdb" collection
      const result = await productCollection.insertOne(newProduct);
      res.send(result);
    })

   
    


   


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Fashion and Apparel website server is running');
});

app.listen(port, () => {
    console.log(`Fashion and Apparel website server is running on port : ${port}`);
  });