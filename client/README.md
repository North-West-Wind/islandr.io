# Open Surviv.io
An open-source implementation of [surviv.io](https://surviv.io), a 2D battle royale game available online for free.

### Client
This repository is the client side code of Open Surviv.io. All assets (images, sounds) are stored here and rendering happens here.  
Assets are taken from [surviv.io's creator toolkit](https://drive.google.com/drive/folders/1qhaDdNCsisBu_7gvMNmyn_zkG4kyAZix) and will be re-created in SVG format eventually using Inkscape.

## Usage
The required JavaScript file is pre-compiled. It should be sufficient to just open the HTML file in a browser.  
Do note that you will need [opensurviv-server](https://github.com/North-West-Wind/opensurviv-server) to host a server.

### Requirements
Install [Node.js](https://nodejs.org) before hand.

### Instructions
You will only need to do this if you modified the code.

1. Clone this repository by either `git clone` or downloading as ZIP and extracting it.
2. Open your terminal and `cd` into the directory it is cloned.
3. Run `npm install` and `npm run build`.
4. Open `index.html` in a browser.

## Developer Guidelines
If you want to contribute to the project, you should create a fork and make PRs. Here are some notes to you:

1. Use `PascalCase` for naming classes, `camelCase` for naming variables and `snake_case` for naming files. This is done to stay consistent with my code. Sorry if you don't like these naming conventions. Commit messages need not be consistent, but should be readable.
2. Add comments. It's good to be detailed.
3. If possible, re-create assets (textures, sound, music), so we can maybe not get copystriked. It hasn't happened yet, but I am a bit worried.

## The Story Behind
[surviv.io](https://surviv.io) has existed since 2017. It was at first quite popular, and really fun, until the initial developers, Justin Kim and Nick Clark, sold it to Kongregate (Kong) in March 2020. Unfortunately, Kong did not pay enough attention to their acquisition, and ended up just squeezing profits from [surviv.io](https://surviv.io) in the mobile market.

### Cheaters
And finally, competitors show up. Ice Hacks is currently the most active group that is developing the Surviv.io Cheat Injector. Even more infuriating is that, Ice Hacks is actually from the team of victorr.io, and their game is even worse. Those people ruined [surviv.io](https://surviv.io). So, just don't play victorr.io, or play with an adblock at least.

This is one of the reasons I decided to start this project. I hope by being open-source, others can contribute a lot more to stop cheaters, rather than watching the game dying.

### Mods
Another thing I believe that can keep a game alive, are mods. There are plenty of examples, especially with Nintendo games. The Nintendo Wii has ended their online connection support years ago, but yet Mario Kart Wii is still fairly popular thanks to the community's contribution by custom tracks and game modes.

Same thing goes with [surviv.io](https://surviv.io). Once this project is finished, you will be able to fork this project and put your own codes into it. Custom game modes with more variety will appear and keep the game fun.

## License
GPL v3
