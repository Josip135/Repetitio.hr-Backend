//daqmfb6df
//172541939416593
//test_user1  rqPqnCn7upaoMfsm   mongodb+srv://test_user1:rqPqnCn7upaoMfsm@cluster0.k6hll.mongodb.net/?
//mongodb+srv://test_user1:rqPqnCn7upaoMfsm@cluster0.k6hll.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

import { v2 as cloudinary } from 'cloudinary'

const connectToCloudinary = async () => {

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
  })

}

export default connectToCloudinary;