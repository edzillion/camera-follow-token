/**
 * Camera Follow Token - a simple module for FoundryVTT that locks the camera position on a token.
 * Functions entirely through Hook on `updateToken` and `renderTokenConfig`.
 * @license [GNU GPLv3.0 & 'Commons Clause' License Condition v1.0]{@link https://github.com/edzillion/camera-follow-token/blob/master/LICENSE.md}
 * @packageDocumentation
 * @author [edzillion]{@link https://github.com/edzillion}
 */

import { log, LogLevel } from './module/logging';

let followingTokenId: string;

CONFIG.cft = { logLevel: 0 };
// CONFIG.debug.hooks = true;

Hooks.once('init', async function() {
	log(LogLevel.INFO, 'Initializing ...');
});

Hooks.on('updateToken', function (_scene, token) {
	log(LogLevel.INFO, 'updateToken');
	if (!followingTokenId || token._id !== followingTokenId) return;
	
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
	let checked = (followingTokenId && (tokenConfig.token.id === followingTokenId)) ? 'checked' : '';
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
			followingTokenId = undefined;
		}
		else {
			// @ts-ignore
			log(LogLevel.DEBUG, tokenConfig.token.name, 'cam follow');
			// @ts-ignore
			followingTokenId = tokenConfig.token.id;
		}
	});
	//recalculate the height now that we've added elements
	tokenConfig.setPosition({height: "auto"});
});
