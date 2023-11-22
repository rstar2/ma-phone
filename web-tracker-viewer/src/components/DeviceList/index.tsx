import React, { useMemo, useCallback } from "react";
import { List, ListItem, Text, Menu, MenuList, MenuItem, MenuButton, MenuDivider } from "@chakra-ui/react";

import { Location } from "../../lib/types";
import Avatar from "../Avatar";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";

type Device = {
  name: string;
  avatar: React.ReactNode;
};

type DeviceListProps = {
  locations: Location[];
};

export default function DeviceList({ locations }: DeviceListProps) {
  const devices: Device[] = useMemo(() => {
    const names = new Set<string>();
    const result: Device[] = [];

    locations.forEach(({ name }) => {
      if (!names.has(name)) {
        names.add(name);
        result.push({
          name,
          avatar: <Avatar name={name} size={30} />,
        });
      }
    });

    return result;
  }, [locations]);

  const onMenuAction = useCallback((device: Device, action: string) => {
    console.log("??? Device action", device.name, action);
  }, []);

  return (
    <>
      <List spacing={3}>
        {devices.map((device) => (
          <React.Fragment key={device.name}>
            <DeviceItem device={device} onMenuAction={(action) => onMenuAction(device, action)} />
          </React.Fragment>
        ))}
      </List>
    </>
  );
}
type DeviceItemProps = {
  device: Device;
  onMenuAction: (action: string) => void;
};

function DeviceItem({ device, onMenuAction }: DeviceItemProps) {
  const onAction = useCallback(
    (e: React.SyntheticEvent<HTMLElement>) => {
      const action = e.currentTarget.dataset.action;
      if (action) onMenuAction(action);
    },
    [onMenuAction]
  );
  return (
    <ListItem display="flex" alignItems="center" gap={2}>
      {device.avatar}
      <Text color="brand.100">{device.name}</Text>
      <Menu>
        {/* Menu  can receive children as function, e.g. renderProp , so the internal state can be used */}
        {({ isOpen }) => (
          <>
            <MenuButton>{isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}</MenuButton>
            <MenuList>
              <MenuItem onClick={onAction} data-action="download">
                Download
              </MenuItem>
              <MenuItem onClick={onAction} data-action="copy">
                Copy
              </MenuItem>

              <MenuDivider />

              <MenuItem onClick={onAction} data-action="delete">
                Delete
              </MenuItem>
            </MenuList>
          </>
        )}
      </Menu>
    </ListItem>
  );
}
