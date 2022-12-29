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
} from "@chakra-ui/react";
import { Organization } from "@prisma/client";
import { ReactNode, useEffect, useState } from "react";
import ConnectWallet from "../components/ConnectWallet";
import NextLink from "next/link";
import { useRouter } from "next/router";

interface DashboardLayoutProps {
  children: ReactNode;
  orgs: Organization[];
}

const DashboardLayout = ({ children, orgs }: DashboardLayoutProps) => {
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(
    orgs.length > 0 ? orgs[0] : null
  );

  const router = useRouter();

  return (
    <HStack h="100vh" alignItems="start">
      <VStack
        as="nav"
        h="full"
        w="48"
        py={8}
        px={4}
        borderRight="1px solid"
        borderRightColor="brand.tertiary"
        justifyContent="space-between"
        alignItems="start"
      >
        {orgs ? (
          orgs.length > 0 ? (
            <Menu>
              <MenuButton as={Button} size="sm">
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
                    onSelect={() => setSelectedOrg(org)}
                    icon={
                      selectedOrg?.id === org.id ? <CheckIcon /> : undefined
                    }
                  >
                    {org.name}
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

        <ConnectWallet />
      </VStack>
      <Box as="main" py={8} pl={8}>
        {children}
      </Box>
    </HStack>
  );
};

export default DashboardLayout;
