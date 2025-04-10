import validator from "validator"
import bcrypt from "bcrypt"
import { v2 as cloudinary } from "cloudinary"
import instruktorModel from "../models/instruktorModel.js";
import jwt from "jsonwebtoken"
import repeticijaModel from '../models/repeticijaModel.js'
import korisnikModel from "../models/korisnikModel.js";

const dodajInstruktora = async (req, res) => {
  try {
    const { ime_prezime, email, lozinka, predmet, razina_skolovanja, iskustvo, informacije, cijena_repeticija, adresa, grad } = req.body;

    const slikaFile = req.file;
    // console.log({ ime_prezime, email, lozinka, predmet, razina_skolovanja, iskustvo, informacije, cijena_repeticija, adresa }, slikaFile)

    //provjera svih podataka da se doda instruktor
    if (!ime_prezime || !email || !lozinka || !predmet || !razina_skolovanja || !iskustvo || !informacije || !cijena_repeticija || !adresa || !grad) {
      return res.json({ success: false, message: "Dodajte sve podatke kako bi dodali instruktora!" });
    }

    //validiranje email formata
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Email format neispravan!" });
    }

    //validiranje jake lozinke
    if (lozinka.length < 8) {
      return res.json({ success: false, message: "Lozinka je prekratka!" });
    }

    //enkriptiranje lozinke
    const salt = await bcrypt.genSalt(10);
    const hashedLozinka = await bcrypt.hash(lozinka, salt);

    //dodavanje slike u Cloudinary i generiranje URL-a
    const slikaUpload = await cloudinary.uploader.upload(slikaFile.path, { resource_type: "image" });
    const slikaUrl = slikaUpload.secure_url

    const instruktorPodaci = {
      ime_prezime,
      email,
      lozinka: hashedLozinka,
      slika: slikaUrl,
      predmet,
      razina_skolovanja,
      iskustvo,
      informacije,
      cijena_repeticija,
      adresa: JSON.parse(adresa),
      grad,
      datum: Date.now()
    }

    const noviInstruktor = new instruktorModel(instruktorPodaci);

    await noviInstruktor.save();

    res.json({ success: true, message: "Instruktor dodan!" });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

//API za login admina
const loginAdmin = async (req, res) => {
  try {
    const { email_admin, lozinka_admin } = req.body;

    if (email_admin === process.env.ADMIN_EMAIL && lozinka_admin === process.env.ADMIN_LOZINKA) {

      const token = jwt.sign(email_admin + lozinka_admin, process.env.JWT_SECRET);
      res.json({ success: true, token });

    } else {
      res.json({ success: false, message: "Netočni lozinka ili email!" });
    }

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

//dobavljanje svih instruktora za kontrolnu ploču admina

const sviInstruktori = async (req, res) => {
  try {
    const instruktori = await instruktorModel.find({}).select('-lozinka')
    res.json({ success: true, instruktori })

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

// api za dobivanje pristupa svim terminima repeticija

const sviTermini = async (req, res) => {
  try {
    const repeticije = await repeticijaModel.find({})
    res.json({ success: true, repeticije })
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

//api za otkaz termina - admin
const otkaziRepeticijeAdmin = async (req, res) => {
  try {

    const { repeticijaId } = req.body
    const repeticijaPodaci = await repeticijaModel.findById(repeticijaId)

    //provjeri jeli to termin od specifičnog korisnika
    /*if (repeticijaPodaci.korisnikId !== korisnikId) {
      return res.json({ success: false, messgae: "Neautorizirani postupak!" })
    }*/

    await repeticijaModel.findByIdAndUpdate(repeticijaId, { otkazano: true })

    //oslobađanje instruktorovog termina povodom otkaza
    const { instruktorId, termin_datum, termin_vrijeme } = repeticijaPodaci
    const instruktorPodaci = await instruktorModel.findById(instruktorId)

    let popunjeni_termini = instruktorPodaci.popunjeni_termini

    popunjeni_termini[termin_datum] = popunjeni_termini[termin_datum].filter(e => e !== termin_vrijeme)

    await instruktorModel.findByIdAndUpdate(instruktorId, { popunjeni_termini })

    res.json({ success: true, message: "Repeticije otkazane!" })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

//api za dobivanje podataka na kontrolnoj ploči
const adminKontrolnaPloca = async (req, res) => {
  try {
    const instruktori = await instruktorModel.find({})
    const korisnici = await korisnikModel.find({})
    const repeticije = await repeticijaModel.find({})

    const glavniPodaci = {
      instruktori: instruktori.length,
      repeticije: repeticije.length,
      korisnici: korisnici.length,
      //hvatanje 5 najnovijih termina za repeticije
      najnovijiTermini: repeticije.reverse().slice(0, 5)
    }

    res.json({ success: true, glavniPodaci })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

export { dodajInstruktora, loginAdmin, sviInstruktori, sviTermini, otkaziRepeticijeAdmin, adminKontrolnaPloca }