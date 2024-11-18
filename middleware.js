import { userCollection } from "./db.js";
import { ObjectId } from "mongodb";

export const apiKeyMiddleware = async (req, res, next) => {
    let apiKey = req.headers["x-api-key"];
    if (!apiKey) {
        return res.status(403).send("Access Denied");
    }


    let decodedApiKey = atob(apiKey);

    if (decodedApiKey.length !== 24) {
        return res.status(400).send("Invalid Api Key")
    }

    const userData = await userCollection.findOne({ _id: new ObjectId(decodedApiKey) });

    if (userData) {

        req['currentUser'] = userData;


        next();
    } else {
        res.status(400).send("Invalid Api Key")
    }
}