import express from 'express'
import cookieParser from 'cookie-parser';

const app = express();

// middleware 

app.use(cookieParser());
app.use(express.json({ limit: "16kb" }))


// writing routes 

// import { router } from '../routes/User.route.js';
// import { router as MessageRouter } from '../routes/Message.route.js';

// app.use("/api/v1/users", router)
// app.use("/api/v1/messages", MessageRouter)


import { router } from '../routes/User.route.js';

app.use("/api/v1/users/", router)

export default app;