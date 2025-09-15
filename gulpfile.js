const { src, dest, series } = require('gulp');
const babel = require('gulp-babel');

function buildIcons() {
	return src('nodes/**/*.{png,svg}')
		.pipe(dest('dist/nodes'));
}

function copySrc() {
	return src('src/**/*.js')
		.pipe(babel({
			presets: ['@babel/preset-env'],
			plugins: ['@babel/plugin-transform-modules-commonjs']
		}))
		.pipe(dest('dist/nodes/EasyAgentOrchestrator/src'));
}

exports['build:icons'] = buildIcons;
exports['copy:src'] = copySrc;
exports['build'] = series(buildIcons, copySrc);
