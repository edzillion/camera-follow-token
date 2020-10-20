/**
 * Blood 'n Guts, a Foundry VTT module that adds blood splatter to your adventures.
 * All functionality is wrapped in it's main Class `BloodNGuts`.
 * @license [GNU GPLv3.0 & 'Commons Clause' License Condition v1.0]{@link https://github.com/edzillion/blood-n-guts/blob/master/LICENSE.md}
 * @packageDocumentation
 * @author [edzillion]{@link https://github.com/edzillion}
 */


// Import TypeScript modules
//import { registerSettings } from './module/settings.js';
//import { preloadTemplates } from './module/preloadTemplates.js';
import { log, LogLevel } from './module/logging';

let followingToken: Token;

CONFIG.cftLogLevel = 1;
// CONFIG.debug.hooks = true;
/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once('init', async function() {
	log(LogLevel.INFO, 'Initializing ...');

	// Assign custom classes and constants here
	
	// // Register custom module settings
	// registerSettings();
	
	// // Preload Handlebars templates
	// await preloadTemplates();

	// Register custom sheets (if any)
});


Hooks.on('updateToken', function (_scene, token) {
	log(LogLevel.INFO, 'updateToken');
	if (!followingToken || token._id !== followingToken.id) return;
	
	let data = {
		x:token.x + (token.width * canvas.grid.size)/2,
		y:token.y + (token.height * canvas.grid.size)/2,
		scale: canvas.scene._viewPosition.scale
	}
	log(LogLevel.DEBUG, 'updateToken, data', data);
	log(LogLevel.DEBUG, 'panning to (x,y)', data.x, data.y);

	// Update the scene tracked position
	canvas.stage.pivot.set(data.x, data.y);
	canvas.scene._viewPosition = data;
	// Call canvasPan Hook
	Hooks.callAll("canvasPan", canvas, data);
	
	// Align the HUD
	canvas.hud.align();
});

Hooks.on('renderTokenConfig', async function (tokenConfig:TokenConfig, html:JQuery) {
	log(LogLevel.INFO, 'renderTokenConfig');
	// @ts-ignore
	let checked = (tokenConfig.token.id === followingToken?.id) ? 'checked' : '';
	let d = document.createElement('div');
	d.className = 'form-group';
	d.innerHTML = `<label>Lock Camera on this Token:</label>
	<input type="checkbox" class="lockCamera" name="lockCamera" data-dtype="Boolean" ${checked} />`;
	let f = html.find(`.tab[data-tab='character']`)
	f.append(d);

	html.find('.lockCamera').on('change', (event) => {
		if (checked) {
			// @ts-ignore
			log(LogLevel.DEBUG, tokenConfig.token.name, 'stop cam follow');
			followingToken = null;
		}
		else {
			// @ts-ignore
			log(LogLevel.DEBUG, tokenConfig.token.name, 'cam follow');
			// @ts-ignore
			followingToken = tokenConfig.token;
		}
	});
	tokenConfig.setPosition({height: "auto"});
});
