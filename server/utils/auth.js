import jwt from 'jsonwebtoken'

export function createSession({object}){
    const token = jwt.sign(
        object,
        process.env.AUTH_SECRET_KEY,
        {
        expiresIn: '7d'
        }
    )
    return token
}

export function verifySession({object}){
    const token = jwt.verify(object.split(' ')[1], process.env.AUTH_SECRET_KEY)
    req.user = token;
}