import { Script } from "./nfoScript";

export type SearchResponse = {
  stat: "Ok";
  // values: (NFOScript | NSEScript)[];
  values: Script[];
};
