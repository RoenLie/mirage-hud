import { computePosition } from '@floating-ui/dom';
import { LitElement, ReactiveController } from 'lit';

import { drag } from './drag.js';


interface LitHost extends LitElement, Record<string, any> {}
export type Vector2D = {x: number; y: number};


let zIndexIncrementer = 0;


const paintCycle = () => new Promise(resolve => requestAnimationFrame(resolve));


export class MoveController implements ReactiveController {

	//#region properties
	protected pointerPosition: Vector2D = { x: 0, y: 0 };
	protected pointerOffset: Vector2D = { x: 0, y: 0 };
	protected positionerSub: { unsubscribe: () => void };
	protected virtualEl = {
		getBoundingClientRect: () => {
			return {
				width:  0,
				height: 0,
				x:      this.pointerPosition.x,
				y:      this.pointerPosition.y,
				top:    this.pointerPosition.y,
				left:   this.pointerPosition.x,
				right:  this.pointerPosition.x,
				bottom: this.pointerPosition.y,
			};
		},
	};
	//#endregion


	constructor(
		protected params: {
			/** The host element that connects to this controller. */
			host:      LitHost;
			/** Function that returns the element which the move listener is attached to */
			moveQuery: () => HTMLElement | null;
			/** Function that returns a cache key to use for storing
			 * the position of this element in sessionstorage */
			cacheKey?: () => string | undefined;
			/** Initial position of the element */
			initialPosition?: () => Vector2D | undefined;
		},
	) {
		params.host.addController(this);
	}


	//#region lifecycle
	public hostConnected() {
		if (!this.params.host.hasUpdated)
			this.firstConnect();

		this.params.host.updateComplete.then(paintCycle).then(() => {
			this.params.moveQuery()?.addEventListener('pointerdown', this.handlePointerdown);
		});
	}

	public hostDisconnected() {
		this.params.host.removeEventListener('pointerdown', this.handlePointerdown);
	}
	//#endregion


	//#region logic
	protected handlePointerdown = (ev: PointerEvent) => this.startPositioner(ev);

	protected startPositioner(ev: PointerEvent, calculcateOffset = true) {
		ev.preventDefault();
		this.stopPositioner();

		const hostEl = this.params.host;

		hostEl.style.setProperty('pointer-events', 'none');
		document.body.style.setProperty('cursor', 'grabbing');

		// Ensures the last clicked user of move controller is always on top.
		hostEl.style.setProperty('z-index', String(zIndexIncrementer++));

		const moverEl = this.params.moveQuery()!;
		const floatingRects = moverEl.getBoundingClientRect();
		const containerRects = window.document.body.getBoundingClientRect();

		if (calculcateOffset) {
			const styles = getComputedStyle(hostEl);

			const widthExtras = {
				pad:    styles.paddingLeft,
				margin: styles.marginLeft,
				border: styles.borderLeftWidth,
			};

			const heightExtras = {
				pad:    styles.paddingTop,
				margin: styles.marginTop,
				border: styles.borderTopWidth,
			};

			const sum = (obj: Record<string, string>) =>
				Object.values(obj).reduce((a, b) => a + parseInt(b), 0);

			const extraWidth = sum(widthExtras);
			const extraHeight = sum(heightExtras);

			this.pointerOffset = {
				x: floatingRects.left - ev.clientX - extraWidth,
				y: floatingRects.top - ev.clientY - extraHeight,
			};
		}

		this.positionerSub = drag(window.document.body, {
			initialEvent: ev,
			onMove:       ({ x, y }) => {
				this.pointerPosition = { x, y };
				this.computePosition(floatingRects, containerRects);
			},
			onStop: () => {
				this.stopPositioner();

				const cacheKey = this.params.cacheKey?.();
				if (cacheKey) {
					const hostEl = this.params.host;
					const borderWidth = parseInt(getComputedStyle(hostEl).borderWidth || '0');
					const floatingRects = moverEl.getBoundingClientRect();
					const vector = {
						x: Math.round(floatingRects.x) - borderWidth,
						y: Math.round(floatingRects.y) - borderWidth,
					};

					sessionStorage.setItem(cacheKey, JSON.stringify(vector));
				}
			},
		});
	}

	protected stopPositioner() {
		const hostEl = this.params.host;

		document.body.style.removeProperty('cursor');
		hostEl.style.removeProperty('pointer-events');
		this.positionerSub?.unsubscribe();
	}

	protected async computePosition(
		floatingRects: DOMRect,
		containerRects: DOMRect,
	) {
		let { x, y } = await computePosition(
			this.virtualEl,
			this.params.host,
			{
				placement: 'bottom-start',
				strategy:  'fixed',
			},
		);

		x += this.pointerOffset.x;
		y += this.pointerOffset.y;

		/* check upper boundry constraints */
		if (x + floatingRects.width > containerRects.right)
			x = containerRects.right - floatingRects.width;
		if (y + floatingRects.height > containerRects.bottom)
			y = containerRects.bottom - floatingRects.height;

		/* check lower boundry constraints */
		if (x < containerRects.left)
			x = containerRects.left;
		if (y < containerRects.top)
			y = containerRects.top;

		Object.assign(this.params.host.style, {
			top:       '0',
			left:      '0',
			translate: `${ Math.round(x) }px ${ Math.round(y) }px`,
		});
	}

	protected async firstConnect() {
		await this.params.host.updateComplete;
		await paintCycle();

		const initialPosition = this.params.initialPosition?.();
		const moverEl = this.params.moveQuery()!;
		const floatingRects = moverEl.getBoundingClientRect();
		const containerRects = window.document.body.getBoundingClientRect();

		const cacheKey = this.params.cacheKey?.();
		const cachedVecotor = cacheKey && sessionStorage.getItem(cacheKey);
		if (cachedVecotor) {
			const cachedVector = sessionStorage.getItem(cacheKey);
			if (cachedVector) {
				const { x, y } = JSON.parse(cachedVector) as Vector2D;

				this.pointerPosition = { x, y };
				this.computePosition(floatingRects, containerRects);
			}
		}
		else if (initialPosition) {
			this.pointerPosition = initialPosition;
			this.computePosition(floatingRects, containerRects);
		}
	}
	//#endregion

}
