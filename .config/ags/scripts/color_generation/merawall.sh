#!/usr/bin/env bash

XDG_CONFIG_HOME="${XDG_CONFIG_HOME:-$HOME/.config}"
CONFIG_DIR="$XDG_CONFIG_HOME/ags"
WALLPAPER_DIR="/home/gaurish/Pictures/Shuffle"  # Change this to your preferred directory

switch() {
    imgpath=$1
    read scale screenx screeny screensizey < <(hyprctl monitors -j | jq '.[] | select(.focused) | .scale, .x, .y, .height' | xargs)
    cursorposx=$(hyprctl cursorpos -j | jq '.x' 2>/dev/null) || cursorposx=960
    cursorposx=$(bc <<< "scale=0; ($cursorposx - $screenx) * $scale / 1")
    cursorposy=$(hyprctl cursorpos -j | jq '.y' 2>/dev/null) || cursorposy=540
    cursorposy=$(bc <<< "scale=0; ($cursorposy - $screeny) * $scale / 1")
    cursorposy_inverted=$((screensizey - cursorposy))

    if [ "$imgpath" == '' ]; then
        echo 'Aborted'
        exit 0
    fi

    swww img "$imgpath" --transition-step 100 --transition-fps 120 \
        --transition-type grow --transition-angle 30 --transition-duration 1 \
        --transition-pos "$cursorposx, $cursorposy_inverted"
}

random_wallpaper() {
    # Get a random image from the wallpaper directory
    imgpath=$(find "$WALLPAPER_DIR" -type f \( -iname "*.jpg" -o -iname "*.png" -o -iname "*.jpeg" \) | shuf -n 1)
    if [ -n "$imgpath" ]; then
        switch "$imgpath"
        "$CONFIG_DIR"/scripts/color_generation/colorgen.sh "${imgpath}" --apply --smart
    else
        echo "No wallpapers found in $WALLPAPER_DIR"
        exit 1
    fi
}

# Main execution
if [ "$1" == "--noswitch" ]; then
    imgpath=$(swww query | awk -F 'image: ' '{print $2}')
elif [ "$1" == "--random" ]; then
    # Run indefinitely, changing wallpaper every minute
    while true; do
        random_wallpaper
        sleep 60  # Wait 60 seconds (1 minute)
    done
elif [[ "$1" ]]; then
    switch "$1"
else
    # Original manual selection
    cd "$(xdg-user-dir PICTURES)" || return 1
    switch "$(yad --width 1200 --height 800 --file --add-preview --large-preview --title='Choose wallpaper')"
    imgpath=$(swww query | awk -F 'image: ' '{print $2}')
    "$CONFIG_DIR"/scripts/color_generation/colorgen.sh "${imgpath}" --apply --smart
fi