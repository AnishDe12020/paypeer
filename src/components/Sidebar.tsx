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
  StackProps,
} from "@chakra-ui/react";
import { Organization } from "@prisma/client";
import { useQuery } from "react-query";
import useSelectedOrganization from "../hooks/useSelectedOrganization";
import { getAllOrgs } from "../utils/queries";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Avvvatars from "avvvatars-react";
import { AlertCircle, BarChart2, Check, QrCode, Settings } from "lucide-react";
import ConnectWallet from "./ConnectWallet";

interface SidebarProps extends StackProps {
  initialOrgs: Organization[];
}

const Sidebar = ({ initialOrgs, ...otherProps }: SidebarProps) => {
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
    <VStack
      as="nav"
      py={8}
      h={{ base: "90vh", md: "100vh" }}
      w={{ base: "full", md: 48 }}
      borderRight="1px solid"
      borderRightColor="brand.secondary"
      justifyContent="space-between"
      pos="fixed"
      zIndex="sticky"
      alignItems={{ base: "flex-start", md: "center" }}
      px={{ base: 12, md: 0 }}
      {...otherProps}
    >
      <VStack spacing={8} alignItems="flex-start" w="full">
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
                mx={{ base: 0, md: 4 }}
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
                      {selectedOrg?.id === org.id && <Icon as={Check} />}
                    </HStack>
                  </MenuItem>
                ))}

                <MenuDivider w="full" />

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

        <VStack px={{ base: 0, md: 4 }} spacing={4}>
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            leftIcon={<Icon as={BarChart2} />}
            bgColor={router.pathname === "/dashboard" ? "brand.tertiary" : ""}
          >
            Analytics
          </Button>

          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/qr")}
            leftIcon={<Icon as={QrCode} />}
            bgColor={
              router.pathname === "/dashboard/qr" ? "brand.tertiary" : ""
            }
          >
            QR Code
          </Button>

          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/pending")}
            leftIcon={<Icon as={AlertCircle} />}
            bgColor={
              router.pathname === "/dashboard/pending" ? "brand.tertiary" : ""
            }
          >
            Pending
          </Button>
        </VStack>
      </VStack>
      <VStack
        alignItems="flex-start"
        spacing={4}
        w="full"
        px={{ base: 0, md: 4 }}
      >
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/settings")}
          leftIcon={<Icon as={Settings} />}
          bgColor={
            router.pathname === "/dashboard/settings" ? "brand.tertiary" : ""
          }
        >
          Org Settings
        </Button>
        <ConnectWallet />
      </VStack>
    </VStack>
  );
};

export default Sidebar;
