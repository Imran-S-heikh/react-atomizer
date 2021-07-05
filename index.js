#!/usr/bin/env node

const Atomizer = require('atomizer');
const fs = require('fs');
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv;
const chokidar = require('chokidar');
const path = require('path');

const atomizer = new Atomizer({ verbose: true });
const regexp = /className=(("[^"]*")|('[^']*')|({[^}]*}))/g;



const defaultConfig = {
    "breakPoints": {
        'sm': '@media(min-width:750px)',
        'md': '@media(min-width:1000px)',
        'lg': '@media(min-width:1200px)'
    },
    "custom": {
    },
};

const { config, output, build } = argv;
const configObject = require(path.resolve(config));
const outputPath = path.resolve(output);

const watcher = chokidar.watch(path.resolve('./src/**/*.tsx'));



if (build) {
    watcher.on('add', path=>readCssAndWrite(path));
    watcher.on('ready',()=>{
        watcher.close().then(() => console.log('Build Successfully!'));
    })
} else {
    watcher.on('add', path=>readCssAndWrite(path));
    watcher.on('change', path => readCssAndWrite(path));
}

function readCssAndWrite(path) {
    fs.readFile(path, 'utf-8', (err, data) => {
        if (!err) {
            handleData(data);
        }
    });
}

function handleData(data) {
    const classes = data.match(regexp);

    if (classes) {
        const foundClasses = atomizer.findClassNames(classes.join());

        const finalConfig = atomizer.getConfig(foundClasses, configObject ? configObject : defaultConfig);

        const css = atomizer.getCss(finalConfig);

        fs.writeFile(outputPath,css,(err)=>{
            if (err) {
                console.log(err);
            }
        })
    }
}