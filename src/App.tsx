import "./App.css";
import ShawarmaClicker from "./components/ShawarmaClicker";
import { Box } from "@chakra-ui/react";

function App() {
  return (
    <Box
      w="100vw"
      h="100vh"
      position="fixed"
      top="0"
      left="0"
      overflow="hidden"
      bg="#1a202c"
    >
      <ShawarmaClicker />
    </Box>
  );
}

export default App;
