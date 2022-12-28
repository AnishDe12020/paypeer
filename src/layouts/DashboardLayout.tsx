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
  Avatar,
  MenuDivider,
  Button,
  Box,
} from "@chakra-ui/react";
import { Organization } from "@prisma/client";
import axios from "axios";
import Cookies from "js-cookie";
import { ReactNode, useState } from "react";
import { useQuery } from "react-query";
import useWeb3Auth from "../hooks/useWeb3Auth";
import Blockies from "react-blockies";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { address, logout } = useWeb3Auth();
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  const { data: orgs } = useQuery<Organization[]>(
    "orgs",
    async () => {
      const res = await axios.get(`/api/organizations?pubkey=${address}`, {
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
      enabled: !!address,
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
          {address && (
            <Menu>
              <MenuButton>
                <Avatar as={Blockies} seed={address} size="sm" />
              </MenuButton>
              <MenuList background="brand.primary">
                <MenuItem
                  background="brand.primary"
                  _hover={{
                    background: "brand.secondary",
                  }}
                >
                  Account
                </MenuItem>
                <MenuDivider />
                <MenuItem
                  background="brand.primary"
                  _hover={{
                    background: "brand.secondary",
                  }}
                  textColor="red.500"
                  onClick={logout}
                >
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </HStack>
      </VStack>
      <Box as="main" py={8}>
        {children}
      </Box>
    </HStack>
  );
};

export default DashboardLayout;
