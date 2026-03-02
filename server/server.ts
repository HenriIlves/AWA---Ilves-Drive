import express, {Express} from "express"
import path from "path"
import router from "./src/routes/index"
import morgan from "morgan"
import dotenv from "dotenv"
import mongoose, { Connection } from 'mongoose'
import cors from 'cors'

dotenv.config()

const app: Express = express()
const port: number = parseInt(process.env.PORT as string) || 3001
const mongoDB: string = "mongodb://127.0.0.1:27017/testdb"

mongoose.connect(mongoDB)
mongoose.Promise = Promise
const db: Connection = mongoose.connection
db.on("error", console.error.bind(console, "MongoDB connection error"))

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(morgan("dev"))

// IMPORTANT: Serve static files BEFORE routes
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

app.use("/", router)

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
