#!/bin/bash
_watch_autocomplete() {
    local cur=${COMP_WORDS[COMP_CWORD]}
    COMPREPLY=( $(compgen -f -X '!*.ts' -- "$cur") )
}
complete -F _watch_autocomplete watch.sh