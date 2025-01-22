import { Schema, model, models } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  image?: string;
  provider?: string;
  providerId?: string;
  password?: string;
  isAdmin: boolean;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, "Name is Required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
  },
  image: String,
  provider: String,
  providerId: String,
  password: String,
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password!, 10);
  next();
});

userSchema.methods.isPasswrodCorrect = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

const User = models.User || model("User", userSchema);

export default User;
