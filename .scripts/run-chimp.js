/* Copyright 2017 Apinf Oy
This file is covered by the EUPL license.
You may obtain a copy of the licence at
https://joinup.ec.europa.eu/community/eupl/og_page/european-union-public-licence-eupl-v11 */

// Inspired by https://goo.gl/Rbd2s2

var path = require('path'),
	fs = require('fs'),
	extend = require('util')._extend,
	exec = require('child_process').exec,
	processes = [];

var baseDir = path.resolve(__dirname, '..'),
	srcDir = path.resolve(baseDir);

var appOptions = {
	env: {
		PORT: 3000,
		ROOT_URL: 'http://localhost:3000'
	}
};

/**
 * Start a process on the O.S.
 * Optionally start a child process if options.waitForMessage
 * is set to an output message emitted by this process.
 *
 * @param {command, options} opts
 * @param {*} callback
 */
function startProcess(opts, callback) {
	var proc = exec(
		opts.command,
		opts.options
	);

	if (opts.waitForMessage) {
		proc.stdout.on('data', function waitForMessage(data) {
			if (data.toString().match(opts.waitForMessage)) {
				if (callback) {
					callback();
				}
			}
		});
	}

	if (!opts.silent) {
		proc.stdout.pipe(process.stdout);
		proc.stderr.pipe(process.stderr);
	}

	if (opts.logFile) {
		var logStream = fs.createWriteStream(opts.logFile, {flags: 'a'});
		proc.stdout.pipe(logStream);
		proc.stderr.pipe(logStream);
	}

	proc.on('close', function(code) {
		console.log(opts.name, 'exited with code ' + code);
		for (var i = 0; i < processes.length; i += 1) {
			processes[i].kill();
		}
		process.exit(code);
	});
	processes.push(proc);
}

/**
 * Always run meteor in production-like environment
 * since we do not want to reload changing files
 *
 * @param {*} callback
 */
function startApp(callback) {
	startProcess({
		name: 'Meteor App',
		command: 'meteor --production',
		waitForMessage: appOptions.waitForMessage,
		options: {
			cwd: srcDir,
			env: extend(appOptions.env, process.env)
		}
	}, callback);
}

/**
 * Start chimp
 */
function startChimp() {
	startProcess({
		name: 'Chimp',
		command: 'yarn run chimp-test'
	});
}

/**
 * Run meteor and then chimp after application has started
 */
function chimpNoMirror() {
	appOptions.waitForMessage = 'App running at:';
	startApp(function() {
		startChimp();
	});
}

chimpNoMirror();