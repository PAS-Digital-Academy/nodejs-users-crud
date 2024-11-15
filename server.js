import express from 'express';
import fs from 'fs';
import { dbFile } from './consts.js';
import { apiKeyMiddleware } from './middleware.js';

const app = express()

app.use(express.json())
const port = 6550



app.post("/register", (req, res) => {
    const { username, password, name } = req.body;
    let dbcontent = [];

    const fileContent = fs.readFileSync(dbFile).toString();

    if (fileContent) {
        dbcontent = JSON.parse(fileContent);
        if (dbcontent.find(user => user.username === username)) {
            return res.status(400).send("User Already Exists")
        }
    }
    dbcontent.push({ username, password, name })

    fs.writeFileSync(dbFile, JSON.stringify(dbcontent))

    res.send("User Registered Successfully")
})


app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const fileContent = fs.readFileSync(dbFile).toString();
    const userData = JSON.parse(fileContent);
    if (userData.find(user => user.username === username && user.password === password)) {
        res.json({
            token: btoa(`${username}:${password}`)
        })
    } else {
        res.status(400).send("Invalid Credentials")
    }
})

app.get("/users", apiKeyMiddleware, (req, res) => {
    const userData = req['user'];
    let allUser = [];
    userData.forEach(user => {
        allUser.push({
            username: user.username,
            name: user.name
        })
    })
    res.json({
        count: allUser.length,
        users: allUser
    })
})


app.put("/users", apiKeyMiddleware, (req, res) => {

    let currentUser = req['currentUser'];
    let users = req['user'];

    const { name, password } = req.body;

    currentUser.name = name ?? currentUser.name;
    currentUser.password = password ?? currentUser.password;


    let updatedUsers = users.map(user => {
        if (user.username === currentUser.username) {
            return currentUser;
        } else {
            return user;
        }
    })


    fs.writeFileSync(dbFile, JSON.stringify(updatedUsers))

    res.json({
        message: "User Updated Successfully",
        users: currentUser
    })


})


app.delete("/users", apiKeyMiddleware, (req, res) => {
    let users = req['user'];
    let currentUser = req['currentUser'];
    let updatedUsers = users.filter(user => user.username !== currentUser.username);

    fs.writeFileSync(dbFile, JSON.stringify(updatedUsers))
    res.json({
        message: "User Deleted Successfully",
        users: currentUser
    })
})


app.listen(port, () => {
    console.log(`Appllication Started on port : ${port}`)
})