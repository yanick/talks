use Test::More tests => 5;

pass;
pass "does the thing";
pass "does it well";

subtest "group of test", sub {
    pass "yay";
    fail "oh my";
};

{ 
    local $TODO = 'not implemented yet';
    fail "does that non-implemented thing";
}
