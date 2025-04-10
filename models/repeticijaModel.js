import mongoose from "mongoose";

const repeticijaSchema = new mongoose.Schema({
  korisnikId: { type: String, required: true },
  instruktorId: { type: String, required: true },
  termin_datum: { type: String, required: true },
  termin_vrijeme: { type: String, required: true },
  korisnikPodaci: { type: Object, required: true },
  instruktorPodaci: { type: Object, required: true },
  cijena: { type: Number, required: true },
  datum: { type: Number, required: true },
  otkazano: { type: Boolean, default: false },
  placeno: { type: Boolean, default: false },
  odradeno: { type: Boolean, default: false },
})

const repeticijaModel = mongoose.models.repeticija || mongoose.model('repeticija', repeticijaSchema)
export default repeticijaModel