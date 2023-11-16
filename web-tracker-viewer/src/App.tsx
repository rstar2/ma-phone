import { Box, Container, Divider, Stack } from "@chakra-ui/react";

function App() {
  return (
    <Container maxW="container.lg" h="100%" justifyContent="center" display="flex">
      <Stack h="100%" justifyContent="center">
        <Divider />
        <Box>Devices map</Box>
        <Divider />
      </Stack>
    </Container>
  );
}

export default App;
