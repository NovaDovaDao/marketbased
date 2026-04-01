import { prisma } from "@/app/lib/prisma";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { generateRandomString } from "better-auth/crypto";
import { emailOTP, siwe } from "better-auth/plugins";
import { Resend } from "resend";
import { createPublicClient, http } from "viem";
import { base, mainnet } from "viem/chains";

// Used for EIP-1271 / contract wallet signature verification on Base
const baseClient = createPublicClient({
  chain: base,
  transport: http(),
});

// Used for ENS name/avatar lookups (ENS lives on Ethereum mainnet, not Base)
const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export const auth = betterAuth({
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
        const resend = new Resend(process.env.RESEND_API_KEY);
        const subject =
          type === "sign-in" ? "Your Market Base sign-in code" : "Verify your email";
        await resend.emails.send({
          from: "Market Base <noreply@marketbase.gg>",
          to: email,
          subject,
          html: `<p>Your verification code is: <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p>`,
        });
      },
    }),
    siwe({
      domain: process.env.BETTER_AUTH_URL
        ? new URL(process.env.BETTER_AUTH_URL).host
        : "localhost:3000",
      anonymous: true,
      getNonce: async () => {
        return generateRandomString(32, "a-z", "A-Z", "0-9");
      },

      verifyMessage: async ({ message, signature, address }) => {
        try {
          // baseClient.verifyMessage handles both EOA (ECDSA) and
          // contract wallets like Coinbase Smart Wallet (EIP-1271)
          return await baseClient.verifyMessage({
            address: address as `0x${string}`,
            message,
            signature: signature as `0x${string}`,
          });
        } catch (error) {
          console.error("SIWE verification failed:", error);
          return false;
        }
      },
      ensLookup: async ({ walletAddress }) => {
        try {
          // ENS is on Ethereum mainnet — use mainnetClient, not baseClient
          const ensName = await mainnetClient.getEnsName({
            address: walletAddress as `0x${string}`,
          });
          const ensAvatar = ensName
            ? await mainnetClient.getEnsAvatar({
              name: ensName,
            })
            : null;
          return {
            name: ensName || walletAddress,
            avatar: ensAvatar || "",
          };
        } catch {
          return {
            name: walletAddress,
            avatar: "",
          };
        }
      },
    })
  ]
});
