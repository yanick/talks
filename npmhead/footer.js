
options.dependencies[3].callback = function() { hljs.initHighlightingOnLoad(); };

Reveal.addEventListener( 'ready', function( event ) {
    let footer = document.getElementsByTagName('footer')[0];

    let sections = document.getElementsByClassName('slides')[0] ;

    sections.appendChild( footer );
} );
