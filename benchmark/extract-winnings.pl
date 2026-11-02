#!/usr/bin/perl

sub usage() {
    print "extract-winnings.pl [options]\n";
    print "\n";
    print "Options:\n";
    print "-h, --help           show this help message and exit\n";
    print "-v, --verbose        verbose output\n";
    print "-p, --player N       player (default 1)\n";
    exit 1;
}

my $verbose = 0;
my @args = ();

while ($#ARGV >= 0) {
    $_ = shift @ARGV;
    if (m/^-h$/ ||
        m/^--help$/)          { usage(); }
    elsif (m/^-v$/ ||
        m/^--verbose$/)       { $verbose = 1; }
    elsif (m/^--$/)           { while ($#ARGV >= 0) { $_ = shift @ARGV; push @args, $_ } }
    elsif (m/^-./)            { print STDERR "invalid option: $_\n"; usage(); }
    else                      { push @args, $_ }
}

if (@args > 0) {
    print STDERR "invalid arguments: @args\n";
    usage();
}

while (<>) {
    if (/^winnings (-?[0-9.]+)$/) {
        print $1."\n";
    }
}
