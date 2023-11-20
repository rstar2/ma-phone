import { useEffect, useState } from "react";
import { Box, Container, Divider, Stack } from "@chakra-ui/react";

import firebase, { parseDocs } from "./lib/firebase";
import { Location } from "./lib/types";
import { LocationsMap } from "./LocationsMap";

const COLLECTION_LOCATIONS = "locations";

function App() {
  const [locations, setLocations] = useState<Location[]>([]);
  useEffect(() => {
    return firebase.onSnapshotCollection(COLLECTION_LOCATIONS, (snapshot) => {
      const newLocations: Location[] = parseDocs<Location>(snapshot);
      setLocations(newLocations);
    });
  }, []);

  return (
    <Container maxW="container.lg" h="100%" justifyContent="center" display="flex">
      <Stack w="100%" h="100%" justifyContent="center">
        <Divider />
        <Box>Devices map</Box>
        <LocationsMap locations={locations} />
        <Divider />
      </Stack>
    </Container>
  );
}

export default App;
