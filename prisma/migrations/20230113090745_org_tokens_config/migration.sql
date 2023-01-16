-- CreateEnum
CREATE TYPE "AcceptedTokenTypes" AS ENUM ('ONLY', 'SOME', 'ANY');

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "acceptedTokens" "AcceptedTokenTypes" NOT NULL DEFAULT 'ONLY',
ADD COLUMN     "tokenPubkeys" TEXT[];
