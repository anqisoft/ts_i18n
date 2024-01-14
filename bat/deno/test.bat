@ECHO OFF
cd ..\..\test\
deno lint index.ts && deno fmt index.ts && deno run -A index.ts
pause