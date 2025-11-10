const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qyacehm.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/', (req, res) => {
  res.send('EcoTrack Server is running!')
});

async function run() {
  try {
    await client.connect();
    
    const db = client.db('eco_track_db');
    const ecoTrackCollection = db.collection('ecotracks');
    const activeChallengeCollection = db.collection('active_challange');

    app.get('/hero-slides', async (req, res) => {
      const result = await ecoTrackCollection.find().toArray();
      res.send(result);
    });

    app.get('/active-challange', async (req, res) => {
      const result = await activeChallengeCollection.find().toArray();
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`EcoTrack Server is running on port ${port}`)
});
