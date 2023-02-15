import { MirageHUDContainerCmp } from './component/hud-container.cmp.js';
import { MirageHUDDockCmp } from './component/hud-dock.cmp.js';

MirageHUDContainerCmp;
MirageHUDDockCmp;


const dockElement = document.createElement('mirage-hud-dock');
document.body.append(dockElement);


// Holds references to the active HUD elements.
const elements = new Map<string, MirageHUDContainerCmp>();


class MirageHUD {

	public set(params: {
		id: string;
		label: string;
		value: string;
	}) {
		const hudNode = elements.get(params.id);
		if (!hudNode) {
			this.create({ id: params.id, x: 0, y: 0 });
			this.set({
				id:    params.id,
				label: params.label,
				value: params.value,
			});

			return;
		}

		hudNode.setField({
			label: params.label,
			value: params.value,
		});
	}

	public create(params: {
		id: string;
		x: number,
		y: number,
	}) {
		const hudNode = Object.assign(document.createElement('mirage-hud'), {
			identifier: params.id,
			vector2:    { x: params.x, y: params.y },
		}) as MirageHUDContainerCmp;

		elements.set(hudNode.identifier, hudNode);

		if (this.getSessionsMinimized({ id: hudNode.identifier }))
			this.minimize({ id: hudNode.identifier });
		else
			this.restore({ id: hudNode.identifier });
	}

	public minimize(params: {
		id: string,
	}) {
		const hudNode = elements.get(params.id);
		if (!hudNode)
			throw ('no hud with id: ' + params.id);

		dockElement.append(hudNode);
		this.setSessionMinimized({ id: params.id, state: true });
	}

	public restore(params: {
		id: string
	}) {
		const hudNode = elements.get(params.id);
		if (!hudNode)
			throw ('no hud with id: ' + params.id);

		document.body.append(hudNode);
		this.setSessionMinimized({ id: params.id, state: false });
	}

	protected setSessionMinimized(params: {
		id: string;
		state: boolean;
	}) {
		const state: Record<string, boolean> = JSON
			.parse(sessionStorage.getItem('mirageDockHudMinimized') || '{}');

		state[params.id] = params.state;
		sessionStorage.setItem('mirageDockHudMinimized', JSON.stringify(state));
	}

	protected getSessionsMinimized(params: {
		id: string;
	}) {
		const state: Record<string, boolean> = JSON
			.parse(sessionStorage.getItem('mirageDockHudMinimized') || '{}');

		return !!state[params.id];
	}

}


export const mirageHUD = new MirageHUD();
