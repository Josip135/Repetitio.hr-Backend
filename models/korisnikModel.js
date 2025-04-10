import mongoose from "mongoose";

const korisnikSchema = new mongoose.Schema({
  ime_prezime: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  lozinka: { type: String, required: true },
  slika: { type: String, default: "https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o=" },
  adresa: { type: Object, default: { prva: '', druga: '' } },
  spol: { type: String, default: "Nije izabrano" },
  datum_rodenja: { type: String, default: "Nije izabrano" },
  broj_mob: { type: String, default: "0000000000" }
})

const korisnikModel = mongoose.models.korisnik || mongoose.model('korisnik', korisnikSchema)

export default korisnikModel;

/**/