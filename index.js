const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();

const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAIL_GUN_API_KEY,
});

const port = process.env.PORT || 5000;

//middleware
app.use(cors())
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.iz3zu0d.mongodb.net/?retryWrites=true&w=majority`;


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
    // await client.connect();

    const productCollection = client.db("productDB").collection("products");
    const wishCollection = client.db("productDB").collection("wishproducts");
    const reviewCollection = client.db("productDB").collection("reviews");
    const emailCollection = client.db("productDB").collection("emails");


    // auth related api



    app.put("/product/:id", async (req, res) => {
      const id = req.params.id;
      const updateProduct = req.body;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true }
      const products = {
        $set: {
          name: updateProduct.name,
          brandName: updateProduct.brandName,
          type: updateProduct.type,
          price: updateProduct.price,
          rating: updateProduct.rating,
          details: updateProduct.details,
          photo: updateProduct.photo,


        }
      }
      console.log(products);
      const result = await productCollection.updateOne(filter, products, options);

      res.send(result);

    })


    app.get("/products/:brand", async (req, res) => {
      const id = req.params.brand;
      const query = { brandName: id }
      const cursor = productCollection.find(query);
      const result = await cursor.toArray();//find data in array
      res.send(result);
    })

    app.get("/products", async (req, res) => {
      const cursor = productCollection.find();
      const result = await cursor.toArray();//find data in array
      res.send(result);
    })

    app.get("/products/updateproduct/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await productCollection.findOne(query);
      res.send(result);
    })

    app.get("/products/productdetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await productCollection.findOne(query);
      res.send(result);
    })

    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      console.log("new products:", newProduct);
      // Insert the defined document into the "coffees" collection
      const result = await productCollection.insertOne(newProduct);
      res.send(result);
    })


    //use for cart data api 

    app.get("/wishproducts", async (req, res) => {
      const cursor = wishCollection.find();
      const result = await cursor.toArray();//find data in array
      res.send(result);
    })

    app.post("/wishproducts", async (req, res) => {
      const cartProduct = req.body;
      console.log("cart products:", cartProduct);
      // Insert the defined document into the "coffees" collection
      const result = await wishCollection.insertOne(cartProduct);
      res.send(result);
    })

    app.delete("/wishproducts/:id", async (req, res) => {
      const id = req.params.id;
      console.log("please delete from database");
      const query = { _id: new ObjectId(id) } //unique objectId to delete one data
      const result = await wishCollection.deleteOne(query);
      res.send(result);
    })


    app.get("/reviews", async (req, res) => {
      const cursor = reviewCollection.find();
      const result = await cursor.toArray();//find data in array
      res.send(result);
    })

    app.post("/reviews", async (req, res) => {
      const reviewProduct = req.body;
      // console.log("new reviews:", reviewProduct);
      // Insert the defined document into the "coffees" collection
      const result = await reviewCollection.insertOne(reviewProduct);
      res.send(result);
    })


    app.post('/send-email', async (req, res) => {
      try {
        const { email } = req.body;
        
      
        const result = await emailCollection.insertOne({ email });
    
        // Sending email through Mailgun
        const msg = await mg.messages.create(process.env.MAIL_SENDING_DOMAIN, {
          from: 'Mailgun Sandbox <postmaster@sandboxf4af6a762a0f4a7aa19f21e2d2e7f0c8.mailgun.org>',
          to: ['sristikundu2468@gmail.com'],
          subject: 'About Subscription',
          text: 'Testing some Mailgun awesomeness!',
          html: '<div><h2>Thank you for your subscription</h2></div>'
        });
    
        console.log('Mailgun response:', msg); // Log Mailgun response

        res.json({ success: true, message: 'Email subscribed successfully' });
      } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, message: 'Error subscribing to the email' });
      }
    });
    

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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
  console.log(`Fashion and Apparel website server is running on port : : ${port}`);
});