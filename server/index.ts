import express from "express"
import cookieParser from "cookie-parser"
import dotenv from "dotenv";
import path from "path"
// import {fileURLToPath} from "url"

import type {Request, Response} from "express";
import {connectToDB, disconnectFromDB} from "./helper/db";
import {errorHandler} from "./helper/errorHandellers";
import MainRouter from "./routes";

const app = express()
// Load environment variables from the .env file
dotenv.config();

// Define the __dirname variable
// The import.meta meta-property is only allowed when the --module option is es2020, es2022, esnext, system, node16, or nodenext
// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)

//middlewares
app.use(express.json())
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "../frontend/dist")))

const PORT = process.env.PORT || 5000

// Welcome route
app.get("/health-check", (req: Request, res: Response) => {
    res.status(200).json({"message" : "Welcome to EduFusion"})
})

// Routes
//edufusion.com/api/v1
app.use("/api/v1", MainRouter)

// Static files
app.get("*", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"))
})

// Error handler
app.use(errorHandler)

// Connect to MongoDB and start the server
connectToDB()
    .then(() => {
        // If the connection to MongoDB is successful, start the server
        app.listen(PORT, () => {
            console.log(`server is running on http://localhost:${PORT}`)
        })
    })
    .catch((error) => {
        // If there was an error connecting to MongoDB, log the error and disconnect from the database
        disconnectFromDB()
            .then(() => {
            console.log("Disconnected from MongoDB")
        })
            .catch((error) => {
            console.error("Error disconnecting from MongoDB: ", error)
        })
        // Log the error and exit the process
        console.error("Error connecting to MongoDB: ", error)
        process.exit(1)
    })