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
} from "@chakra-ui/react";
import { Organization } from "@prisma/client";
import axios from "axios";
import Cookies from "js-cookie";
import { ReactNode, useState } from "react";
import { useQuery } from "react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import ConnectWallet from "../components/ConnectWallet";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const { publicKey } = useWallet();

  const { data: orgs } = useQuery<Organization[]>(
    "orgs",
    async () => {
      const res = await axios.get(`/api/organizations?pubkey=${publicKey}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("idToken")}`,
        },
      });

      if (!selectedOrg && res.data.organizations.length > 0) {
        setSelectedOrg(res.data.organizations[0]);
      }

      return res.data.organizations;
    },
    {
      enabled: !!publicKey,
    }
  );

  return (
    <HStack h="100vh" alignItems="start">
      <VStack
        as="nav"
        h="full"
        w="60"
        px={4}
        py={8}
        borderRight="1px solid"
        borderRightColor="brand.tertiary"
      >
        <HStack justifyContent="space-between" w="full">
          {orgs ? (
            orgs.length > 0 ? (
              <Menu>
                <MenuButton as={Button}>
                  <Text>{selectedOrg?.name}</Text>
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
                </MenuList>
              </Menu>
            ) : (
              <p>implement create org</p>
            )
          ) : (
            <Spinner />
          )}
          <ConnectWallet />
        </HStack>
      </VStack>
      <Box as="main" py={8}>
        {children}
      </Box>
    </HStack>
  );
};

export default DashboardLayout;
