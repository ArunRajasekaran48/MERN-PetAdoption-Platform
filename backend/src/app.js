import express from "express"
import cors from "cors"
import cookieparser from "cookie-parser"
const app= express()

app.use(cors(
    {origin:process.env.CORS_ORIGIN,
     credentials:true
}))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static('public'))
app.use(cookieparser())

import userRouter from "./routes/user.routes.js"
import petRouter from "./routes/pets.routes.js"

app.use("/api/v1/users",userRouter)
app.use("/api/v1/pets",petRouter)


export default app