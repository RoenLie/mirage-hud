import { css, html, LitElement } from 'lit';
import { customElement, queryAssignedElements, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';

import { mirageHUD } from '../index.js';
import { MirageHUDContainerCmp } from './hud-container.cmp.js';
import { sharedStyles } from './shared-styles.js';


@customElement('mirage-hud-dock')
export class MirageHUDDockCmp extends LitElement {

	@queryAssignedElements() protected slotElements: MirageHUDContainerCmp[];
	@state() protected menuOpen = false;

	protected handleSlotchange() {
		this.requestUpdate();
	}

	protected restore(params: {
		id: string
	}) {
		mirageHUD.restore({ id: params.id });
	}

	protected handleClick() {
		if (this.menuOpen) {
			this.menuOpen = false;
			window.removeEventListener('pointerdown', this.handleCloseMenu);
		}
		else {
			this.menuOpen = true;
			window.addEventListener('pointerdown', this.handleCloseMenu);
		}
	}

	protected handleCloseMenu = (ev: PointerEvent) => {
		const path = ev.composedPath();
		if (!path.some(el => el instanceof MirageHUDDockCmp)) {
			this.menuOpen = false;
			window.removeEventListener('pointerdown', this.handleCloseMenu);
		}
	};

	protected override render() {
		return html`
		<div class="base">
			<button
				class="dock-button"
				@click=${ this.handleClick.bind(this) }
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" class="bi bi-disc" viewBox="0 0 16 16">
					<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
					<path d="M10 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 4a4 4 0 0 0-4 4 .5.5 0 0 1-1 0 5 5 0 0 1 5-5
					.5.5 0 0 1 0 1zm4.5 3.5a.5.5 0 0 1 .5.5 5 5 0 0 1-5 5 .5.5 0 0 1 0-1 4 4 0 0 0 4-4 .5.5 0 0 1 .5-.5z"/>
				</svg>
			</button>

			<div class="menu" ?open=${ this.menuOpen }>
				${ map(this.slotElements, element => html`
					<div>
						<span>${ element.identifier }</span>
						<button @click=${ () => this.restore({ id: element.identifier }) }>R</button>
					</div>
				`) }
			</div>
		</div>

		<slot style="display:none;"
			@slotchange=${ this.handleSlotchange.bind(this) }
		></slot>
		`;
	}

	public static override styles = [
		sharedStyles,
		css`
		:host {
			top: 0px;
			right: 0px;
			position: fixed;
		}
		.dock-button {
			all: unset;
			display: grid;
			place-items: center;

			color: white;
			border-radius: 999px;
			width: 50px;
			height: 50px;
			font-size: 24px;
		}
		.dock-button:hover {
			cursor: pointer;
			background-color: rgba(255,255,255,0.3);
		}
		.menu {
			display: none;
			position: absolute;
			right: 20px;
			width: 300px;
			height: 300px;
			background-color: cadetblue;
			border-radius: 8px;
			padding: 8px;
		}
		.menu[open=""] {
			display: block;
		}
		`,
	];

}
