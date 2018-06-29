1) install node: $ brew install nodejs
2) install node-canvas dependencies -- see https://github.com/Automattic/node-canvas/tree/v1.x
3) install mongodb ($ brew install mongodb), configure, run
4) $ npm install
5) Create lib/config/secrets.json and fill in secrets per environment
6) Create/populate lib/config/api-keys.json. See lib/config/sample-api-keys.json.
7) $ git submodule init && git submodule update
8) Start server. Logging is in bunyan format, so you probably want to pipe the output to bunyan if you are in a development environment. For example: $ nodemon | bunyan
