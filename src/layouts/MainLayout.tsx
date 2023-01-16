import { Box, chakra } from "@chakra-ui/react";
import React, { ReactNode } from "react";
import Header from "../components/Header";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <>
      <Header />
      <Box
        bg="#4b35f5"
        filter="blur(200px)"
        h={{ base: "52", md: "72" }}
        position="absolute"
        rounded="full"
        w={{ base: "60", md: "96" }}
        zIndex="50"
        left="16"
        top="32"
        opacity="0.3"
      />
      <Box
        bg="#a948fd"
        filter="blur(200px)"
        h={{ base: "52", md: "72" }}
        position="absolute"
        rounded="full"
        w={{ base: "60", md: "96" }}
        zIndex="50"
        right="16"
        top="72"
        opacity="0.3"
      />
      <chakra.main mt={16} px={[4, 8, 16, 32]}>
        {children}
      </chakra.main>
    </>
  );
};

export default MainLayout;
