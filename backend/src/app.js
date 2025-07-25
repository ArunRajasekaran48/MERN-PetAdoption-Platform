import express from "express"
import cors from "cors"
import cookieparser from "cookie-parser"
const app= express()

const allowedOrigin = "*"; 

app.use(cors({
  origin: allowedOrigin,
  credentials: true,
}));
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static('public'))
app.use(cookieparser())

import userRouter from "./routes/user.routes.js"
import petRouter from "./routes/pets.routes.js"
import adoptionrequestRouter from "./routes/adoptionrequests.routes.js"
import messagesRouter from "./routes/message.routes.js"
import reviewRouter from "./routes/review.routes.js"
import adminRouter from "./routes/admin.routes.js"
import reportRouter from "./routes/report.routes.js"
import reviewReportRouter from "./routes/reviewreport.routes.js"
app.use("/api/v1/users",userRouter)
app.use("/api/v1/pets",petRouter)
app.use("/api/v1/adoptionrequests",adoptionrequestRouter)
app.use("/api/v1/messages",messagesRouter)
app.use("/api/v1/reviews",reviewRouter)
app.use("/api/v1/admin",adminRouter)
app.use("/api/v1", reportRouter)
app.use("/api/v1", reviewReportRouter)

export default app