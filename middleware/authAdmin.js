import jwt from "jsonwebtoken"

//Middleware za autentifikaciju admina
const authAdmin = async (req, res, next) => {
  try {

    const { admintoken } = req.headers;

    if (!admintoken) {
      return res.json({ success: false, message: "Ponovo neautorizirani login!" });
    }
    const token_decode = jwt.verify(admintoken, process.env.JWT_SECRET)

    if (token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_LOZINKA) {
      return res.json({ success: false, message: "Ponovo neautorizirani login!" });
    }

    next()

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

export default authAdmin