import { Response, Request } from "express";

class User {
  getProfile = async (req: Request, res: Response): Promise<Response> => {
    const { user } = req;

    return res.status(201).json({ message: "login", user });
  };
}
export default new User();
