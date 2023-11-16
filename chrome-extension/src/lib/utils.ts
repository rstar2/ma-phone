export type GEO = {
  longitude: number;
  latitude: number;
  accuracy: number;
};

export const MESSAGE_TYPE = {
  REGISTER: "REGISTER",
  GEO: "GEO",
};

export const OFFSCREEN_TAB = "offscreen";
export const OFFSCREEN_DOCUMENT_PATH = "/offscreen.html";