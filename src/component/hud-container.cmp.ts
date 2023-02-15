import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from 'lit/decorators/custom-element.js';
import { map } from 'lit/directives/map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { nanoid } from 'nanoid';

import { setHandled } from '../helpers/set-handled.js';
import { mirageHUD } from '../index.js';
import { type Vector2D, MoveController } from '../move/move-controller.js';
import { sharedStyles } from './shared-styles.js';


@customElement('mirage-hud')
export class MirageHUDContainerCmp extends LitElement {

	@property({ reflect: true }) public identifier = nanoid();
	@property({ type: Object }) public vector2?: Vector2D;
	protected fields = new Map<string, any>();
	protected moveCtrl = new MoveController({
		host:            this,
		moveQuery:       () => this.renderRoot.querySelector('.mover'),
		cacheKey:        () => this.identifier,
		initialPosition: () => this.vector2,
	});

	public setField(params: {
		label: string;
		value: any;
	}) {
		this.fields.set(params.label, params.value);
		this.requestUpdate();
	}

	protected handleClick() {
		mirageHUD.minimize({ id: this.identifier });
	}

	protected override render() {
		return html`
		<div class="mover">
			<span>${ this.identifier }</span>
			<button
				class="minimize-button"
				@pointerdown=${ setHandled }
				@click=${ this.handleClick.bind(this) }
			>
				<svg xmlns="http://www.w3.org/2000/svg"
					width="1em"
					height="1em"
					fill="currentColor"
					class="bi bi-dash-lg"
					viewBox="0 0 16 16"
				><path fill-rule="evenodd" d="M2 8a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 8Z"/>
				</svg>
			</button>
		</div>

		<div class="body">
			<div class="seperator" style=${ styleMap({ gridRowEnd: String(this.fields.size + 2) }) }></div>
			${ map(this.fields, ([ label, value ]) => html`
			<span class="label">${ label }</span>
			<span class="value">${ value }</span>
			`) }
		</div>
		`;
	}

	public static override styles = [
		sharedStyles,
		css`
		:host {
			overflow: auto;
			position: fixed;

			display: grid;
			grid-template-rows: auto 1fr;

			height: 200px;
			width: 300px;

			color: rgba(245,245,245,1);
			background: rgba(30,30,30,1);
			outline: 1px solid black;
			border-radius: 8px;
			box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.2);

			resize: both;
		}
		.mover {
			cursor: grab;
			user-select: none;

			display: flex;
			justify-content: space-between;
			align-items: center;
			padding-left: 12px;
			padding-right: 4px;

			color: black;
			background-color: darkgoldenrod;
		}
		.minimize-button {
			all: unset;
			display: inline-grid;
			place-items: center;
			height: 25px;
			width: 25px;
			border-radius: 999px;
			font-size: 18px;
			color: black
		}
		.minimize-button:hover {
			cursor: pointer;
			background-color: rgba(255,255,255,0.3);
		}

		.body {
			padding: 8px;
			display: grid;
			grid-template-columns: auto 1fr;
			grid-auto-rows: min-content;
			column-gap: 12px;
			row-gap: 4px;
		}
		.body .label {
			position: relative;
			grid-column: 1/2;
			padding-right: 12px;
		}
		.body .label::after {
			content: ':';
			position: absolute;
			right: 0px;
		}
		.body .value {
			grid-column: 2/3;
		}
		`,
	];

}
