import { css, html, LitElement } from 'lit';
import { customElement, queryAssignedElements } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';

import { mirageHUD } from '../index.js';
import { MirageHUDContainerCmp } from './hud-container.cmp.js';
import { sharedStyles } from './shared-styles.js';


@customElement('mirage-hud-dock')
export class MirageHUDDockCmp extends LitElement {

	@queryAssignedElements() protected slotElements: MirageHUDContainerCmp[];

	protected handleSlotchange() {
		console.log('something added or removed from the dock');
		console.log(this.slotElements);
		this.requestUpdate();
	}

	protected restore(params: {
		id: string
	}) {
		mirageHUD.restore({ id: params.id });
	}

	protected override render() {
		return html`
		${ map(this.slotElements, element => html`
			<div>
				<span>${ element.identifier }</span>
				<button @click=${ () => this.restore({ id: element.identifier }) }>R</button>
			</div>
		`) }

		<slot style="display:none;"
			@slotchange=${ this.handleSlotchange.bind(this) }
		></slot>
		`;
	}

	public static override styles = [
		sharedStyles,
		css`
		:host {
			top: 0;
			right: 0;
			position: fixed;
			border: 2px solid purple;
			background: teal;

			width: 200px;
			height: 200px;
		}
		`,
	];

}
