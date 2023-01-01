import { CheckIcon } from "@chakra-ui/icons";
import {
  HStack,
  Menu,
  MenuButton,
  Spinner,
  VStack,
  Text,
  MenuItem,
  MenuList,
  Button,
  Box,
  Divider,
  MenuDivider,
  Icon,
  Avatar,
} from "@chakra-ui/react";
import { Organization } from "@prisma/client";
import { ReactNode, useEffect, useState } from "react";
import ConnectWallet from "../components/ConnectWallet";
import { useRouter } from "next/router";
import useSelectedOrganization from "../hooks/useSelectedOrganization";
import { getAllOrgs } from "../utils/queries";
import { useQuery } from "react-query";
import { Settings } from "react-feather";

interface DashboardLayoutProps {
  children: ReactNode;
  initialOrgs: Organization[];
}

const DashboardLayout = ({ children, initialOrgs }: DashboardLayoutProps) => {
  const { selectedOrg, setSelectedOrg } = useSelectedOrganization();

  const { data: orgs } = useQuery<Organization[]>("orgs", getAllOrgs, {
    initialData: initialOrgs,
  });

  useEffect(() => {
    if (orgs && orgs.length > 0 && !selectedOrg) {
      setSelectedOrg(orgs[0]);
    }
  }, [selectedOrg, orgs, setSelectedOrg]);

  const router = useRouter();

  return (
    <HStack h="100vh" alignItems="start">
      <VStack
        as="nav"
        h="full"
        w="48"
        py={8}
        borderRight="1px solid"
        borderRightColor="brand.tertiary"
        justifyContent="space-between"
      >
        <VStack spacing={4}>
          {orgs ? (
            orgs.length > 0 ? (
              <Menu>
                <MenuButton
                  as={Button}
                  size="sm"
                  leftIcon={
                    <Avatar
                      src={selectedOrg?.logoUrl ?? undefined}
                      h={5}
                      w={5}
                    />
                  }
                  mx={4}
                >
                  {selectedOrg?.name}
                </MenuButton>
                <MenuList background="brand.primary">
                  {orgs.map((org) => (
                    <MenuItem
                      key={org.id}
                      background="brand.primary"
                      _hover={{
                        background: "brand.secondary",
                      }}
                      onClick={() => setSelectedOrg(org)}
                      icon={
                        <Avatar src={org?.logoUrl ?? undefined} h={5} w={5} />
                      }
                    >
                      <HStack justifyContent="space-between" gap={2}>
                        <Text>{org.name}</Text>
                        {selectedOrg?.id === org.id && <CheckIcon />}
                      </HStack>
                    </MenuItem>
                  ))}

                  <MenuDivider />

                  <MenuItem
                    background="brand.primary"
                    _hover={{
                      background: "brand.secondary",
                    }}
                    onClick={() => router.push("/dashboard/new-org")}
                  >
                    New Organization
                  </MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <Button onClick={() => router.push("/dashboard/new-org")}>
                New Organization
              </Button>
            )
          ) : (
            <Spinner />
          )}

          <Divider />

          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/qr")}
            leftIcon={<Icon as={Settings} />}
            mx={4}
          >
            QR Code
          </Button>
        </VStack>
        <VStack px={4}>
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/settings")}
            leftIcon={<Icon as={Settings} />}
          >
            Org Settings
          </Button>
          <ConnectWallet />
        </VStack>
      </VStack>
      <Box as="main" py={8} pl={8}>
        {children}
      </Box>
    </HStack>
  );
};

export default DashboardLayout;
