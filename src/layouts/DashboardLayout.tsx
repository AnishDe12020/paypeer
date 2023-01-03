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
import { ReactNode, useEffect } from "react";
import ConnectWallet from "../components/ConnectWallet";
import { useRouter } from "next/router";
import useSelectedOrganization from "../hooks/useSelectedOrganization";
import { getAllOrgs } from "../utils/queries";
import { useQuery } from "react-query";
import { Settings, QrCode, Check, BarChart2 } from "lucide-react";
import Avvvatars from "avvvatars-react";

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

  console.log(router.pathname);

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
                    selectedOrg &&
                    (selectedOrg?.logoUrl ? (
                      <Avatar src={selectedOrg.logoUrl} h={5} w={5} />
                    ) : (
                      <Avvvatars
                        style="shape"
                        value={selectedOrg.name}
                        size={20}
                      />
                    ))
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
                        org.logoUrl ? (
                          <Avatar src={org.logoUrl} h={5} w={5} />
                        ) : (
                          <Avvvatars style="shape" value={org.name} size={20} />
                        )
                      }
                    >
                      <HStack justifyContent="space-between" gap={2}>
                        <Text>{org.name}</Text>
                        {selectedOrg?.id === org.id && <Check />}
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
            onClick={() => router.push("/dashboard")}
            leftIcon={<Icon as={BarChart2} />}
            mx={4}
            bgColor={router.pathname === "/dashboard" ? "brand.tertiary" : ""}
          >
            Analytics
          </Button>

          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/qr")}
            leftIcon={<Icon as={QrCode} />}
            mx={4}
            bgColor={
              router.pathname === "/dashboard/qr" ? "brand.tertiary" : ""
            }
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
