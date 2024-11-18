import { MongoClient, ServerApiVersion } from "mongodb";
import { dburi } from "./consts.js";

const client = new MongoClient(dburi, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


await client.connect().then(() => console.log("DB Connected"))
    .catch(err => console.log("DB Connection Error", err));


const dbName = "userdb";
const collectionName = "user";


const database = client.db(dbName);
export const userCollection = database.collection(collectionName);

