@ECHO OFF
cd..
del /s/q/f types\*.d.ts
tsc --declaration -p .\ -t esnext --emitDeclarationOnly --outDir types & pause
if exist  types\src\ (move types\src\*.d.ts types\ && rd types\src\)
pause