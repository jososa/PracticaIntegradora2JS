import passport from "passport";
//import jwt from "passport-jwt";
import local from "passport-local"
import GitHubStrategy from "passport-github2"
import usersModel from "../dao/models/usersModel.js"
import CartManager from "../dao/controllers/mongoDB/cartManagerMongo.js";
import {createHash, isValidPassword} from "../utils.js"

const LocalStrategy = local.Strategy

//const JWTStrategy = jwt.Strategy;
//const ExtractJWT = jwt.ExtractJwt;

const initializePassport = () => {

    //Estategia registro usuario
    passport.use("register", new LocalStrategy(
        { passReqToCallback:true, usernameField: "email" },
    async(req, username, password, done) => {
        const { first_name, last_name, email, age } = req.body
        try {
            const user = await usersModel.findOne({ email: username })
            if(user){
                console.log("El usuario ya se encuentra registrado")
                return done(null, false)
            }

            const carrito = new CartManager()
            const cart = await carrito.createCart()

            const newUser = {
                first_name,
                last_name,
                email,
                age,
                password: createHash(password),
                cart: cart,
                role: "usuario"
            }
            const result = await usersModel.create(newUser)
            return done(null, result)
        } catch (error) {
            return done(error)
        }
    } ))


    //Estrategia de login
    passport.use(
        "login",
        new LocalStrategy(
          { usernameField: "email" },
          async (username, password, done) => {
            try {
              if (
                username === "adminCoder@coder.com" &&
                password === "adminCod3r123"
              ) {
                // Si las credenciales coinciden con el administrador predefinido creo un objeto con el los datos del administrador.
                const adminUser = {
                  first_name: "Admin",
                  last_name: "Coder",
                  email: "adminCoder@coder.com",
                  age: 30,
                  role: "admin",
                };
                return done(null, adminUser);
              }
    
              const user = await usersModel.findOne({ email: username });
              if (!user) return done(null, false);
              const valid = isValidPassword(user, password);
              if (!valid) return done(null, false);
    
              return done(null, user);
            } catch (error) {
              return done(error);
            }
          }
        )
      )

    //Login con github
    passport.use("github", new GitHubStrategy({
        clientID: "Iv1.17076b57af2af99d",
        clientSecret: "aefeb76ab4e023adbb0544d033557a15fe841997",
        callBackURL: "http://localhost:8080/api/sessions/githubcallback"
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const user = await usersModel.findOne({ email: profile._json.email })
            if(!user){
                const newUser = {
                    first_name: profile._json.name,
                    last_name: "",
                    age: 33,
                    email: profile._json.email,
                    password: "",
                    role: "usuario"
                }
                let createdUser = await usersModel.create(newUser)
                done(null, createdUser)
            } else{
                done(null, user)
            }
        } catch (error) {
            return done(error)
        }
    }))

    passport.serializeUser((user, done) => {
        if(user._id){
            done(null, user._id)
        } else{
            done(null,"admin")
        }
    })

    passport.deserializeUser(async (id, done) => {
        try {
            if(id === "admin"){
                const adminUser = {
                    first_name: "Admin",
                    last_name: "Coder",
                    email: "adminCoder@coder.com",
                    age: 33,
                    role: "admin"
                }
                done(null, adminUser)
            } else{
                let user = await usersModel.findById(id)
                done(null, user)
            }
        } catch (error) {
            done(error)
        }
    })

    // //funcion que extrae las cookies
    // const cookieExtractor = (req) => {
    //     //logica a implementar
    //     let token=null
    //     if(req && req.cookies){
    //         token = req.cookies["practica-integradora"]
    //     }
    //     return token
    // }

    // //Estategia para jwt
    // passport.use('jwt', new JWTStrategy(
    //     {
    //         jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
    //         secretOrKey: 'practica-integradora'
    //     },
    //     async(jwt_payload, done) => {
    //         try {
    //             return done(null, jwt_payload)
    //         } catch (error) {
    //             return done(error)
    //         }
    //     }
    // ))

}

export default initializePassport
