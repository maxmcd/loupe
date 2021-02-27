



update:
	make -j yarn_loupe_browser yarn_loupe_extension

yarn_loupe_extension:
	cd loupe-extension && yarn
yarn_loupe_browser:
	cd loupe-browser && yarn


run_extension:
	code --extensionDevelopmentPath=$$(pwd)/loupe-extension .
	cd loupe-extension && npm run watch

run_loupe_browser:
	cd loupe-browser && make run

run:
	make -j run_extension run_loupe_browser
