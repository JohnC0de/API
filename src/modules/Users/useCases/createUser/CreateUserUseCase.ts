import { hash } from "bcryptjs";
import { SignJWT } from "jose";
import { z } from "zod";

import { HTTP } from "~/shared/services/http";
import { UserModel } from "~/shared/models/User";
import type { UserRepository } from "../../repository/UserRepository";
import { sendMail } from "~/shared/services/mail";
import { env } from "~/env";

class CreateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  validate(body: any) {
    const schema = z.object({
      name: z.string({ required_error: "Name is required" }),
      mail: z
        .string({ required_error: "Mail is required" })
        .email("Invalid email"),
      password: z
        .string()
        .min(6, "Password must be at least 6 characters long"),
    });

    return schema.safeParse(body);
  }

  async generateVerifyToken(user: UserModel) {
    const alg = "HS256";
    const secret = new TextEncoder().encode(env.JWT_VERIFY_KEY);
    const token = await new SignJWT({ id: user.id })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setIssuer("urn:example:issuer")
      .setAudience("urn:example:audience")
      .setExpirationTime("1y")
      .sign(secret);

    return token;
  }

  async sendVerifyEmail(user: UserModel) {
    const token = await this.generateVerifyToken(user);
    await sendMail({
      to: user.mail,
      subject: "Validate your account",
      text: "Verify your account",
      html: `<a href="http://localhost:3000/verify?token=${token}">Verify your account</a>`,
    });
  }

  async execute(body: any) {
    const data = this.validate(body);
    if (!data.success) return HTTP(400, { ...data, message: "Invalid data" });
    const { mail, name, password } = data.data;

    const userExists = await this.userRepository.findByMail(mail);
    if (userExists) return HTTP(400, { message: "User already exists" });

    const passwordHash = await hash(password, 8);
    const user = new UserModel({ name, mail, password: passwordHash });

    try {
      await this.userRepository.createUser(user);
      await this.sendVerifyEmail(user);
      return HTTP(201, {
        message: "User created successfully! Verify your email",
      });
    } catch (error) {
      return HTTP(500, { message: "Internal server error", error });
    }
  }
}

export { CreateUserUseCase };
