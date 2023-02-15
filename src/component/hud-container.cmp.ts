import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from 'lit/decorators/custom-element.js';
import { map } from 'lit/directives/map.js';
import { nanoid } from 'nanoid';

import { mirageHUD } from '../index.js';
import { type Vector2D, MoveController } from '../move/move-controller.js';
import { sharedStyles } from './shared-styles.js';


const setHandled = (ev: Event) => {
	ev.preventDefault(); ev.stopPropagation();
};


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
			<span>
				DRAG HERE TO MOVE
			</span>
			<button
				@pointerdown=${ setHandled }
				@click=${ this.handleClick.bind(this) }
			>
				M
			</button>
		</div>
		<div>
			${ map(this.fields, ([ label, value ]) => html`
			<div>
				<span>${ label }</span>
				<span>${ value }</span>
			</div>
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
			border: 2px solid orangered;
			background: green;

			width: 200px;
			height: 200px;

			resize: both;
		}
		.mover {
			cursor: grab;
			background-color: darkgoldenrod;
			user-select: none;
		}
		`,
	];

}
