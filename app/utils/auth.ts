import { prisma } from "@/app/lib/prisma";
import { env } from "@/env.mjs";
import { dash } from "@better-auth/infra";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { generateRandomString } from "better-auth/crypto";
import { admin, emailOTP } from "better-auth/plugins";
import { Resend } from "resend";

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    additionalFields: {
      username: {
        type: "string",
        required: false,
        input: false,
      },
      usernameUpdatedAt: {
        type: "date",
        required: false,
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const base = (user.name ?? user.email?.split("@")[0] ?? "user")
            .toLowerCase()
            .replace(/\s+/g, "_")
            .replace(/[^a-z0-9_]/g, "")
            .slice(0, 20) || "user"

          let username = base
          try {
            let n = 1
            while (await prisma.user.findUnique({ where: { username } })) {
              username = `${base}${n++}`
            }
          } catch {
            // DB not ready (first migration); fall back to suffixed name
            username = `${base}_${generateRandomString(4, "0-9")}`
          }

          return { data: { ...user, username } }
        },
      },
    },
  },
  socialProviders: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    },
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (process.env.NODE_ENV !== "production") {
          console.log(`[emailOTP] OTP for ${email}: ${otp}`);
          return;
        }
        const resend = new Resend(process.env.RESEND_API_KEY);
        const subject =
          type === "sign-in" ? "Your Market Base sign-in code" : "Verify your email";
        const { error } = await resend.emails.send({
          from: "Market Base <onboarding@resend.dev>",
          to: email,
          subject,
          html: `<p>Your verification code is: <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p>`,
        });
        if (error) {
          console.error("[emailOTP] Resend error:", error);
          throw new Error(error.message);
        }
      },
    }),
    admin(),
    dash({
      apiKey: env.BETTER_AUTH_API_KEY,
    }),
  ]
});
