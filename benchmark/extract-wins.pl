#!/usr/bin/perl

sub usage() {
    print "extract-wins.pl [options]\n";
    print "\n";
    print "Options:\n";
    print "-h, --help           show this help message and exit\n";
    print "-v, --verbose        verbose output\n";
    print "-p, --player N       player (default 1)\n";
    print "--draw               draw (default win)\n";
    exit 1;
}

my $verbose = 0;
my $player = 1;
my $draw = 0;
my @args = ();

while ($#ARGV >= 0) {
    $_ = shift @ARGV;
    if (m/^-h$/ ||
        m/^--help$/)          { usage(); }
    elsif (m/^-v$/ ||
        m/^--verbose$/)       { $verbose = 1; }
    elsif (m/^-p$/ ||
        m/^--player$/)        { $player = shift @ARGV; }
    elsif (m/^--draw$/)       { $draw = 1; }
    elsif (m/^--$/)           { while ($#ARGV >= 0) { $_ = shift @ARGV; push @args, $_ } }
    elsif (m/^-./)            { print STDERR "invalid option: $_\n"; usage(); }
    else                      { push @args, $_ }
}

if (@args > 0) {
    print STDERR "invalid arguments: @args\n";
    usage();
}

while (<>) {
    if (/^winner ([0-9]+)$/) {
        if ($draw || $player != $1) {
            print "0\n";
        } else {
            print "1\n";
        }
    } elsif (/^draw$/) {
        if ($draw) {
            print "1\n";
        } else {
            print "0\n";
        }
    }
}
