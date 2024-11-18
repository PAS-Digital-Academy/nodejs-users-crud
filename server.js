import express from 'express';
import { apiKeyMiddleware } from './middleware.js';
import { userCollection } from './db.js';
import { ObjectId } from 'mongodb';

const app = express()

app.use(express.json())
const port = 6550


app.post("/register", async (req, res) => {
    try {
        const { username, password, name } = req.body;

        const isExists = await userCollection.findOne({ username });

        if (isExists) {
            return res.status(400).send("User Already Exists")
        }

        await userCollection.insertOne({ username, password, name });

        res.send("User Registered Successfully")
    } catch (error) {
        console.log(error);
        res.send("Something went wrong")
    }
})


app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await userCollection.findOne({ username });


        if (user && user.password === password) {
            res.json({
                token: btoa(`${user?._id}`)
            })
        } else {
            res.status(400).send("Invalid Credentials")
        }
    } catch (error) {
        console.log(error);
        res.send("Something went wrong")
    }
})

app.get("/users", apiKeyMiddleware, async (req, res) => {
    try {
        const allUser = await userCollection.find({}).toArray();
        res.json({
            count: allUser.length,
            users: allUser
        })
    } catch (error) {
        console.log(error);
        res.send("Something went wrong")
    }
})


app.put("/users", apiKeyMiddleware, async (req, res) => {

    try {
        let currentUser = req['currentUser'];
        const { name, password } = req.body;

        let updateData = {};

        if (name) {
            updateData["name"] = name;
        }
        if (password) {
            updateData["password"] = password;
        }

        const updatedUser = await userCollection.findOneAndUpdate({
            _id: {
                $eq: new ObjectId(currentUser._id)
            }
        },
            { $set: updateData },
            { returnDocument: 'after' }
        )

        res.json({
            message: "User Updated Successfully",
            users: updatedUser
        })
    } catch (error) {
        console.log(error);
        res.send("Something went wrong")
    }


})


app.delete("/users", apiKeyMiddleware, async (req, res) => {
    try {
        let currentUser = req['currentUser'];

        await userCollection.findOneAndDelete({
            _id: {
                $eq: new ObjectId(currentUser._id)
            }
        })

        res.json({
            message: "User Deleted Successfully",
            users: currentUser
        })
    } catch (error) {
        console.log(error);
        res.send("Something went wrong")
    }
})


app.listen(port, () => {
    console.log(`Appllication Started on port : ${port}`)
})