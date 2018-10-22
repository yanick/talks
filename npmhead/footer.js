Reveal.addEventListener( 'ready', function( event ) {
    let footer = document.getElementsByTagName('footer')[0];

    console.log(footer);
    let sections = document.getElementsByClassName('slides')[0] ;

    sections.appendChild( footer );

    console.log( 'footsie', sections );
} );
