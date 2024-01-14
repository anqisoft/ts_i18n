@echo off
cd ..\dist\
start /B "Compressing %cd%\index.js by uglifyjs." uglifyjs index.js -m -o index.min.js
exit

:: npm install uglify-js -g

:: uglifyjs --help
:: * -o, ¨Coutput [string]
:: * -b, ¨Cbeautify [string]
:: * -m, ¨Cmangle [string]
:: uglifyjs lazyLoad.js -m -o lazyLoad.min.js

:: git clone git://github.com/mishoo/UglifyJS2.git