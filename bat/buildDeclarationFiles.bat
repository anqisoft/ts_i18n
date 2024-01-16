@ECHO OFF
cd..
tsc --declaration -p .\ -t esnext --emitDeclarationOnly --outDir types\
pause