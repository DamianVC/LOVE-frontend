import { DefaultLinkFactory, DefaultLinkModel } from '@projectstorm/react-diagrams';
import * as React from 'react';
import { AdvancedLinkWidget } from './AdvancedLinkWidget';

export class AdvancedLinkModel extends DefaultLinkModel {
  constructor(options) {
    super({
      type: 'advanced',
      selected: false,
      ...options,
    });
    this.linkId = options.linkId;
  }

  serialize() {
    return {
      ...super.serialize(),
      linkId: this.linkId,
    };
  }
}

export class AdvancedLinkFactory extends DefaultLinkFactory {
  constructor() {
    super('advanced');
  }

  generateReactWidget(event) {
    // console.log('event', event)
    // return super.generateReactWidget(event);
    return <AdvancedLinkWidget link={event.model} diagramEngine={this.engine} />;
  }

  generateModel = (/* event */) => {
    return new AdvancedLinkModel();
  }
}
