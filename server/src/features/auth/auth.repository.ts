import { UserModel, IUserDocument } from "./auth.model";

export class AuthRepository {
  public async findByEmail(email: string): Promise<IUserDocument | null> {
    // Normal query, filters out isDeleted via pre-hooks
    return await UserModel.findOne({ email: email.toLowerCase() });
  }

  public async findById(id: string): Promise<IUserDocument | null> {
    return await UserModel.findById(id);
  }

  public async createUser(data: {
    email: string;
    passwordHash: string;
    name: string;
  }): Promise<IUserDocument> {
    const user = new UserModel({
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      name: data.name,
    });
    return await user.save();
  }

  public async updateUser(
    id: string,
    update: Partial<IUserDocument>,
  ): Promise<IUserDocument | null> {
    return await UserModel.findByIdAndUpdate(id, update, { new: true });
  }
}
export default AuthRepository;
