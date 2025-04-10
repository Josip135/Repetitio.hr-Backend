import instruktorModel from "../models/instruktorModel.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import repeticijaModel from "../models/repeticijaModel.js"

const promijeniDostupnost = async (req, res) => {
  try {

    const { instId } = req.body

    const instData = await instruktorModel.findById(instId)

    await instruktorModel.findByIdAndUpdate(instId, { dostupnost: !instData.dostupnost })

    res.json({ success: true, message: 'Dostupnost promijenjena!' })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const listaInstruktora = async (req, res) => {
  try {

    const instruktori = await instruktorModel.find({}).select(['-lozinka', '-email'])
    res.json({ success: true, instruktori })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

//api za login instruktora
const loginInstruktor = async (req, res) => {

  try {
    const { email, lozinka } = req.body
    const instruktor = await instruktorModel.findOne({ email })

    if (!instruktor) {
      return res.json({ success: false, message: "Netočan ili nepostojeći email!" })
    }

    const poklapanje = await bcrypt.compare(lozinka, instruktor.lozinka)

    if (poklapanje) {
      const instrtoken = jwt.sign({ id: instruktor._id }, process.env.JWT_SECRET)
      res.json({ success: true, instrtoken })
    } else {
      return res.json({ success: false, message: "Netočna lozinka!" })
    }

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

//api za dobivanje svih termina za specifičnog instruktora
const instruktorTermini = async (req, res) => {
  try {

    const { instruktorId } = req.body
    console.log(instruktorId)
    const termini = await repeticijaModel.find({ instruktorId })

    res.json({ success: true, termini })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

//api za označit repeticije odrađenima
const repeticijeGotove = async (req, res) => {
  try {
    const { instruktorId, repeticijaId } = req.body

    const repeticijePodaci = await repeticijaModel.findById(repeticijaId)

    if (repeticijePodaci && repeticijePodaci.instruktorId === instruktorId) {
      await repeticijaModel.findByIdAndUpdate(repeticijaId, { odradeno: true, placeno: true })
      return res.json({ success: true, message: "Repeticije odrađene!" })
    } else {
      return res.json({ success: false, message: "Greška!" })
    }


  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

//api za otkazati repeticije
const repeticijeOtkazane = async (req, res) => {
  try {
    const { instruktorId, repeticijaId } = req.body

    const repeticijePodaci = await repeticijaModel.findById(repeticijaId)

    if (repeticijePodaci && repeticijePodaci.instruktorId === instruktorId) {
      await repeticijaModel.findByIdAndUpdate(repeticijaId, { otkazano: true })
      return res.json({ success: true, message: "Repeticije otkazane!" })
    } else {
      return res.json({ success: false, message: "Greška!" })
    }


  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

//api za dobivanje podataka za kontrolnu ploču
const instruktorKontrolnaPloca = async (req, res) => {
  try {
    const { instruktorId } = req.body

    const repeticije = await repeticijaModel.find({ instruktorId })


    let zarada = 0

    repeticije.map((repeticija) => {
      if (repeticija.odradeno || repeticija.placeno) {
        zarada += repeticija.cijena
      }
    })



    let ucenici = []

    repeticije.map((repeticija) => {
      if (!ucenici.includes(repeticija.korisnikId)) {
        ucenici.push(repeticija.korisnikId)
      }
    })



    const kontrolniPodaci = {
      zarada,
      termini: repeticije.length,
      ucenici: ucenici.length,
      najnoviji_termini: repeticije.reverse().slice(0, 5)
    }

    console.log("Kontrolni podaci: ", kontrolniPodaci)

    res.json({ success: true, kontrolniPodaci })


  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

//api za dobivanje instruktorovog profila 
const instruktorProfil = async (req, res) => {
  try {
    const { instruktorId } = req.body
    const profilPodaci = await instruktorModel.findById(instruktorId).select('-lozinka')

    res.json({ success: true, profilPodaci })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

//api za izmjenu instruktorovog profila
const izmjenaProfila = async (req, res) => {
  try {

    const { instruktorId, cijena_repeticija, adresa, dostupnost } = req.body

    await instruktorModel.findByIdAndUpdate(instruktorId, { cijena_repeticija, adresa, dostupnost })

    res.json({ success: true, message: "Profil izmijenjen!" })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

export {
  promijeniDostupnost, listaInstruktora, loginInstruktor,
  instruktorTermini, repeticijeGotove, repeticijeOtkazane,
  instruktorKontrolnaPloca, instruktorProfil, izmjenaProfila
}