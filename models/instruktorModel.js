import mongoose from "mongoose";

const instruktorSchema = new mongoose.Schema({
  ime_prezime: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  lozinka: { type: String, required: true },
  slika: { type: String, required: true },
  predmet: { type: [String], required: true },
  razina_skolovanja: { type: [String], required: true },
  iskustvo: { type: String, required: true },
  informacije: { type: String, required: true },
  dostupnost: { type: Boolean, default: false },
  cijena_repeticija: { type: Number, required: true },
  adresa: { type: Object, required: true },
  grad: { type: String, required: true },
  datum: { type: Number, required: true },
  popunjeni_termini: { type: Object, default: {} }
}, { minimize: false })



const instruktorModel = mongoose.models.instruktor || mongoose.model('instruktor', instruktorSchema)

export default instruktorModel;