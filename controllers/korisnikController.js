import validator from 'validator'
import bcrypt from 'bcrypt'
import korisnikModel from '../models/korisnikModel.js'
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary'
import instruktorModel from '../models/instruktorModel.js'
import repeticijaModel from '../models/repeticijaModel.js'
import Stripe from "stripe"

import 'dotenv/config'
//import razorpay from 'razorpay'

//api za registraciju
const registracijaKorisnika = async (req, res) => {
  try {

    const { ime_prezime, email, lozinka } = req.body

    if (!ime_prezime || !lozinka || !email) {
      return res.json({ success: false, message: "Ispunite sva polja za registraciju!" })
    }

    //validiranje emaila i lozinke
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Unesite ispravan email za registraciju!" })
    }

    if (lozinka.length < 8) {
      return res.json({ success: false, message: "Lozinka je prekratka!" })
    }

    //hashiranje korisnikove lozinke
    const salt = await bcrypt.genSalt(10)
    const hashiranaLozinka = await bcrypt.hash(lozinka, salt)

    const korisnikData = {
      ime_prezime,
      email,
      lozinka: hashiranaLozinka
    }

    //pohrana korisnika u bazu podataka
    const noviKorisnik = new korisnikModel(korisnikData)
    const korisnik = await noviKorisnik.save()

    const token = jwt.sign({ id: korisnik._id }, process.env.JWT_SECRET)

    res.json({ success: true, token })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

//api za login
const loginKorisnika = async (req, res) => {

  try {

    const { email, lozinka } = req.body
    const korisnik = await korisnikModel.findOne({ email })

    if (!korisnik) {
      return res.json({ success: false, message: "Nema Vas u bazi korisnika! Registrirajte se!" })
    }

    const podudaranjeLozinke = await bcrypt.compare(lozinka, korisnik.lozinka)

    if (podudaranjeLozinke) {
      const token = jwt.sign({ id: korisnik._id }, process.env.JWT_SECRET)
      res.json({ success: true, token })
    } else {
      res.json({ success: false, message: "Netočna lozinka!" })
    }

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

//api za dobivanje podataka o korisniku
const getProfilKorisnika = async (req, res) => {
  try {

    const { korisnikId } = req.body
    const korisnikPodaci = await korisnikModel.findById(korisnikId).select('-lozinka')

    res.json({ success: true, korisnikPodaci })


  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

//api za izmjenu profila
const izmijeniProfil = async (req, res) => {
  try {

    const { korisnikId, ime_prezime, broj_mob, adresa, datum_rodenja, spol } = req.body
    const slikaFile = req.file

    if (!ime_prezime || !broj_mob || !adresa || !datum_rodenja || !spol) {
      return res.json({ success: false, message: "Podaci nedostaju!" })
    }

    await korisnikModel.findByIdAndUpdate(korisnikId, { ime_prezime, broj_mob, adresa: JSON.parse(adresa), datum_rodenja, spol })

    if (slikaFile) {
      //dodaj sliku na Cloudinary
      const slikaUpload = await cloudinary.uploader.upload(slikaFile.path, { resource_type: "image" })
      const slikaUrl = slikaUpload.secure_url

      await korisnikModel.findByIdAndUpdate(korisnikId, { slika: slikaUrl })
    }

    res.json({ success: true, message: "Profil izmijenjen!" })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

//api za bookiranje repeticija
const bookirajRepeticije = async (req, res) => {
  try {
    const { korisnikId, instruktorId, termin_datum, termin_vrijeme } = req.body

    const instruktorPodaci = await instruktorModel.findById(instruktorId).select('-lozinka')

    if (!instruktorPodaci) {
      return res.json({ success: false, message: "Instruktor nije pronađen!" })
    }

    if (!instruktorPodaci.dostupnost) {
      return res.json({ success: false, message: "Instruktor trenutno nije dostupan!" })
    }

    let popunjeni_termini = instruktorPodaci.popunjeni_termini

    //provjera dostupnosti termina 
    if (popunjeni_termini[termin_datum]) {
      if (popunjeni_termini[termin_datum].includes(termin_vrijeme)) {
        return res.json({ success: false, message: "Termin nije dostupan!" })
      } else {
        popunjeni_termini[termin_datum].push(termin_vrijeme)
      }
    } else {
      popunjeni_termini[termin_datum] = []
      popunjeni_termini[termin_datum].push(termin_vrijeme)
    }

    const korisnikPodaci = await korisnikModel.findById(korisnikId).select('-lozinka')

    delete instruktorPodaci.popunjeni_termini

    const repeticijaPodaci = {
      korisnikId,
      instruktorId,
      korisnikPodaci,
      instruktorPodaci,
      cijena: instruktorPodaci.cijena_repeticija,
      termin_vrijeme,
      termin_datum,
      datum: Date.now()
    }

    const newRepeticija = new repeticijaModel(repeticijaPodaci)
    await newRepeticija.save()

    //spremanje novih podataka o terminima u instruktorPodaci
    await instruktorModel.findByIdAndUpdate(instruktorId, { popunjeni_termini })

    res.json({ success: true, message: "Repeticije rezervirane!" })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

//api za korisnikove repeticije 
const listaRepeticija = async (req, res) => {
  try {
    const { korisnikId } = req.body
    const repeticije = await repeticijaModel.find({ korisnikId })

    res.json({ success: true, repeticije })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

//api za otkazivanje repeticije
const otkaziRepeticije = async (req, res) => {
  try {

    const { korisnikId, repeticijaId } = req.body
    const repeticijaPodaci = await repeticijaModel.findById(repeticijaId)

    //provjeri jeli to termin od specifičnog korisnika
    if (repeticijaPodaci.korisnikId !== korisnikId) {
      return res.json({ success: false, messgae: "Neautorizirani postupak!" })
    }

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

/*const razorpayInstance = new razorpay({
  key_id:'',
  key_secret:'',
})

//api za plaćanje repeticija Razorpay metodom
const placanjeRazorpay = async(req, res) => {
}*/
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const placanjeRepeticijaStripe = async (req, res) => {

  try {
    const { korisnikId, instruktorId, repeticijaId } = req.body

    const korisnikPodaci = await korisnikModel.findById(korisnikId)

    const instruktorPodaci = await instruktorModel.findById(instruktorId)

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: "Repeticije"
          },
          unit_amount: instruktorPodaci.cijena_repeticija * 100
        },
        quantity: 1
      }],

      success_url: process.env.FRONTEND_URL,
      cancel_url: process.env.ERROR_URL,
      metadata: {
        korisnikId, repeticijaId
      },

      customer_email: korisnikPodaci.email,

    })

    //console.log(session)

    res.json({ success: true, sessionUrl: session.url })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const potvrdiPlacanjeStripe = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  try {
    console.log("webhook primljen!");
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)



    if (event.type === "checkout.session.completed") {
      const session = event.data.object;



      const korisnikId = session.metadata.korisnikId
      const repeticijaId = session.metadata.repeticijaId



      await repeticijaModel.findByIdAndUpdate(repeticijaId, { placeno: true })
      console.log("Plaćanje potvrđeno!")
    }

    res.json({ received: true });

  } catch (error) {
    console.log(error);
  }
}
//stripe listen --forward-to localhost:4000/api/korisnik/stripe-webhook

export {
  registracijaKorisnika, loginKorisnika, getProfilKorisnika,
  izmijeniProfil, bookirajRepeticije, listaRepeticija,
  otkaziRepeticije, placanjeRepeticijaStripe, potvrdiPlacanjeStripe
}


//STRIPE_WEBHOOK_SECRET = 'whsec_b0692d4cdd5d7677dc5892bf5cb40c0932ca0eed6fbe5266cf5640e2baf6f579'