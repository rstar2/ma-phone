import React, { useEffect, useMemo, useState } from "react";

import { APIProvider, Map, AdvancedMarker, useMap, useMarkerRef, Pin, InfoWindow } from "@vis.gl/react-google-maps";
import Avatar, { AvatarProps } from "boring-avatars";
import { Box, Stack, Text } from "@chakra-ui/react";

import { Location } from "../lib/types";
import "./styles.css";

const avatarOpts = {
  size: 40,
  variant: "beam",
  colors: ["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"],
} satisfies AvatarProps;

// Sofia
const sofia = { lat: 42.69751, lng: 23.32415 };

type LocationsMapProps = {
  locations: Location[];
};

export function LocationsMap({ locations }: LocationsMapProps): React.ReactNode {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // here you can interact with the imperative maps API
  }, [map]);

  const center = locations.length ? { lat: locations[0].geo.latitude, lng: locations[0].geo.longitude } : sofia;

  return (
    <Box flexGrow={1}>
      <APIProvider apiKey={import.meta.env.VITE_FIREBASE_API_KEY!} onLoad={() => {}}>
        <Map mapId={"1"} center={center} zoom={8} libraries={["marker"]} disableDefaultUI={false}>
          {locations.map((location) => (
            <LocationMarker key={location.id} location={location} />
          ))}
        </Map>
      </APIProvider>
    </Box>
  );
}

type LocationMarkerProps = {
  location: Location;
};

function LocationMarker({ location }: LocationMarkerProps) {
  const position = useMemo(() => ({ lat: location.geo.latitude, lng: location.geo.longitude }), [location]);
  const [infoWindowOpen, setInfoWindowOpen] = useState(false);

  const [markerRef, marker] = useMarkerRef();
  useEffect(() => {
    if (!marker) {
      return;
    }

    // do something with marker instance here
  }, [marker]);

  return (
    <AdvancedMarker ref={markerRef} position={position} onClick={() => setInfoWindowOpen(!infoWindowOpen)}>
      <Pin background={"#22ccff"} borderColor={"#1e89a1"} glyphColor={"#0f677a"} />
      {infoWindowOpen && (
        <InfoWindow anchor={marker} maxWidth={300} onCloseClick={() => setInfoWindowOpen(false)}>
          <Stack direction="row" className="locationMarkers">
            <Avatar {...avatarOpts} name={location.name} />
            <Stack>
              <Text color="brand.900">{location.name}</Text>
              <Text color="brand.500">{new Date(location.timestamp.seconds).toLocaleString()}</Text>
              <Text color="brand.500">{location.geo.accuracy}</Text>
            </Stack>
          </Stack>
        </InfoWindow>
      )}
    </AdvancedMarker>
  );
}
