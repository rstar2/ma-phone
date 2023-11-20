import { type Timestamp } from "firebase/firestore";

export type GEO = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

export type Location = {
  id: string;
  name: string;
  geo: GEO;
  timestamp: Timestamp;
};
