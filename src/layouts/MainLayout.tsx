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

      <chakra.main mt={16} px={[4, 8, 16, 32]}>
        {children}
      </chakra.main>
    </>
  );
};

export default MainLayout;
