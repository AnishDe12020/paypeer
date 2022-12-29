import { GetServerSideProps, NextPage } from "next";
import DashboardLayout from "../../src/layouts/DashboardLayout";
import {
  Avatar,
  Box,
  FormControl,
  FormLabel,
  Text,
  VStack,
  chakra,
  Button,
  Input,
  FormHelperText,
  FormErrorMessage,
} from "@chakra-ui/react";
import { authOptions } from "../api/auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";
import { prisma } from "../../src/lib/db";
import { Organization } from "@prisma/client";
import { useCallback, useState } from "react";
import { ArrowUpIcon } from "@chakra-ui/icons";

import { useDropzone } from "react-dropzone";
import FileUpload from "../../src/components/FileUpload";
import { useForm } from "react-hook-form";
import { useWallet } from "@solana/wallet-adapter-react";
import { freezeAccountInstructionData } from "@solana/spl-token";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useMutation } from "react-query";

interface DashboardPageProps {
  orgs: Organization[];
}

interface NewOrgForm {
  name: string;
  fundsPubkey: string;
  logo: any;
}

const DashboardNewOrgPage: NextPage<DashboardPageProps> = ({ orgs }) => {
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);

  const { data: session } = useSession();

  const handleCreateOrg = useCallback(async (data: NewOrgForm) => {
    // console.log(data);
    const org = await axios.put("/api/organizations", {
      name: data.name,
      fundsPubkey: data.fundsPubkey,
    });
    console.log(org);
  }, []);

  const { mutate, isLoading } = useMutation(handleCreateOrg);

  const {
    control,
    register,
    formState: { errors },
    watch,
    handleSubmit,
  } = useForm<NewOrgForm>({
    defaultValues: {
      fundsPubkey: session?.user?.name ?? "",
    },
  });

  return (
    <DashboardLayout orgs={orgs}>
      <VStack gap={4} as="form" onSubmit={handleSubmit((data) => mutate(data))}>
        {/* <VStack gap={2}>
          <Avatar src={logoUrl} />

          <FileUpload name="logo" control={control} acceptedFileTypes="image/*" filename={uuid}>
            Upload Logo
          </FileUpload>
        </VStack> */}

        <FormControl isRequired>
          <FormLabel>Organization Name</FormLabel>
          <Input {...register("name", { required: true })} />
          {errors.name && <FormErrorMessage>Required</FormErrorMessage>}
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Wallet</FormLabel>
          <Input {...register("fundsPubkey", { required: true })} />
          <FormHelperText>
            The public key of the wallet which should receive all the payments
          </FormHelperText>
        </FormControl>

        <Button isLoading={isLoading} type="submit">
          Create Organization
        </Button>
      </VStack>
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
    props: {
      orgs: JSON.parse(JSON.stringify(orgs)),
      session: JSON.parse(JSON.stringify(session)),
    },
  };
};

export default DashboardNewOrgPage;
