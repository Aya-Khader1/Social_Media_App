import { Request, Response } from "express";
import { ISignUpDTO, IConfirmEmailDTO, ILoginDTO } from "./auth.dto";
import { UserModel } from "../../DB/Models/user.model";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../Utils/response/error.response";
import { compareHash, generateHash } from "../../Utils/security/hash";
import { createLoginCredentials } from "../../Utils/security/token";
import { generateOTP } from "../../Utils/generateOTP";
import { emailEvents } from "../../Utils/events/email.events";
class AuthService {
  constructor() {}
  signup = async (req: Request, res: Response): Promise<Response> => {
    const { username, email, password, phone }: ISignUpDTO = req.body;
    const checkUserExists = await UserModel.findOne({ email }).select("email");
    if (checkUserExists) throw new ConflictException("User already exists");
    const otp = await generateOTP();
    const [user] = await UserModel.create(
      [
        {
          username,
          email,
          password,
          phone,
          confirmEmailOTP: await generateHash(otp),
        },
      ],
      { validateBeforeSave: true },
    );
    emailEvents.emit("confirmEmail", { to: email, otp, username });

    return res.status(201).json({ message: "Done", user });
  };
  confirmEmail = async (req: Request, res: Response): Promise<Response> => {
    const { email, otp }: IConfirmEmailDTO = req.body;
    const user = await UserModel.findOne({
      email,
      confirmEmailOTP: { $exists: true },
      confirmAt: { $exists: false },
    });

    if (!user || !user.confirmEmailOTP)
      throw new NotFoundException("Invalid Account");

    if (!(await compareHash(otp, user.confirmEmailOTP)))
      throw new BadRequestException("Invalid OTP");
    await UserModel.updateOne(
      {
        email,
      },
      {
        confirmAt: Date.now(),
        $unset: { confirmEmailOTP: true },
        $inc: { __v: 1 },
      },
    );
    return res.status(201).json({ message: "User Confirmed Successfully" });
  };
  login = async (req: Request, res: Response): Promise<Response> => {
    const { email, password }: ILoginDTO = req.body;
    const user = await UserModel.findOne({
      email,
      confirmAt: { $exists: true },
    });

    if (!user) throw new NotFoundException("Invalid Account");

    if (!(await compareHash(password, user.password)))
      throw new BadRequestException("Invalid Password");

    const credentials = createLoginCredentials(user);

    return res.status(201).json({ message: "Done", credentials });
  };
}

export default new AuthService();
