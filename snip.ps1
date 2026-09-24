#!/usr/bin/env pwsh
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
node "$dir/cli.js" @args
