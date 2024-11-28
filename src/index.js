import express from 'express'
import ConnectDb from './db/ConnectDb.js';
import dotenv from 'dotenv'
dotenv.config();
import app from "./app.js";
const port = process.env.PORT

ConnectDb()

.then(()=>{
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
})
.catch((error)=>{
  console.log("mongoDb Connection Failed" , error);
})
  
