import express from 'express'
import dotenv from  'dotenv';
import cors from 'cors'
import cloudinaryConfig from './cloudinary_config';

dotenv.config()

const app = express();
app.use(express.json()) 
app.use(cors())
cloudinaryConfig()



app.get("/",(req,res)=>{
    res.send("hi")
})


app.listen(process.env.PORT, ()=>{
    console.log(`backend cookin on ${process.env.PORT}` )
})