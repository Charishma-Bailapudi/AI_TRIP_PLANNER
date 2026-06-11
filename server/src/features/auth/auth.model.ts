import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUserDocument extends Document {
  email: string;
  passwordHash: string;
  name: string;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Soft Delete pre-query middleware hooks
const excludeDeleted = function (this: mongoose.Query<unknown, unknown>): void {
  this.where({ isDeleted: { $ne: true } });
};

UserSchema.pre("find", excludeDeleted);
UserSchema.pre("findOne", excludeDeleted);
UserSchema.pre("findOneAndUpdate", excludeDeleted);
UserSchema.pre("countDocuments", excludeDeleted);

export const UserModel: Model<IUserDocument> = mongoose.model<IUserDocument>("User", UserSchema);
export default UserModel;
