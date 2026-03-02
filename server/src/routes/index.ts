import { Request, Response, Router } from 'express'
import { body, Result, ValidationError, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import { User, IUser } from '../models/User'
import { Document, IDocument } from "../models/Document"
import jwt, { JwtPayload } from 'jsonwebtoken'
import { validateToken } from '../middleware/validateToken'
import { registerValidation, loginValidation } from '../validators/inputValidation'
import { createDocumentValidation, deleteDocumentValidation, updateDocumentValidation, grantPermissionValidation, removePermissionValidation } from "../validators/documentValidation"
import { upload } from '../middleware/upload'
import path from 'path'
import fs from 'fs'

const router: Router = Router()

// Returns true and sends a 400 response if the request has validation errors
const handleValidationErrors = (req: Request, res: Response): boolean => {
    const errors: Result<ValidationError> = validationResult(req)
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return true
    }
    return false
}

// ─── User routes ─────────────────────────────────────────────────────────────

// Register a new user — hashes the password before storing
router.post("/api/user/register",
    registerValidation,
    async (req: Request, res: Response) => {
        if (handleValidationErrors(req, res)) return;

        try {
            const existingUser: IUser | null = await User.findOne({email: req.body.email})
            console.log(existingUser)
            if (existingUser) {
                return res.status(403).json({email: "email already in use"})
            }

            const salt: string = bcrypt.genSaltSync(10)
            const hash: string = bcrypt.hashSync(req.body.password, salt)

            const newUser = await User.create({
                email: req.body.email,
                username: req.body.username,
                password: hash,
                profilePicture: ""
            })

            return res.json(newUser)

        } catch (error: unknown) {
            console.error(`Error during registration: ${error}`)
            return res.status(500).json({error: "Internal Server Error"})
        }
    }
)

// Login — returns a signed JWT on success
router.post("/api/user/login",
    loginValidation,
    async (req: Request, res: Response) => {
        if (handleValidationErrors(req, res)) return;

        try {
            const user: IUser | null = await User.findOne({email: req.body.email})

            if (!user) {
                return res.status(404).json({message: "Invalid email"})
            }

            if (bcrypt.compareSync(req.body.password, user.password as string)) {
                const jwtPayload: JwtPayload = {
                    id: user._id,
                    username: user.username,
                }
                const token: string = jwt.sign(jwtPayload, process.env.SECRET as string, { expiresIn: "1h"})

                return res.status(200).json({
                    success: true,
                    token,
                    user: {
                        id: user._id,
                        username: user.username,
                        email: user.email,
                        profilePicture: user.profilePicture
                    }
                })
            }
            return res.status(401).json({message: "Wrong password"})

        } catch(error: unknown) {
            console.error(`Error during user login: ${error}`)
            return res.status(500).json({ error: 'Internal Server Error' })
        }
    }
)

// Get user profile (password excluded from the response)
router.get("/api/user/profile", validateToken, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id

        const user = await User.findById(userId).select('-password')

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture
            }
        })
    } catch (error: unknown) {
        console.error("Error fetching user profile:", error)
        return res.status(500).json({ error: "Internal Server Error" })
    }
})

// Upload/Update profile picture — deletes the old file if one exists
router.post("/api/user/profile-picture",
    validateToken,
    upload.single('profilePicture'),
    async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id

            if (!req.file) {
                return res.status(400).json({ error: "No file uploaded" })
            }

            const user = await User.findById(userId)

            if (!user) {
                return res.status(404).json({ error: "User not found" })
            }

            // Delete old profile picture if it exists
            if (user.profilePicture) {
                const oldPath = path.join(__dirname, '..', user.profilePicture)
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath)
                }
            }

            // Save new profile picture path (relative path)
            const profilePicturePath = `/uploads/profile-pictures/${req.file.filename}`
            user.profilePicture = profilePicturePath
            await user.save()

            return res.status(200).json({
                success: true,
                message: "Profile picture updated successfully",
                profilePicture: profilePicturePath
            })
        } catch (error: unknown) {
            console.error("Error uploading profile picture:", error)
            return res.status(500).json({ error: "Internal Server Error" })
        }
    }
)

