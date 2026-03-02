import mongoose, { Document, Schema } from "mongoose"

// Represents a registered user in the database
interface IUser extends Document {
    email: string
    username: string
    password: string       // bcrypt hash, never stored as plaintext
    profilePicture?: string // relative server path, e.g. /uploads/profile-pictures/...
}

const UserSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: "" }
})

const User: mongoose.Model<IUser> = mongoose.model<IUser>("User", UserSchema)

export { User, IUser }
