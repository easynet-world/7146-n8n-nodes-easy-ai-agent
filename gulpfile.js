const { src, dest, series } = require('gulp');

function buildIcons() {
	return src('nodes/**/*.{png,svg}')
		.pipe(dest('dist/nodes'));
}

function copySrc() {
	return src('src/**/*')
		.pipe(dest('dist/src'));
}

exports['build:icons'] = buildIcons;
exports['copy:src'] = copySrc;
exports['build'] = series(buildIcons, copySrc);
