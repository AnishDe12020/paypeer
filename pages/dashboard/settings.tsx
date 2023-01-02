import {
  Avatar,
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  VStack,
} from "@chakra-ui/react";
import { Organization } from "@prisma/client";
import Avvvatars from "avvvatars-react";
import axios from "axios";
import { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "react-query";
import FileUpload from "../../src/components/FileUpload";
import useSelectedOrganization from "../../src/hooks/useSelectedOrganization";
import DashboardLayout from "../../src/layouts/DashboardLayout";
import { prisma } from "../../src/lib/db";
import { authOptions } from "../api/auth/[...nextauth]";

interface SettingsPageProps {
  orgs: Organization[];
}

interface UpdateOrgForm {
  name: string;
  fundsPubkey: string;
  website: string;
  twitter: string;
}

const SettingsPage: NextPage<SettingsPageProps> = ({ orgs }) => {
  const { selectedOrg, setSelectedOrg } = useSelectedOrganization();

  const [logoUrl, setLogoUrl] = useState<string | undefined>(
    selectedOrg?.logoUrl ?? undefined
  );

  const queryClient = useQueryClient();

  const handleUpdateOrg = useCallback(
    async (data: UpdateOrgForm) => {
      const org = await axios.patch(`/api/organizations/${selectedOrg?.id}`, {
        name: data.name,
        fundsPubkey: data.fundsPubkey,
        website: data.website,
        twitter: data.twitter,
        logoUrl: logoUrl,
      });

      await queryClient.refetchQueries("orgs");
      setSelectedOrg(org.data.organization);
    },
    [setSelectedOrg, selectedOrg?.id, logoUrl, queryClient]
  );

  const { mutate, isLoading } = useMutation(handleUpdateOrg);

  const {
    control,
    register,
    formState: { errors },
    watch,
    handleSubmit,
    reset,
  } = useForm<UpdateOrgForm>({
    defaultValues: useMemo(
      () => ({
        fundsPubkey: selectedOrg?.fundsPubkey,
        name: selectedOrg?.name,
        website: selectedOrg?.website as string | undefined,
        twitter: selectedOrg?.twitter as string | undefined,
      }),
      [selectedOrg]
    ),
  });

  useEffect(() => {
    reset({
      fundsPubkey: selectedOrg?.fundsPubkey,
      name: selectedOrg?.name,
      website: selectedOrg?.website as string | undefined,
      twitter: selectedOrg?.twitter as string | undefined,
    });

    setLogoUrl(selectedOrg?.logoUrl ?? undefined);
  }, [selectedOrg, reset]);

  return (
    <DashboardLayout initialOrgs={orgs}>
      <VStack gap={4} as="form" onSubmit={handleSubmit((data) => mutate(data))}>
        <VStack gap={2}>
          {logoUrl ? (
            <Avatar src={logoUrl} />
          ) : (
            <Avvvatars
              style="shape"
              value={selectedOrg?.name ?? "Org"}
              size={48}
            />
          )}
          <FileUpload
            name="logo"
            acceptedFileTypes="image/*"
            filename={`${selectedOrg?.id}-logo`}
            onUpload={(url) => setLogoUrl(url)}
          >
            Upload Logo
          </FileUpload>
        </VStack>

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

        <FormControl>
          <FormLabel>Website</FormLabel>
          <Input {...register("website")} />
          <FormHelperText>Optional</FormHelperText>
        </FormControl>

        <FormControl>
          <FormLabel>Twitter Link</FormLabel>
          <Input {...register("twitter")} />
          <FormHelperText>Optional</FormHelperText>
        </FormControl>

        <Button isLoading={isLoading} type="submit">
          Update Organization
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

export default SettingsPage;
