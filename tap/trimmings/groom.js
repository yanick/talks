const _ = require('lodash');
const fp = require('lodash/fp');
const fs = require('fs');

const spy = (...args) => { console.log(args); return args };

function markdownRefs(lines) {

    let refs = _.flow([
        fp.map( l => l.match( /^\[(.*?)\]: ([^ ]+)/ ) ),
        fp.compact,
        fp.map( l => [ l[1], l[2] ] ),
        fp.fromPairs,
    ])(lines);

    lines = fp.flow([
        fp.map( line => line.replace( /\[(.+?)\]\[(.*?)\]/g, ( match, name, token ) => {
            let key = token || name;
            let ref = refs[key];
            return ref ? `[${name}](${ ref })` : match;
        } ) )
    ])(lines);

    return lines;
}

function metacpan(lines) {
    return lines.map( line => line.replace( ": cpan://", ": https://www.metacpan.org/pod/" ) );
}

function npm(lines) {
    return lines.map( line => line.replace( ": npm://", ": https://www.npmjs.com/package/" ) );
}

function svg(lines) {
    return lines.map( line => line.replace( /^!\[\]\(([^)]+)\.svg\)/, 
        (m, cap ) => `<object data="${cap}.svg" type="image/svg+xml"></object>` ) );
}

function codeBlock(lines) {
    let inBlock = false 

    lines = _.flatten( lines.map( l => {
        let r = l.match( /^```(\.\/\S+)/ );
        if(!r) return l;

        file = fs.readFileSync(r[1]).toString().split("\n");

        l.substr( /^```\.\/.*?\./, '```' );

        return [ l, ...file ];
    }) );

    return lines.map( line => {

        let marked = [];

        if( line.match( /^```/ ) ) {
            if( inBlock ) {
                line = "</code></pre>";
            }
            else { 
                let m = line.match(/^\`\`\`(\w*)\s*([\d,]*)/);
                line  = `<pre><code data-trim data-noescape class='${m[1]}'>`; 
                marked = m[2].split(',');
            }
            inBlock = !inBlock;

            return line;
        }


        if(!inBlock) return line;

        marked = marked.map( l => l-1 );

        if ( marked[0] == 0 ) {
            marked.unshift();
            line = '<mark>' + line + '</mark>';
        }

        return line.replace( '#', '&#35;' );
    });
}

module.exports = async ( markdown, options ) => {
    var lines = markdown.split( "\n" );

    lines = codeBlock(lines);

    lines = svg(lines);
    lines = metacpan(lines);
    lines = npm(lines);

    lines = markdownRefs(lines);


    lines = lines.map( l => {
        if ( ! /^#/.test(l) ) return l;

        if( /#!/.test(l) ) {
            return l.replace('#!','#');
        }

        var is_vertical = /#(\^|v)/.test(l);

        l = l.replace( '#^', '#' );
        l = l.replace( '#v', '#' );

        l = l.replace( /^#+\s*$/, '' );

        return ( is_vertical ? 'vvv' : '>>>') + "\n\n" + l

    });

    lines = lines.map( line => {
        if( ! /^~ /.test(line) ) return line;

        return "<aside class='notes'>" + line.replace( /^~ /, '' ) + "</aside>";
    });

    let in_code = false;
    lines = lines.map( line =>{ 
        if ( /^```/.test(line) ) in_code = !in_code;

        return line.replace( /    /g, "\t" );
    });

    return lines.join("\n");

}
