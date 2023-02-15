import { defineConfig } from 'vite';

import { libConfig } from './build/vite-lib-config.js';


export default defineConfig(async  () => {
	return { ...await libConfig() };
});
