import { dbFile } from "./consts.js";
import fs from "fs";

export const apiKeyMiddleware = (req, res, next) => {
    let apiKey = req.headers["x-api-key"];
    if (!apiKey) {
        return res.status(403).send("Access Denied");
    }


    let decodedApiKey = atob(apiKey);
    let [username, password] = decodedApiKey.split(":");


    const fileContent = fs.readFileSync(dbFile).toString();
    const userData = JSON.parse(fileContent);


    if (userData.find(user => user.username === username && user.password === password)) {
        req['user'] = userData;


        const currentUser = userData.find(user => user.username === username);
        req['currentUser'] = currentUser;


        next();
    } else {
        res.status(400).send("Invalid Api Key")
    }
}