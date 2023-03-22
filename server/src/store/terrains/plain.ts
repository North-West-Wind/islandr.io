import { Terrain } from "../../types/terrain";

export default class Plain extends Terrain {
	id = "plain";

	constructor() {
		super(1, 0, 0);
		this.full = true;
	}
}