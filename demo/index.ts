import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { nanoid } from 'nanoid';

import { mirageHUD } from '../src/controller.js';


@customElement('demo-main')
export class MainCmp extends LitElement {

	protected timestamp = new Date().toTimeString();

	public override connectedCallback(): void {
		super.connectedCallback();

		mirageHUD.set({ id: 'hud-test1', label: 'Timestamp', value: this.timestamp });
		mirageHUD.set({ id: 'hud-test2', label: 'random value', value: nanoid() });
	}


	protected updateTime() {
		this.timestamp = new Date().toTimeString();
		mirageHUD.set({ id: 'hud-test1', label: 'Timestamp', value: this.timestamp });
	}

	protected handleScroll(ev: Event) {
		const target = ev.target as HTMLElement;

		mirageHUD.set({
			id:    'hud-test1',
			label: 'Scrolltop',
			value: Math.round(target.scrollTop) + '/' + target.scrollHeight,
		});
	}


	protected override render() {
		return html`

		<button
			@click=${ this.updateTime.bind(this) }
		>Update time</button>


		<div class="scroll-area" @scroll=${ this.handleScroll.bind(this) }>
			<div class="scroller"></div>
		</div>
		`;
	}

	public static override styles = [
		css`
		.scroll-area {
			position: relative;
			height: 300px;
			width: 300px;
			overflow: auto;
			background-color: teal;
		}
		.scroll-area::after {
			content: 'Scroll!';
			position: absolute;
			inset: 0;
			display: grid;
			place-items: center;
			user-select: none;
			pointer-events: none;
		}
		.scroll-area .scroller {
			height: 5000px;
		}
		`,
	];

}