// Delete profile picture — removes the file from disk and clears the field
router.delete("/api/user/profile-picture", validateToken, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id

        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        if (user.profilePicture) {
            const filePath = path.join(__dirname, '..', user.profilePicture)
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
            }
            user.profilePicture = ""
            await user.save()
        }

        return res.status(200).json({
            success: true,
            message: "Profile picture deleted successfully"
        })
    } catch (error: unknown) {
        console.error("Error deleting profile picture:", error)
        return res.status(500).json({ error: "Internal Server Error" })
    }
})

// ─── Document routes ──────────────────────────────────────────────────────────

// Create a new document owned by the authenticated user
router.post("/api/document",
    validateToken,
    createDocumentValidation,
    async (req: Request, res: Response) => {
        if (handleValidationErrors(req, res)) return

        try {
            const { title, content = "" } = req.body;
            const userId = req.user?.id;
            const username = req.user?.username;

            const newDocument = await Document.create({
                title,
                content,
                ownerId: userId,
                ownerUsername: username
            })

            return res.status(201).json({
                success: true,
                document: newDocument,
            })
        } catch (error: unknown) {
            console.error("Error creating document:", error)
            return res.status(500).json({ error: "Internal Server Error" })
        }
    }
)

// Get all documents the user owns or has any permission on (content excluded for performance)
router.get("/api/documents", validateToken, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id

        const documents = await Document.find({
            $or: [
                { ownerId: userId },
                { "permissions.userId": userId },
            ],
        }).select("-content")

        return res.status(200).json({
            success: true,
            documents,
        })
    } catch (error: unknown) {
        console.error("Error fetching documents:", error);
        return res.status(500).json({ error: "Internal Server Error" })
    }
})

// Get a single document — accessible to owner and any permissioned user
router.get("/api/document/:documentId", validateToken,
    async (req: Request, res: Response) => {
        try {
            const { documentId } = req.params
            const userId = req.user?.id

            const document = await Document.findById(documentId)

            if (!document) {
                return res.status(404).json({ error: "Document not found" })
            }

            const isOwner = document.ownerId.toString() === userId;
            const hasPermission = document.permissions.some(
                (p) => p.userId.toString() === userId
            );

            if (!isOwner && !hasPermission) {
                return res.status(403).json({
                error: "You do not have permission to view this document",
                });
            }

            return res.status(200).json({
                success: true,
                document,
            })
        } catch (error: unknown) {
            console.error("Error fetching document:", error)
            return res.status(500).json({ error: "Internal Server Error" })
        }
    }
)

// Delete a document — only the owner can do this
router.delete("/api/document/:documentId", validateToken, deleteDocumentValidation,
    async (req: Request, res: Response) => {
        if (handleValidationErrors(req, res)) return

        try {
            const { documentId } = req.params
            const userId = req.user?.id

            const document = await Document.findById(documentId)

            if (!document) {
                return res.status(404).json({ error: "Document not found" })
            }

            if (document.ownerId.toString() !== userId) {
                return res.status(403).json({
                    error: "Only the owner can delete this document",
                })
            }

            await Document.findByIdAndDelete(documentId)

            return res.status(200).json({
                success: true,
                message: "Document deleted successfully",
            })
        } catch (error: unknown) {
            console.error("Error deleting document:", error);
            return res.status(500).json({ error: "Internal Server Error" })
        }
    }
)

// Update document title and/or content — owner or users with edit permission
router.put("/api/document/:documentId", validateToken, updateDocumentValidation,
    async (req: Request, res: Response) => {
        if (handleValidationErrors(req, res)) return

        try {
            const { documentId } = req.params
            const { title, content } = req.body
            const userId = req.user?.id
            const username = req.user?.username

            const document = await Document.findById(documentId)

            if (!document) {
                return res.status(404).json({ error: "Document not found" })
            }

            // Check permissions: must be owner or have edit permission
            const isOwner = document.ownerId.toString() === userId;
            const hasEditPermission = document.permissions.some((p) => p.userId.toString() === userId && p.type === "edit")

            if (!isOwner && !hasEditPermission) {
                return res.status(403).json({ error: "You do not have permission to edit this document" })
            }

            if (title !== undefined) document.title = title
            if (content !== undefined) document.content = content
            document.lastEditedAt = new Date()

            const updatedDocument = await document.save()

            return res.status(200).json({
                success: true,
                document: updatedDocument,
            })
        } catch (error: unknown) {
            console.error("Error updating document:", error)
            return res.status(500).json({ error: "Internal Server Error" })
        }
    }
)

