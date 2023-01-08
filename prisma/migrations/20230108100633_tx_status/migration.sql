-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('SUCCESS', 'PENDING', 'FAILURE');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "status" "TransactionStatus" NOT NULL DEFAULT 'SUCCESS',
ALTER COLUMN "signature" DROP NOT NULL,
ALTER COLUMN "customerPubkey" DROP NOT NULL;
