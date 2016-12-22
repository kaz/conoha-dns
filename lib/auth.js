const fs = require("fs");
const path = require("path");
const https = require("https");
const promptly = require("promptly");

const makeClient = (hostname, headers = {}) => (method, path, data) => new Promise((resolve, reject) => {
	headers["Content-Type"] = "application/json";
	const req = https.request({method, path, hostname, headers});
	req.on("response", resp => {
		const data = [];
		resp.on("data", chunk => data.push(chunk));
		resp.on("end", _ => (resp.statusCode == 200 ? resolve : reject)(Buffer.concat(data).toString("utf8")));
	});
	req.on("error", reject);
	if(data){
		req.write(JSON.stringify(data));
	}
	req.end();
});

const ask = need => new Promise((resolve, reject) => {
	prompt.message = "";
	prompt.delimiter = ":";
	prompt.get(need, (err, result) => {
		if(err){
			reject(err);
		}
		resolve(result);
	});
});

const getSessionFilePath = _ => path.join(process.env.HOME || process.env.USERPROFILE, ".conoha-dns");

const getAuthorizedClient = json => {
	try {
		json = JSON.parse(json);
		if("access" in json){
			if(new Date() < new Date(json.access.token.expires)){
				return makeClient("dns-service.tyo1.conoha.io", {"X-Auth-Token": json.access.token.id});
			}
		}
	} catch(e) {}
	return null;
};

const auth = function*(opts){
	let json;
	try { json = fs.readFileSync(getSessionFilePath()); } catch(e) {}
	return getAuthorizedClient(json) || (yield directAuth(opts));
};
const directAuth = function*(opts){
	const need = [];
	if(!("tenant" in opts)){
		opts.tenant = yield promptly.prompt("Tenant ID: ");
	}
	if(!("user" in opts)){
		opts.user = yield promptly.prompt("API User: ");
	}
	if(!("password" in opts)){
		opts.password = yield promptly.password("Password: ");
	}
	const json = yield makeClient("identity.tyo1.conoha.io")("POST", "/v2.0/tokens", {
		auth: {
			passwordCredentials: {
				username: opts.user,
				password: opts.password
			},
			tenantId: opts.tenant
		}
	});
	const client = getAuthorizedClient(json);
	if(client){
		fs.writeFileSync(getSessionFilePath(), json);
		return client;
	}
	throw new Error("Failed to authorize");
};

module.exports = {
	getClient: function*(opts){
		return require("./client")(yield auth(opts))
	},
	authorize: function*(opts){
		return !!(yield directAuth(opts));
	}
};