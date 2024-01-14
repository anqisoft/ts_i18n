@ECHO OFF
set deno_json_path=%cd%\..\..\deno.json
cd ..\..\

deno bundle -c %deno_json_path% --no-check index.ts dist\index.js || pause

cd bat\
call compressJs.bat