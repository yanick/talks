---
title: Drinking from the TAP
author: Yanick Champoux <yanick@babyl.ca> @yenzie
separator: '>>>'
verticalSeparator: 'vvv'
notesSeparator: '!!!'
theme: black
---

<!-- .slide: data-background-image="./public/tap.png" -->
<!-- .slide: data-background-opacity="0.35" -->
<!-- .slide: data-background-position="left 20px" -->
<!-- .slide: data-background-size="800px" -->

<footer>
<object 
    class="logo"
    data="./public/github.svg" type="image/svg+xml">
</object> [yanick](https://github.com/yanick) <object 
    class="logo"
    data="./public/twitter.svg" type="image/svg+xml">
</object> [yenzie](https://twitter.com/yenzie)
</footer>

<h2>Drinking from the TAP</h2>

Yanick Champoux 

<object 
    class="logo"
    data="./public/github.svg" type="image/svg+xml">
</object> [yanick](https://github.com/yanick) <object 
    class="logo"
    data="./public/twitter.svg" type="image/svg+xml">
</object> [yenzie](https://twitter.com/yenzie)

for Toronto.pm, November 29th, 2018

# TAP 

## [Test Anything Protocol][TAP]

###

```tap
1..3
ok 1
ok 2 - does the thing
not ok 3 - does it well
    #   Failed test 'does it well'
    #   at lab/test.t line 9.
# Looks like you failed 1 test of 3.
```

<p class="fragment current-only" data-code-focus="1">test plan</p>
<p class="fragment current-only" data-code-focus="2">success. :-) </p>
<p class="fragment current-only" data-code-focus="3">with description! 8-D</p>
<p class="fragment current-only" data-code-focus="4">failed :-(</p>
<p class="fragment current-only" data-code-focus="5-7">comments</p>

## subtest 

    # Subtest: group of test
        ok 1 - yay
        not ok 2 - oh my
        #   Failed test 'oh my'
        #   at lab/test.t line 9.
        1..2
        # Looks like you failed 1 test of 2.
    not ok 4 - group of test
    #   Failed test 'group of test'
    #   at lab/test.t line 10.

<p class="fragment current-only" data-code-focus="2-7">sub-stream</p>
<p class="fragment current-only" data-code-focus="1,8">aggregate result</p>

## todo

    not ok 5 - does that other thing # TODO not implemented yet
    #   Failed (TODO) test 'does that other thing'
    #   at lab/test.t line 14.

## skipping

```
ok 6 # skip windows only
```

## Write our first test
 
##  `./t/basic.t`

## 

```
use Test::More tests => 1;

if ( 1 + 1 == 2 ) {
    pass "success!";
}
else {
    fail "oh noes";
}

```

```
1..1
ok 1 - success!
```

## 

```
use Test::More tests => 1;

if ( 1 + 1 == 3 ) {
    pass "success!";
}
else {
    fail "oh noes";
}
```

```
1..1
not ok 1 - oh noes
#   Failed test 'oh noes'
#   at t/basic.t line 7.
# Looks like you failed 1 test of 1.
```

##

```
use Test::More tests => 2;

if ( 1 + 1 == 3 ) {
    pass "success!";
}
else {
    fail "oh noes";
}
```

```
1..2
ok 1 - success!
# Looks like you planned 2 tests but ran 1.
```

##v

```
use Test::More;

plan tests => 2;

if ( 1 + 1 == 3 ) {
    pass "success!";
}
else {
    fail "oh noes";
}
```

##v

```
use Test::More;

if ( 1 + 1 == 3 ) {
    pass "success!";
}
else {
    fail "oh noes";
}

done_testing;
```

```
ok 1 - success!
1..1

```

## sugar time

## ok 

```
ok 1 + 1 == 2, "math works";
ok 1 + 7 == 10, "it's in hex, right?";
```

    ok 1 - math works
    not ok 2 - it's in hex, right?
    #   Failed test 'it's in hex, right?'
    #   at t/basic.t line 4.
    1..2
    # Looks like you failed 1 test of 2.


## is

```
is 1 + 1 => 2, "math works";
is 1 + 7 => 10, "it's in hex, right?";
```

    ok 1 - math works
    not ok 2 - it's in hex, right?
    #   Failed test 'it's in hex, right?'
    #   at t/basic.t line 4.
    #          got: '8'
    #     expected: '10'

## isnt

```
isnt "what it seems" => "what it seems";
```

    #   Failed test at t/basic.t line 3.
    #          got: 'what it seems'
    #     expected: anything else


## cmp_ok


```
cmp_ok 1 + 3, '>', 5,  "13 > 5, obviously";
```

    not ok 1 - 13 > 5, obviously
    #   Failed test '13 > 5, obviously'
    #   at t/basic.t line 3.
    #     '4'
    #         >
    #     '5'

## like / unlike

```
like $talk, qr/TAP/, "I mention TAP";
```

## is_deeply

```
is_deeply $struct, { foo => [ 'bar', 'baz' ] };
```

## subtests

```
subtest "group name" => sub {
    plan tests => 2;

    ok foo();
    like bar(), qr/something/;
};
```

if no plan, implicit 'done_testing';

## diag / explain 

```
my $struct = [ 1,0,2 ];
ok foo($struct)
    or diag "the input is ", explain $struct;
```


    not ok 1
    #   Failed test at t/basic.t line 6.
    # the input is [
    #   1,
    #   0,
    #   2
    # ]


## todo 

```
{
    local $TODO = "bug, see GH#123";
    ok foo(), "should return a true value";
}
```


## skip 

```
SKIP : {
    skip "doesn't work on Sunday", 2 unless (localtime)[3];         
    ok foo();
    ok bar();
}
```

## How to run it?

    perl t/basic.t 

## `prove`

    $ prove -l t

    $ perl -I lib t/**.t

## parallel runs 

    $ prove -j4 -l t

## state 

    $ prove --state=save -l t

    $ prove --state=failed,save

save, last, failed, passed, all 

hot, todo 

slow, fast 

new, old, fresh 

##v 

    $ prove --state=hot,new,fast,save


## Useful Test::* modules 


### Test::Deep

    use Test::Deep;

    cmp_deeply(
        $thing,
        {
            foo  => superhashof({ quux => 1 }),
            bar => [ "a", ignore() ],
        },
    )

### Test::Exception

    use Test::Exception;

    throws_ok {
        $foo->go_kabloomey;
    } qr/KA-BLO+M/, 'goes boom';

### Test::Warnings 

    use Test::Warnings;

    ok 'yay';

    done_testing;

&nbsp;

        ok 1 - yay!
        ok 2 - no (unexpected) warnings (via done_testing)
        1..2

### Test::Perl::Critic::Progressive 

    use Test::Perl::Critic::Progressive
        qw( progressive_critic_ok );

    progressive_critic_ok();

### Test::WWW::Mechanize

```
use Test::WWW::Mechanize;

my $agent = Test::WWW::Mechanize->new'

$agent->get_ok( 'http://techblog.babyl.ca' );
$agent->title_like( qr/hacking thy fearful symmetry/ );

```


## Mocking 

### Test::MockObject

      use Test::MockObject;

      my $mock = Test::MockObject->new;

      $mock->set_true( 'is_foo')
           ->set_false( 'does_bar' )
           ->set_series( 'quux', 'a', 'b', 'c' );

### Test::MockObject::Extends;

    my $faked = Test::MockObject::Extends->new( $object );

    $faked->set_true( 'fetch_from_network' );
    $faked->set_always( 'readdir', [  './a.txt' ] );

### Test::Class::Moose

    package TestsFor::MyThing;

    use Test::Class::Moose;

    has fixture => (
        is => 'ro',
        default => sub {
            ...
        },
    );
    
    sub foo($test) :Tests(1) {
        ok $fixture->quux;
    }
    


## THANK YOU

Questions?


[TAP]: https://testanything.org/

<script src="./public/reveal-code-focus.js"></script>
