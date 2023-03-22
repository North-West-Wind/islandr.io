import { DefinedAnimation } from "../../types/animation";
import fists from "./fists";
import guns from "./guns";

export const DEFINED_ANIMATIONS = new Map<string , DefinedAnimation>();

fists();
guns();