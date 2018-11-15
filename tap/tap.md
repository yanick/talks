---
title: Drinking from the TAP
author: Yanick Champoux <yanick@babyl.ca> @yenzie
separator: '>>>'
verticalSeparator: 'vvv'
notesSeparator: '!!!'
theme: black
---

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

##

```./includes/tap.tap 
```

###

```./includes/tap.tap 1
```

###

```tap
1..5
ok 1
ok 2 - does the thing
ok 3 - does it well
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
not ok 5 - does that non-implemented thing # TODO not implemented yet
#   Failed (TODO) test 'does that non-implemented thing'
#   at lab/test.t line 14.
# Looks like you failed 1 test of 5.
```


## test plan 

    1..5

can be at the beginning or end of stream


## TODO 

TODO and SKIP

getting started; OO / Moose; web frameworks; mock objects and related advanced topics. 

prove

    - keep database 
    - run failed first

- Progressive style 


[TAP]: https://testanything.org/

<script src="./public/reveal-code-focus.js"></script>
