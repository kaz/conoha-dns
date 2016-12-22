const fs = require("fs");
const path = require("path");
const https = require("https");
const promptly = require("promptly");

const makeClient = (hostname, headers = {}) => (method, path, data) => new Promise((resolve, reject) => {
	headers["Content-Type"] = "application/json";
	const req = https.request({method, path, hostname, headers});
	req.on("response", resp => {
		const data = [];
		const callback = resp.statusCode == 200 ? resolve : reject;
		
		resp.on("data", chunk => data.push(chunk));
		resp.on("end", _ => {
			const val = Buffer.concat(data).toString("utf8");
			if(/application\/json/.test(resp.headers["content-type"])){
				callback(JSON.parse(val));
			}else{
				callback(val);
			}
		});
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
	try { json = JSON.parse(fs.readFileSync(getSessionFilePath())); } catch(e) {}
	return getAuthorizedClient(json) || (yield directAuth(opts));
};
const directAuth = function*(opts){
	const need = [];
	if(!opts.tenant){
		opts.tenant = yield promptly.prompt("Tenant ID: ");
	}
	if(!opts.user){
		opts.user = yield promptly.prompt("API User: ");
	}
	if(!opts.password){
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
		fs.writeFileSync(getSessionFilePath(), JSON.stringify(json));
		return client;
	}
	throw new Error("Failed to authorize");
};

const getClient = function*(opts){
	return require("./client")(yield auth(opts));
};
const getBatchClient = function*(opts){
	return require("./batch")(yield getClient(opts));
};
const authorize = function*(opts){
	return !!(yield directAuth(opts));
};

module.exports = {getClient, getBatchClient, authorize};
