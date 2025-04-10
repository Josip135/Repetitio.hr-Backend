import express from 'express'
import { registracijaKorisnika, loginKorisnika, getProfilKorisnika, izmijeniProfil, bookirajRepeticije, listaRepeticija, otkaziRepeticije, placanjeRepeticijaStripe, potvrdiPlacanjeStripe } from '../controllers/korisnikController.js';
import authKorisnik from '../middleware/authKorisnik.js';
import upload from '../middleware/multer.js';
import bodyParser from 'body-parser';

const korisnikRouter = express.Router()

korisnikRouter.post('/registracija', registracijaKorisnika)
korisnikRouter.post('/login', loginKorisnika)

korisnikRouter.get('/get_profil', authKorisnik, getProfilKorisnika)

korisnikRouter.post('/izmijeni_profil', upload.single('slika'), authKorisnik, izmijeniProfil)
korisnikRouter.post('/bookiraj_repeticije', authKorisnik, bookirajRepeticije)

korisnikRouter.get('/repeticije', authKorisnik, listaRepeticija)

korisnikRouter.post('/otkazi_repeticije', authKorisnik, otkaziRepeticije)

korisnikRouter.post('/placanje_repeticija', authKorisnik, placanjeRepeticijaStripe)
korisnikRouter.post('/stripe-webhook', bodyParser.raw({ type: "application/json" }), potvrdiPlacanjeStripe)

export default korisnikRouter;