// ─── Permission routes ────────────────────────────────────────────────────────

// Grant (or update) a permission for another user — owner only
router.post("/api/document/:documentId/permissions", validateToken, grantPermissionValidation,
    async (req: Request, res: Response) => {
        if (handleValidationErrors(req, res)) return;

        try {
            const { documentId } = req.params
            const { username, permissionType } = req.body
            const ownerId = req.user?.id

            const document = await Document.findById(documentId)

            if (!document) {
                return res.status(404).json({ error: "Document not found" })
            }

            if (document.ownerId.toString() !== ownerId) {
                return res.status(403).json({ error: "Only the owner can grant permissions" })
            }

            const userToGrant = await User.findOne({ username })

            if (!userToGrant) {
                return res.status(404).json({ error: "User not found" })
            }

            // Update existing permission if the user already has one, otherwise add a new entry
            const existingPermission = document.permissions.find(
                (p) => p.userId.toString() === userToGrant._id.toString()
            )

            if (existingPermission) {
                existingPermission.type = permissionType;
            } else {
                document.permissions.push({
                    userId: userToGrant._id,
                    username: userToGrant.username,
                    type: permissionType,
                })
            }

            const updatedDocument = await document.save();

            return res.status(200).json({
                success: true,
                message: `Permission granted to ${username}`,
                document: updatedDocument,
            })
        } catch (error: unknown) {
            console.error("Error granting permission:", error)
            return res.status(500).json({ error: "Internal Server Error" })
        }
    }
)

// Remove a user's permission from a document — owner only
router.delete("/api/document/:documentId/permissions", validateToken, removePermissionValidation,
    async (req: Request, res: Response) => {
        if (handleValidationErrors(req, res)) return

        try {
            const { documentId } = req.params
            const { userId } = req.body
            const ownerId = req.user?.id

            const document = await Document.findById(documentId)

            if (!document) {
                return res.status(404).json({ error: "Document not found" })
            }

            if (document.ownerId.toString() !== ownerId) {
                return res.status(403).json({ error: "Only the owner can remove permissions" })
            }

            document.permissions = document.permissions.filter(
                (p) => p.userId.toString() !== userId
            )

            const updatedDocument = await document.save()

            return res.status(200).json({
                success: true,
                message: "Permission removed",
                document: updatedDocument,
            })
        } catch (error: unknown) {
            console.error("Error removing permission:", error)
            return res.status(500).json({ error: "Internal Server Error" })
        }
    }
)

// Get all permissions for a document — owner only
router.get("/api/document/:documentId/permissions", validateToken, async (req: Request, res: Response) => {
    try {
        const { documentId } = req.params
        const userId = req.user?.id

        const document = await Document.findById(documentId)

        if (!document) {
            return res.status(404).json({ error: "Document not found" })
        }

        if (document.ownerId.toString() !== userId) {
            return res.status(403).json({ error: "Only the owner can view permissions" })
        }

        return res.status(200).json({
            success: true,
            permissions: document.permissions,
        })
    } catch (error: unknown) {
        console.error("Error fetching permissions:", error)
        return res.status(500).json({ error: "Internal Server Error" })
    }
})

// ─── Public link routes ───────────────────────────────────────────────────────

// Enable public read-only link for a document — owner only
router.post("/api/document/:documentId/public-link", validateToken, async (req: Request, res: Response) => {
    try {
        const { documentId } = req.params
        const userId = req.user?.id

        const document = await Document.findById(documentId)

        if (!document) {
            return res.status(404).json({ error: "Document not found" })
        }

        if (document.ownerId.toString() !== userId) {
            return res.status(403).json({ error: "Only the owner can manage the public link" })
        }

        document.isPublicReadOnly = true
        await document.save()

        return res.status(200).json({ success: true, isPublicReadOnly: true })
    } catch (error: unknown) {
        console.error("Error enabling public link:", error)
        return res.status(500).json({ error: "Internal Server Error" })
    }
})

