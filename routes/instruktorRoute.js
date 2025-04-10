import express from 'express'
import { listaInstruktora, loginInstruktor, instruktorTermini, repeticijeGotove, repeticijeOtkazane, instruktorKontrolnaPloca, instruktorProfil, izmjenaProfila } from '../controllers/instruktorController.js'
import authInstruktor from '../middleware/authInstruktor.js'

const instruktorRouter = express.Router()

instruktorRouter.get('/lista', listaInstruktora)

instruktorRouter.post('/login', loginInstruktor)

instruktorRouter.get('/termini', authInstruktor, instruktorTermini)

instruktorRouter.post('/odradene_repeticije', authInstruktor, repeticijeGotove)
instruktorRouter.post('/otkazi_repeticije', authInstruktor, repeticijeOtkazane)

instruktorRouter.get('/kontrolna_ploca', authInstruktor, instruktorKontrolnaPloca)
instruktorRouter.get('/profil', authInstruktor, instruktorProfil)

instruktorRouter.post('/izmjena_profila', authInstruktor, izmjenaProfila)

export default instruktorRouter;