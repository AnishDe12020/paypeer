import {
  Avatar,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Input,
  Radio,
  RadioGroup,
  VStack,
  Image,
  Text,
} from "@chakra-ui/react";
import { AcceptedTokenTypes, Organization } from "@prisma/client";
import Avvvatars from "avvvatars-react";
import axios from "axios";
import { Select } from "chakra-react-select";
import { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession } from "next-auth";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useController, useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "react-query";
import FileUpload from "../../src/components/FileUpload";
import useCluster from "../../src/hooks/useCluster";
import useSelectedOrganization from "../../src/hooks/useSelectedOrganization";
import DashboardLayout from "../../src/layouts/DashboardLayout";
import { prisma } from "../../src/lib/db";
import reactSelectStyles from "../../src/styles/chakra-react-select";
import { TOKEN_LIST } from "../../src/utils/constants";
import { authOptions } from "../api/auth/[...nextauth]";

interface SettingsPageProps {
  orgs: Organization[];
}

interface UpdateOrgForm {
  name: string;
  fundsPubkey: string;
  website: string;
  twitter: string;
  acceptedTokensType: AcceptedTokenTypes;
  acceptedTokens: TokenOption[];
}

interface TokenOption {
  label: string;
  value: string;
  logoUrl: string;
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
        acceptedTokens: data.acceptedTokensType,
        tokenPubkeys: data.acceptedTokens.map((t) => t.value),
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
    handleSubmit,
    reset,
  } = useForm<UpdateOrgForm>({
    defaultValues: useMemo(
      () => ({
        fundsPubkey: selectedOrg?.fundsPubkey,
        name: selectedOrg?.name,
        website: selectedOrg?.website as string | undefined,
        twitter: selectedOrg?.twitter as string | undefined,
        acceptedTokensType: selectedOrg?.acceptedTokens,
        acceptedTokens: selectedOrg?.tokenPubkeys.map((t) => {
          const token = TOKEN_LIST.find((token) => token.address === t);
          return {
            label: token?.symbol,
            value: token?.address,
            logoUrl: token?.logoURI,
          };
        }),
      }),
      [selectedOrg]
    ),
  });

  const {
    field: { onChange: onAcceptedTokensTypeChange, value: acceptedTokensType },
  } = useController({
    name: "acceptedTokensType",
    control,
    rules: { required: true },
  });

  const {
    field: { onChange: onAcceptedTokensChange, value: acceptedTokens },
  } = useController({
    name: "acceptedTokens",
    control,
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

        <FormControl>
          <FormLabel>Accepted Tokens</FormLabel>
          <RadioGroup
            onChange={onAcceptedTokensTypeChange}
            value={acceptedTokensType}
            as={HStack}
            gap={4}
            mb={4}
          >
            <Radio value="ONLY">Only a specific token</Radio>
            <Radio value="SOME">Some specific tokens</Radio>
            <Radio value="ANY">All tokens</Radio>
          </RadioGroup>
          <Select
            chakraStyles={reactSelectStyles}
            options={TOKEN_LIST.map((token) => ({
              label: token.symbol,
              value: token.address,
              logoUrl: token.logoURI,
            }))}
            formatOptionLabel={(option: any) => {
              return (
                <Flex alignItems="center">
                  <Image
                    src={option.logoUrl}
                    alt={option.label}
                    mr={2}
                    boxSize={6}
                    rounded="full"
                  />
                  <Text>{option.label}</Text>
                </Flex>
              );
            }}
            isMulti={acceptedTokensType === "SOME"}
            isDisabled={acceptedTokensType === "ANY"}
            onChange={onAcceptedTokensChange}
            value={acceptedTokens}
          />
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
