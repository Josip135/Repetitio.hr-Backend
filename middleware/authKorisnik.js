import jwt from "jsonwebtoken"

//Middleware za autentifikaciju korisnika
const authKorisnik = async (req, res, next) => {
  try {

    const { token } = req.headers;

    if (!token) {
      return res.json({ success: false, message: "Ponovo neautorizirani login!" });
    }
    const token_decode = jwt.verify(token, process.env.JWT_SECRET)

    req.body.korisnikId = token_decode.id

    next()

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

export default authKorisnik