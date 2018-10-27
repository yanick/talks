package MyTemplate;

use 5.20.0;


use Template::Caribou;
use Template::Caribou::Tags::HTML ':all';

use experimental 'signatures';

has name => ( is => 'ro' );

template main => sub($self) {
    $self->head_section;
    $self->body_section;
};

template head_section => sub {
    head { 
        title { 'my title' };
    }
};

template body_section => sub($self) {
    body { 
        div { $_{class}{greeting} = 1;
        "hi " . $self->name;
    }
    }
};

say MyTemplate->new( name => 'yanick' )->main;
