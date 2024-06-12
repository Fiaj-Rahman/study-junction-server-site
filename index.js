const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();

const corsOptions = {
  origin: ['http://localhost:5173',
    'https://study-junction-de8cf.web.app',
    'https://study-junction-de8cf.firebaseapp.com'
  ],
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions))

// const corsOptions = {
//   origin: ["http://localhost:5173", "http://localhost:5174"],
//   credentails: true,
//   optionSuccessStatus: 200,
// };

// app.use(cors(corsOptions));
// app.use(function (req, res, next) {
//   res.header('Access-Control-Allow-Origin', '*')
//   res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST')
//   res.header(
//     'Access-Control-Allow-Headers',
//     'Origin, X-Requested-With, Content-Type, Accept'
//   )
//   next()
// })
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from Assignment Server");
});

// mongoDB Here

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.neywkpg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    const allAssignments = client
      .db("assignments")
      .collection("createAllAssignments");
    const submittedAssignments = client
      .db("assignments")
      .collection("submittedAssignment");
    // await client.connect();


    //JWT Generate

    app.post('/jwt',async(req,res)=>{
      const user = req.body;
      const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:'7d',
      })
      res.cookie('token',token,{
        httpOnly:true,
        // secure: false,
        // sameSite:'none'
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV ==='production'?'none' : 'strict',
      })
      .send({success:true})
    })


    // clear token on logout
    app.get('/logout',(req,res)=>{
      res
      .clearCookie('token',{
        httpOnly:true,
        // secure: false,
        // sameSite:'none'
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV ==='production'?'none' : 'strict',
        maxAge:0,
      })
      .send({success:true})
    })



    // get all assignments data from db
    app.get("/allAssignments", async (req, res) => {
      const result = await allAssignments.find().toArray();
      res.send(result);
    });

    //  get a single assignment Data

    app.get("/assignment/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allAssignments.findOne(query);
      res.send(result);
    });

    app.get("/assignments/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allAssignments.findOne(query);
      res.send(result);
    });

    app.get("/takeSubmission/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allAssignments.findOne(query);
      res.send(result);
    });

    // save a submittedAssignments data in db

    app.post("/submittedAssignments", async (req, res) => {
      const submittedData = req.body;
      const result = await submittedAssignments.insertOne(submittedData);
      res.send(result);
    });

    // save a CreateAssignment data in db

    app.post("/createassignment", async (req, res) => {
      const createData = req.body;
      const result = await allAssignments.insertOne(createData);
      res.send(result);
    });

    // get all assignment posted by a specific user

    app.get("/myposted/:email", async (req, res) => {
      const email = req.params.email;
      const query = { buyer_email: email };
      const result = await allAssignments.find(query).toArray();
      res.send(result);
    });

    // get all submitted assignment posted by a specific user

    app.get("/submittedAssignment/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await submittedAssignments.find(query).toArray();
      res.send(result);
    });

    // get all pending assignment posted by a specific user

    app.get("/pendingAssignment/:email", async (req, res) => {
      const email = req.params.email;
      const query = { buyer_email: email };
      const result = await submittedAssignments.find(query).toArray();
      res.send(result);
    });

    // get one pending assignment id posted by a specific user

    app.get("/pendingAssignments/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await submittedAssignments.findOne(query);
      res.send(result);
    });

    //Update pending Assingment with status
    // app.patch('/pendingAssingments/:id',async(req,res)=>{
    //   const id = req.params.id
    //   const status = req.body;
    //   const query = {_id: new ObjectId(id)}
    //   const updateDoc = 
    //   {
    //     $set: status,
    //   }
    //   const result = await submittedAssignments.updateOne(query,updateDoc)
    //   res.send(result)
    // })


     //Update pending Assingment with mark and feedback

     app.put("/pendingAssingments/:id", async (req, res) => {
      const id = req.params.id;
      const submittedData = req.body;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDocx = {
        $set: {
          ...submittedData,
        },
      };

      const result = await submittedAssignments.updateOne(query, updateDocx, options);
      res.send(result);
    });




    // Delete all jobs posted by a specific user

    app.delete("/mypostDelete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allAssignments.deleteOne(query);
      res.send(result);
    });

    // Update all jobs posted by a specific user

    app.put("/assignment/:id", async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          ...updateData,
        },
      };

      const result = await allAssignments.updateOne(query, updateDoc, options);
      res.send(result);
    });





    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => console.log(`Server running on port ${port}`));
