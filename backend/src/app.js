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
import adoptionrequestRouter from "./routes/adoptionrequests.routes.js"
import messagesRouter from "./routes/message.routes.js"
import reviewRouter from "./routes/review.routes.js"
app.use("/api/v1/users",userRouter)
app.use("/api/v1/pets",petRouter)
app.use("/api/v1/adoptionrequests",adoptionrequestRouter)
app.use("/api/v1/messages",messagesRouter)
app.use("/api/v1/reviews",reviewRouter)
export default app