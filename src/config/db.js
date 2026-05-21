import { MongoClient, ServerApiVersion } from "mongodb";

const mongoUri = process.env.MONGO_URI;

// console.log(mongoUri);

const client = new MongoClient(mongoUri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

export const connectDB = async () => {
    await client.connect();
    
    return client.db("ideonexis");
};

export default client;