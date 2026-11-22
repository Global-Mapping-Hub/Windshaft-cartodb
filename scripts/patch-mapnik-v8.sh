#!/bin/sh
# @carto/mapnik 3.6.2 calls BooleanValue(context).ToChecked().
# Node.js 22 and later take an Isolate and return bool directly.
set -eu
root="${1:-node_modules/@carto/mapnik}"
if [ ! -d "$root/src" ]; then
    echo "mapnik sources not found at $root" >&2
    exit 1
fi
find "$root/src" -type f \( -name '*.cpp' -o -name '*.hpp' -o -name '*.h' \) -print0 \
    | xargs -0 sed -i 's/BooleanValue(Nan::GetCurrentContext())\.ToChecked()/BooleanValue(v8::Isolate::GetCurrent())/g'
