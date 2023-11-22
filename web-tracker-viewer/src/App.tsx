import { useEffect, useState } from "react";
import { Text, Container, Stack, StackDivider, useConst } from "@chakra-ui/react";

import firebase, { parseDocs } from "./lib/firebase";
import { Location } from "./lib/types";
import DeviceLocations from "./components/LocationsMap";
import DeviceList from "./components/DeviceList";

const COLLECTION_LOCATIONS = "locations";

export default function App() {
  const [locations, setLocations] = useState<Location[]>([]);
  useEffect(() => {
    return firebase.onSnapshotCollection(COLLECTION_LOCATIONS, (snapshot) => {
      const newLocations: Location[] = parseDocs<Location>(snapshot);
      setLocations(newLocations);
    });
  }, []);

  const divider = useConst(<StackDivider borderColor="brand.100" />);

  return (
    <Container maxW="container.lg" h="100%" justifyContent="center" display="flex">
      <Stack w="100%" h="100%" justifyContent="center" paddingY={2} divider={divider}>
        <Text color="brand.100">Devices locations</Text>
        <Stack direction="row" flexGrow={1} justifyContent="center" divider={divider}>
          <DeviceList locations={locations} />
          <DeviceLocations locations={locations} />
        </Stack>
      </Stack>
    </Container>
  );
}
