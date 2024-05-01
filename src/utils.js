import { fileURLToPath } from "url"
import { dirname } from "path"
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

//clave para firmar token JWT
const JWT_SECRET = "practica-integradora"

//hasheo pwd
export const createHash = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(10))

//validar pwd
export const isValidPassword = (user, password) => {
    return bcrypt.compareSync(password, user.password)
}

//generar token jwt
export const generateToken = (email) => {
    return jwt.sign({email}, JWT_SECRET, {expiresIn: "1h"})
}

export default __dirname