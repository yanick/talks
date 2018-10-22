const config = {
    markdown_file: './tpm-2018-10.md'
};

const { run } = require('runjs');
const glob = require('glob-fs')();


async function showtime () {
    run( `node_modules/.bin/reveal-md --watch --preprocessor groom.js --css style.css ${ config.markdown_file }`, { async: true } );  
}

async function graphs () {
    let files = await glob.readdirPromise( 'graphs/*.mmd' );

}

module.exports = {
    showtime
};
