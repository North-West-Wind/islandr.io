import { FullTerrain } from "../../types/terrain";

export default class Plain extends FullTerrain {
	static readonly ID = "plain";
	id = Plain.ID;

	constructor() {
		super(1, 0, 0);
	}
}