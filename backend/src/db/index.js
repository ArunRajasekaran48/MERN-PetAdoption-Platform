import mongoose from "mongoose"

const connectDB= async()=>{
    try {
        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URL}`)
        console.log(`MONGODB CONNECTED!! ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.log(`MongoDB Connection Error ${error}`);
        process.exit(1);
    }
}
export default connectDB;