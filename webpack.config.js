import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const defaultConfig = require('@wordpress/scripts/config/webpack.config');

// Get all skins from src/skins directory
function getSkinEntries() {
	const skinsDir = path.resolve(__dirname, 'src/skins');
	const entries = {};
	
	if (!fs.existsSync(skinsDir)) {
		return entries;
	}

	const skinDirs = fs.readdirSync(skinsDir, { withFileTypes: true })
		.filter(dirent => dirent.isDirectory())
		.map(dirent => dirent.name);

	skinDirs.forEach(skinName => {
		const skinPath = path.join(skinsDir, skinName, 'skin.ts');
		if (fs.existsSync(skinPath)) {
			// Entry point: skins/{skin-name}/index
			// This will output to assets/skins/{skin-name}/index.css
			entries[`skins/${skinName}/index`] = skinPath;
		}
	});

	return entries;
}

// Get library entries (standalone files that need to be built)
function getLibraryEntries() {
	const entries = {};
	
	// Add gutenform-entries library
	const entriesPath = path.resolve(__dirname, 'src/lib/gutenform-entries.ts');
	if (fs.existsSync(entriesPath)) {
		// Entry point: lib/gutenform-entries
		// This will output to assets/lib/gutenform-entries.js
		entries['lib/gutenform-entries'] = entriesPath;
	}
	
	return entries;
}

// Export as function to work with wp-scripts flags
export default (env, argv) => {
	const config = typeof defaultConfig === 'function' ? defaultConfig(env, argv) : defaultConfig;
	
	// Get skin entries
	const skinEntries = getSkinEntries();
	
	// Get library entries
	const libraryEntries = getLibraryEntries();
	
	const mergedEntry = {
		...config.entry(),
		...skinEntries,
		...libraryEntries,
	};
	
	return {
		...config,
		entry: Object.keys(mergedEntry).length > 0 ? mergedEntry : config.entry,
	};
};

