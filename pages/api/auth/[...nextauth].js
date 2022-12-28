import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import nacl from "tweetnacl";
import bs58 from "bs58";

const nextAuthOptions = (req, res) => {
  return {
    providers: [
      CredentialsProvider({
        async authorize(credentials) {
          const nonce = req.cookies["auth-nonce"];

          const message = `Sign this message for authenticating with your wallet. Nonce: ${nonce}`;
          const messageBytes = new TextEncoder().encode(message);

          const publicKeyBytes = bs58.decode(credentials.publicKey);
          const signatureBytes = bs58.decode(credentials.signature);

          const result = nacl.sign.detached.verify(
            messageBytes,
            signatureBytes,
            publicKeyBytes
          );

          if (!result) {
            console.log(`authentication failed`);
            throw new Error("user can not be authenticated");
          }

          const user = { name: credentials.publicKey };

          return user;
        },
      }),
    ],
  };
};

const handler = (req, res) => {
  return NextAuth(req, res, nextAuthOptions(req, res));
};

export default handler;
