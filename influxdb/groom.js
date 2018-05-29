module.exports = function(raw) {
    var lines = raw.split( "\n" );

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

    return lines.join("\n");

}
