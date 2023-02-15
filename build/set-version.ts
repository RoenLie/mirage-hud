import { readFileSync, writeFileSync } from 'fs';


(() => {
	const argIndex = process.argv.indexOf('-v');
	if (argIndex === -1)
		return;

	const version = process.argv[argIndex + 1];
	if (!version)
		return;

	const packageJson = readFileSync('./package.json', { encoding: 'utf8' });
	const parsedPackage = JSON.parse(packageJson);
	parsedPackage['version'] = version;

	const stringified = JSON.stringify(parsedPackage, null, 3);

	writeFileSync('./package.json', stringified);
})();
