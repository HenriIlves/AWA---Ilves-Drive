import {Request, Response, NextFunction} from "express"
import jwt, {JwtPayload} from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

// Extend Express Request so req.user is available in route handlers after validation
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

// Verifies the Bearer token and attaches the decoded payload to req.user
export const validateToken = (req: Request, res: Response, next: NextFunction) => {
    const token: string | undefined = req.header('authorization')?.split(" ")[1]

    if(!token) return res.status(401).json({message: "Token not found."})

    try {
        const verified: JwtPayload = jwt.verify(token, process.env.SECRET as string) as JwtPayload
        req.user = verified
        next()

    } catch {
        return res.status(401).json({message: "Token not found."})
    }
}

// Same as validateToken but also requires isAdmin on the payload
export const validateAdmin = (req: Request, res: Response, next: NextFunction) => {
    const token: string | undefined = req.header('authorization')?.split(" ")[1]

    if(!token) return res.status(403).json({message: "Access denied."})

    try {
        const verified: JwtPayload = jwt.verify(token, process.env.SECRET as string) as JwtPayload
        req.user = verified

        if (!verified.isAdmin) return res.status(403).json({message: "Access denied."})

        next()

    } catch {
        return res.status(403).json({message: "Access denied."})
    }
}
