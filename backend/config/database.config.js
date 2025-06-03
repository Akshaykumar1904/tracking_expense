import mongoose from 'mongoose';

// #region connectDb 

const connectDb = async() =>{
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    // console.log(`Server is now connected at: ${(await conn).Connection.host}`);
  } catch (error) {
    console.error("this is not working:",error);
  }
}

export default connectDb;