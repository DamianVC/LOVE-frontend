import { NodeModel, NodeModelGenerics } from '@projectstorm/react-diagrams';
import { DiamondPortModel, PortModelAlignment } from './DiamondPortModel';
export class DiamondNodeModel extends NodeModel{
	constructor(label) {
		super({
			type: 'diamond'
		});
		this.label = label;
		this.addPort(new DiamondPortModel(PortModelAlignment.TOP1));
		this.addPort(new DiamondPortModel(PortModelAlignment.TOP2));
		this.addPort(new DiamondPortModel(PortModelAlignment.TOP3));
		this.addPort(new DiamondPortModel(PortModelAlignment.LEFT1));
		this.addPort(new DiamondPortModel(PortModelAlignment.LEFT2));
		this.addPort(new DiamondPortModel(PortModelAlignment.LEFT3));
		this.addPort(new DiamondPortModel(PortModelAlignment.BOTTOM1));
		this.addPort(new DiamondPortModel(PortModelAlignment.BOTTOM2));
		this.addPort(new DiamondPortModel(PortModelAlignment.BOTTOM3));
		this.addPort(new DiamondPortModel(PortModelAlignment.RIGHT1));
		this.addPort(new DiamondPortModel(PortModelAlignment.RIGHT2));
		this.addPort(new DiamondPortModel(PortModelAlignment.RIGHT3));
	}
}
