#!/usr/bin/perl

sub usage() {
    print "extract-holdtotals.pl [options]\n";
    print "\n";
    print "Options:\n";
    print "-h, --help           show this help message and exit\n";
    print "-v, --verbose        verbose output\n";
    print "-p, --player N       player (default 1)\n";
    exit 1;
}

my $verbose = 0;
my $player = 1;
my $threed = 0;
my @args = ();

while ($#ARGV >= 0) {
    $_ = shift @ARGV;
    if (m/^-h$/ ||
        m/^--help$/)          { usage(); }
    elsif (m/^-v$/ ||
        m/^--verbose$/)       { $verbose = 1; }
    elsif (m/^-p$/ ||
        m/^--player$/)        { $player = shift @ARGV; }
    elsif (m/^--$/)           { while ($#ARGV >= 0) { $_ = shift @ARGV; push @args, $_ } }
    elsif (m/^-./)            { print STDERR "invalid option: $_\n"; usage(); }
    else                      { push @args, $_ }
}

if (@args > 0) {
    print STDERR "invalid arguments: @args\n";
    usage();
}

while (<>) {
    chomp;
    my @a = split /,/;
    if ($a[0] == $player && $a[4] eq "HOLD") {
        print $a[$player].",".$a[3-$player].",".$a[3]."\n";
    }
}
