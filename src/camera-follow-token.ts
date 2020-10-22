/**
 * Camera Follow Token - a simple module for FoundryVTT that locks the camera position on a token.
 * Functions entirely through Hook on `updateToken` and `renderTokenConfig`.
 * @license [GNU GPLv3.0 & 'Commons Clause' License Condition v1.0]{@link https://github.com/edzillion/camera-follow-token/blob/master/LICENSE.md}
 * @packageDocumentation
 * @author [edzillion]{@link https://github.com/edzillion}
 */

import { log, LogLevel } from './module/logging';

const MODULE_ID = 'camera-follow-token'

let gmFollowingTokenId: string;
let followingTokenId: string;

CONFIG.cft = { logLevel: 0 };
// CONFIG.debug.hooks = true;

Hooks.once('init', async function() {
	log(LogLevel.INFO, 'Initializing ...');
});

Hooks.on('updateToken', function (_scene, token) {	
	const tokenId = token.id || token._id;
	gmFollowingTokenId = canvas.scene.getFlag(MODULE_ID, 'gmFollowingTokenId');
	

	// todo: simplify this logic
	if (followingTokenId !== tokenId && gmFollowingTokenId !== tokenId) return;
	let tempFollowingTokenId = (gmFollowingTokenId !== null) ? gmFollowingTokenId : followingTokenId;
	if (tempFollowingTokenId !== tokenId) return;

	log(LogLevel.INFO, 'updateToken focus on', token.name);
	
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
	// @ts-ignore
	let gmFollowChecked = (gmFollowingTokenId && (tokenConfig.token.id === gmFollowingTokenId)) ? 'checked' : '';
	let d = document.createElement('div');
	d.className = 'form-group';
	d.innerHTML = `<label>Lock Camera on this Token:</label>
	<input type="checkbox" class="lockCamera" name="lockCamera" data-dtype="Boolean" ${checked} />`;
	let f = html.find(`.tab[data-tab='character']`)
	f.append(d);
	
	if (game.user.isGM) {
		let d2 = document.createElement('div');
		const isDisabled = (checked != 'checked') ? 'disabled' : '';
		d2.className = 'form-group';
		d2.innerHTML = `<label>[GM Only] Lock all players on this token:</label>
		<input type="checkbox" class="gmLockCamera" name="gmLockCamera" data-dtype="Boolean" ${gmFollowChecked} ${isDisabled}/>`;
		f.append(d2);
	}	

	html.find('.lockCamera').on('change', () => {
		if (checked) {
			// @ts-ignore
			log(LogLevel.DEBUG, tokenConfig.token.name, 'stop cam follow');
			followingTokenId = '';
			if (game.user.isGM) {
			canvas.scene.setFlag(MODULE_ID, 'gmFollowingTokenId', null);			
				html.find('.gmLockCamera').prop('disabled', true);
				html.find('.gmLockCamera').prop('checked', false);
			}
			checked = '';
		}
		else {
			// @ts-ignore
			log(LogLevel.DEBUG, tokenConfig.token.name, 'cam follow');			
			// @ts-ignore
			followingTokenId = tokenConfig.token.id;
			if (game.user.isGM)
				html.find('.gmLockCamera').prop('disabled', false);
			checked = 'checked';
		}
	});
	html.find('.gmLockCamera').on('change', () => {
		if (gmFollowChecked) {
			// @ts-ignore
			log(LogLevel.DEBUG, tokenConfig.token.name, 'stop cam follow GM');
			canvas.scene.setFlag(MODULE_ID, 'gmFollowingTokenId', null); 
			gmFollowChecked = '';
		}
		else {
			// @ts-ignore
			log(LogLevel.DEBUG, tokenConfig.token.name, 'cam follow GM');
			// @ts-ignore
			canvas.scene.setFlag(MODULE_ID, 'gmFollowingTokenId', tokenConfig.token.id);
			gmFollowChecked = 'checked';
		}
	});
	//recalculate the height now that we've added elements
	tokenConfig.setPosition({ height: "auto" });
});
