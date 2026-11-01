const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

async function run() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✅ Connected successfully");
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();