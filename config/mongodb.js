import mongoose from "mongoose"

const connectToDatabase = async () => {


  mongoose.connection.on('connected', () => console.log("Uspješno spajanje s bazom podataka!"))

  await mongoose.connect(`${process.env.MONGODB_URI}/repetitio`)
}

export default connectToDatabase;