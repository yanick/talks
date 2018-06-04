#!/usr/bin/env perl 

use 5.10.0;

use strict;
use warnings;

use Text::Markdown 'markdown';

use Dancer ':syntax';

get '/' => sub {
    state $prez = join '', <>;
    markdown( $prez );
};

dance;
