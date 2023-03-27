import express from "express";
const app = express();
app.use("/data", express.static("data", { dotfiles: "allow" }));
app.use("/assets", express.static("client/assets"));
app.use("/scripts", express.static("client/scripts"));
app.use(express.static("client/public"));

const defaultHeaders = {
	"X-XSS-Protection": "1; mode=block",
	"X-Frame-Options": "SAMEORIGIN",
	"Referrer-Policy": "same-origin"
};

app.get("/", (_req, res) => {
	for (const [key, value] of Object.entries(defaultHeaders))
		res.setHeader(key, value);
	res.sendFile("index.html", { root: "client" });
});

app.get("/discord", (_req, res) => {
	res.redirect(308, "https://discord.gg/jKQEVT7Vd3");
});

app.use((_req, res) => {
	res.status(404);
});

const server = app.listen(process.env.PORT || 8000, async () => {
	const info = <any>server.address();
	const port = info.port;
	console.log('OpenSurviv.io webserver listening at port %s', port);
});