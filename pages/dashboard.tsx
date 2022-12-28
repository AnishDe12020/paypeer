import { GetServerSideProps, NextPage } from "next";
import DashboardLayout from "../src/layouts/DashboardLayout";
import { Text } from "@chakra-ui/react";
import { authOptions } from "./api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { prisma } from "../src/lib/db";
import { Organization } from "@prisma/client";

interface DashboardPageProps {
  orgs: Organization[];
}

const DashboardPage: NextPage<DashboardPageProps> = ({ orgs }) => {
  return (
    <DashboardLayout orgs={orgs}>
      <Text>test</Text>
    </DashboardLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions(context.req)
  );

  console.log(session);

  if (!session?.user?.name) {
    return {
      redirect: {
        destination: "/auth",
        permanent: false,
      },
    };
  }

  const orgs = await prisma.organization.findMany({
    where: {
      members: {
        some: {
          profile: {
            pubkey: session.user.name,
          },
        },
      },
    },
  });

  return {
    props: { orgs: JSON.parse(JSON.stringify(orgs)) },
  };
};

export default DashboardPage;
