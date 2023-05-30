import { FullTerrain } from "../../types/terrain";

export default class Plain extends FullTerrain {
	id = "plain";

	constructor() {
		super(1, 0, 0);
	}
}