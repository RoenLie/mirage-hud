export const setHandled = (ev: Event) => {
	ev.preventDefault(); ev.stopPropagation();
};
