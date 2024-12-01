import { MongoClient } from "mongodb";

let _db = null;
const client = new MongoClient(process.env.DB_URL);

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");
    _db = client.db('process.env.DB_Name'); // Initialize the database
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    throw err;
  }
}

function getDb() {
  if (!_db) {
    throw new Error("Database not initialized. Call connectToDatabase first.");
  }
  return _db;
}

export { connectToDatabase, getDb };



// async function getAllExercises() {
//     const db = await connectToDatabase();
//     console.log("tring to get all exercises");
//     // Execute our query
//     const exercises = await db.collection('exercise').find({}).toArray();
//     return exercises
// }

// async function getExercisesWithCategory(category) {
//     const db = await connectToDatabase();
//     console.log(`Attempting to query exercise in the ${category} category`);
//     // Execute our query
//     const exercises = await db.collection('exercise').find({category:`${category}`}).toArray();
//     return exercises
// }

// ping();

// module.exports = await connectToDatabase();

// export { getAllExercises, getExercisesWithCategory, connectToDatabase, ping};
