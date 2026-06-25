import dotenv from "dotenv";
dotenv.config();
import connectDb from "./db/index.js";
console.log(process.env.MONGODB_URI);
connectDb()
.then(()=>{
    app.listen(process.env.PORT||8000, ()=>{
        console.log("Server is running on port", process.env.PORT||8000);
    })
})
.catch((err)=>{
    console.error("Error connecting to MongoDB:", err);
})




/*
import mongoose from "mongoose";
import {DB_NAME} from "./constants.js";
import express from "express";
const app = express();

async function connectDb(){
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("error", (err) => {
            console.error("MongoDB connection error:", err);
        })
        app.listen(process.env.PORT, () => {
            console.log("Db is connected  on port", process.env.PORT);
        })
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
}

connectDb();

*/