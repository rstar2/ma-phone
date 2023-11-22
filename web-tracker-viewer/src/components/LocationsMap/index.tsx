import React, { useEffect, useMemo, useState } from "react";

import { APIProvider, Map, AdvancedMarker, useMap, useMarkerRef, Pin, InfoWindow } from "@vis.gl/react-google-maps";
import { Box, Stack, Stat, StatLabel, StatNumber, StatHelpText, useDisclosure } from "@chakra-ui/react";

import "./styles.css";
import { Location } from "../../lib/types";
import Avatar from "../Avatar";

// Sofia
const sofia = { lat: 42.69751, lng: 23.32415 };

type LocationsMapProps = {
  locations: Location[];
};

export default function LocationsMap({ locations }: LocationsMapProps): React.ReactNode {
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
  const { isOpen, onToggle, onClose } = useDisclosure({defaultIsOpen: false});

  const [markerRef, marker] = useMarkerRef();
  useEffect(() => {
    if (!marker) {
      return;
    }

    // do something with marker instance here
  }, [marker]);

  return (
    <AdvancedMarker ref={markerRef} position={position} onClick={onToggle}>
      <Pin background={"#22ccff"} borderColor={"#1e89a1"} glyphColor={"#0f677a"} />
      {isOpen && (
        <InfoWindow anchor={marker} maxWidth={300} onCloseClick={onClose}>
          <Stack direction="row" className="locationMarkers">
            <Avatar name={location.name} />
            <Stat size="sm" color="brand.900">
              <StatNumber>{location.name}</StatNumber>
              <StatLabel>{new Date(location.timestamp.seconds).toLocaleString()}</StatLabel>
              <StatHelpText>{Math.round(location.geo.accuracy)}</StatHelpText>
            </Stat>
          </Stack>
        </InfoWindow>
      )}
    </AdvancedMarker>
  );
}
