import express from 'express'
import { dodajInstruktora, loginAdmin, sviInstruktori, sviTermini, otkaziRepeticijeAdmin, adminKontrolnaPloca } from '../controllers/adminController.js'
import upload from '../middleware/multer.js'
import authAdmin from '../middleware/authAdmin.js'
import { promijeniDostupnost } from '../controllers/instruktorController.js'

const adminRouter = express.Router()

adminRouter.post('/dodaj_instruktora', authAdmin, upload.single('slika'), dodajInstruktora)

adminRouter.post('/login_admin', loginAdmin)

adminRouter.post('/lista_instruktora', authAdmin, sviInstruktori)

adminRouter.post('/promijeni_dostupnost', authAdmin, promijeniDostupnost)

adminRouter.get('/svi_termini', authAdmin, sviTermini)

adminRouter.post('/otkazi_repeticije', authAdmin, otkaziRepeticijeAdmin)

adminRouter.get('/kontrolna_ploca', authAdmin, adminKontrolnaPloca)

export default adminRouter;