// Disable public read-only link for a document — owner only
router.delete("/api/document/:documentId/public-link", validateToken, async (req: Request, res: Response) => {
    try {
        const { documentId } = req.params
        const userId = req.user?.id

        const document = await Document.findById(documentId)

        if (!document) {
            return res.status(404).json({ error: "Document not found" })
        }

        if (document.ownerId.toString() !== userId) {
            return res.status(403).json({ error: "Only the owner can manage the public link" })
        }

        document.isPublicReadOnly = false
        await document.save()

        return res.status(200).json({ success: true, isPublicReadOnly: false })
    } catch (error: unknown) {
        console.error("Error disabling public link:", error)
        return res.status(500).json({ error: "Internal Server Error" })
    }
})

// ─── Edit lock routes ─────────────────────────────────────────────────────────

// Acquire the edit lock — returns 423 if another user holds a fresh lock
router.post("/api/document/:documentId/lock", validateToken, async (req: Request, res: Response) => {
    try {
        const { documentId } = req.params
        const userId = req.user?.id
        const username = req.user?.username

        const document = await Document.findById(documentId)

        if (!document) {
            return res.status(404).json({ error: "Document not found" })
        }

        const isOwner = document.ownerId.toString() === userId
        const hasEditPermission = document.permissions.some(
            (p) => p.userId.toString() === userId && p.type === "edit"
        )

        if (!isOwner && !hasEditPermission) {
            return res.status(403).json({ error: "You do not have permission to edit this document" })
        }

        const LOCK_EXPIRY_MS = 30 * 60 * 1000 // 30 minutes
        const now = new Date()
        // A lock with no timestamp or one older than 30 min is considered stale
        const isStale = document.editingStartedAt
            ? now.getTime() - document.editingStartedAt.getTime() > LOCK_EXPIRY_MS
            : true

        if (document.currentEditor && document.currentEditor.toString() !== userId && !isStale) {
            return res.status(423).json({
                error: "Document is currently being edited",
                currentEditorUsername: document.currentEditorUsername,
            })
        }

        document.currentEditor = new mongoose.Types.ObjectId(userId!)
        document.currentEditorUsername = username
        document.editingStartedAt = now
        await document.save()

        return res.status(200).json({ success: true })
    } catch (error: unknown) {
        console.error("Error acquiring lock:", error)
        return res.status(500).json({ error: "Internal Server Error" })
    }
})

// Release the edit lock — idempotent, only clears if the requester holds the lock
router.delete("/api/document/:documentId/lock", validateToken, async (req: Request, res: Response) => {
    try {
        const { documentId } = req.params
        const userId = req.user?.id

        const document = await Document.findById(documentId)

        if (!document) {
            return res.status(200).json({ success: true })
        }

        if (document.currentEditor && document.currentEditor.toString() === userId) {
            document.currentEditor = undefined
            document.currentEditorUsername = undefined
            document.editingStartedAt = undefined
            await document.save()
        }

        return res.status(200).json({ success: true })
    } catch (error: unknown) {
        console.error("Error releasing lock:", error)
        return res.status(500).json({ error: "Internal Server Error" })
    }
})

// ─── Public document route (no auth required) ─────────────────────────────────

// Returns a limited view of a document if its public link is enabled
router.get("/api/public/:documentId", async (req: Request, res: Response) => {
    try {
        const { documentId } = req.params

        const document = await Document.findById(documentId)

        if (!document || !document.isPublicReadOnly) {
            return res.status(404).json({ error: "Document not found" })
        }

        return res.status(200).json({
            _id: document._id,
            title: document.title,
            content: document.content,
            ownerUsername: document.ownerUsername,
            lastEditedAt: document.lastEditedAt,
        })
    } catch (error: unknown) {
        console.error("Error fetching public document:", error)
        return res.status(500).json({ error: "Internal Server Error" })
    }
})


export default router
