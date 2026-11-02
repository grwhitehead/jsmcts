#!/usr/bin/perl

sub usage() {
    print "extract-wins.pl [options]\n";
    print "\n";
    print "Options:\n";
    print "-h, --help           show this help message and exit\n";
    print "-v, --verbose        verbose output\n";
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

my $lastTurn = 0;

while (<>) {
    if (/^currentTurn ([0-9]+) /) {
        $lastTurn = $1;
    } elsif (/^winner ([0-9]+)$/) {
        print $lastTurn."\n";
        $lastTurn = 0;
    } elsif (/^draw$/) {
        print $lastTurn."\n";
        $lastTurn = 0;
    }
}
