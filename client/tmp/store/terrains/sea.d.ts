import { LineTerrain } from "../../types/terrain";
export default class Sea extends LineTerrain {
    static readonly ID = "sea";
    id: string;
    color: number;
}
