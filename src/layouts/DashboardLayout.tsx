import {
  Box,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  HStack,
  useDisclosure,
} from "@chakra-ui/react";
import { Organization } from "@prisma/client";
import { Rotate } from "hamburger-react";
import { ReactNode, useRef } from "react";
import Sidebar from "../components/Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
  initialOrgs: Organization[];
}

const DashboardLayout = ({ children, initialOrgs }: DashboardLayoutProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <Box minH="100vh">
      <Sidebar
        initialOrgs={initialOrgs}
        display={{ base: "none", md: "flex" }}
      />

      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        placement="left"
        size="full"
        initialFocusRef={closeButtonRef}
      >
        <DrawerContent mt={20} backgroundColor="brand.primary">
          <Sidebar initialOrgs={initialOrgs} w="full" borderRight="none" />
        </DrawerContent>
      </Drawer>
      <Box ml={{ base: "none", md: 48 }}>
        <HStack
          borderBottom="1px solid"
          borderBottomColor="brand.secondary"
          height={20}
          px={8}
          py={6}
          display={{ base: "inline-flex", md: "none" }}
        >
          <Box>
            <Rotate
              toggle={onOpen}
              toggled={isOpen}
              direction="right"
              label="Menu"
              size={24}
              rounded
            />
          </Box>
        </HStack>
        <Box as="main" p={8}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
