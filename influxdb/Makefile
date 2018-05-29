run:
	./node_modules/.bin/reveal-md --watch --disable-auto-open --preprocessor groom.js  slides.mkd

static:
	./node_modules/.bin/reveal-md  --preprocessor groom.js --static static --static-dirs public/ slides.md

install:
	yarn add reveal-md
