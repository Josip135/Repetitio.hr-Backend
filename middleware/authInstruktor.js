import jwt from "jsonwebtoken"

//Middleware za autentifikaciju instruktora
const authInstruktor = async (req, res, next) => {
  try {
    console.log(req.headers)
    const { instrtoken } = req.headers

    if (!instrtoken) {
      return res.json({ success: false, message: "Ponovo neautorizirani login!" });
    }
    const token_decode = jwt.verify(instrtoken, process.env.JWT_SECRET)

    req.body.instruktorId = token_decode.id

    next()

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

export default authInstruktor