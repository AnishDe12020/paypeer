import { GetServerSideProps, NextPage } from "next";
import BaseLayout from "../../../src/layouts/BaseLayout";
import { prisma } from "../../../src/lib/db";
import { TransactionWithOrganization } from "../../../src/types/model";

interface PaySuccessPageProps {
  tx: TransactionWithOrganization;
}

const PaySuccessPage: NextPage = () => {
  return (
    <BaseLayout>
      <h1>Payment confirmed</h1>
    </BaseLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const tx = prisma.transaction.findUnique({
    where: {
      id: context.query.txId as string,
    },
    include: {
      organization: true,
    },
  });

  console.log(tx);

  return {
    props: {
      tx,
    },
  };
};

export default PaySuccessPage;
