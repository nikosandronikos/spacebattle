if (process.argv.length != 3) {
	console.log(`usage: ${process.argv[0]} ${process.argv[1]} <jsFile>`);
	console.log('Where <jsFile> is the file to fix.');
	process.exit();
}

const fs = require('fs');
const readline = require('readline');

const jsFile = process.argv[2];
const rl = readline.createInterface({input: fs.createReadStream(jsFile)});

const mixinRe = /^var\s(\w+Mixin)\s=\s(exports\.\1\s=\s)?function\s\1\(superclass\)\s{$/;
const classRe = /(\s*)_inherits\(_class, _superclass\);$/;

let countdown = null;
let mixin = null;

rl.on('line', line => {
	if (results = line.match(mixinRe))
	{
		mixin = results[1];
		countdown = 2;
		console.log(line);
	} else if (countdown !== null) {
		if (--countdown == 0) {
			if (results = line.match(classRe)) {
				console.log(`${results[1]}_inherits(${mixin}, _superclass);`);
			} else {
				throw new Error('failed to find _inherits line');
			}
			countdown = null;
		} else {
			console.log(line);
		}
	} else {
		console.log(line);
	}
});
