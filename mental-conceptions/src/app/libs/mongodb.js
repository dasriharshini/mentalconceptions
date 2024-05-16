import mongoose from "mongoose";

const connectMongoDB = async ()=>{

    if (mongoose.connections[0].readyState) {
        return; // If already connected, do not reconnect
      }
     //dotenv.config();
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected")
    } catch (error) {
        console.log(error)
        
    }
}

export default connectMongoDB;