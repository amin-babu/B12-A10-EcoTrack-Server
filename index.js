const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const challengeCollection = db.collection('challanges');
    const renectTipsCollection = db.collection('renect_tips');
    const nextEventsCollection = db.collection('next_events');
    const usersChallenge = db.collection('users');

    app.get('/hero-slides', async (req, res) => {
      const result = await ecoTrackCollection.find().toArray();
      res.send(result);
    });

    app.get('/challanges', async (req, res) => {
      const { category, startDate, endDate, minParticipants, maxParticipants } = req.query;
      let filter = {};

      if (category) {
        const categories = category.split(',');
        filter.category = { $in: categories };
      }

      if (startDate && endDate) {
        filter.startDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
      }

      if (minParticipants && maxParticipants) {
        filter.participants = { $gte: parseInt(minParticipants), $lte: parseInt(maxParticipants) };
      } else if (minParticipants) {
        filter.participants = { $gte: parseInt(minParticipants) };
      } else if (maxParticipants) {
        filter.participants = { $lte: parseInt(maxParticipants) };
      }

      const result = await challengeCollection.find(filter).toArray();
      res.send(result);
    });

    app.get('/challanges/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await challengeCollection.findOne(query);
      res.send(result);
    });

    app.put('/challanges/:id', async (req, res) => {
      const id = req.params.id;
      const updatedData = {
        ...req.body,
        updatedAt: new Date(),
      };
      const query = { _id: new ObjectId(id) };
      const result = await challengeCollection.updateOne(query, { $set: updatedData });
      res.send(result);
    });

    app.delete('/challanges/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await challengeCollection.deleteOne(query);
      res.send(result);
    });

    app.get('/active-challenges', async (req, res) => {
      const result = await challengeCollection.find().limit(6).toArray();
      res.send(result)
    });

    app.get('/renect-tips', async (req, res) => {
      const result = await renectTipsCollection.find().toArray();
      res.send(result);
    });

    app.get('/next-events', async (req, res) => {
      const result = await nextEventsCollection.find().toArray();
      res.send(result);
    });

    app.post('/challanges/join/:id', async (req, res) => {
      const { userId } = req.body;
      const challengeId = req.params.id;

      const newJoin = {
        userId,
        challengeId,
        status: "Not Started",
        progress: 0,
        joinDate: new Date()
      };

      await usersChallenge.insertOne(newJoin);

      await challengeCollection.updateOne(
        { _id: new ObjectId(challengeId) },
        { $inc: { participants: 1 } }
      );

      res.send({ success: true, message: "Joined successfully" })
    });

    app.post('/api/challanges', async (req, res) => {
      const newChallenge = req.body;
      newChallenge.participants = 0;
      const result = await challengeCollection.insertOne(newChallenge);
      res.send({ success: true, result });
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
