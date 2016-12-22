const clu = require("command-line-usage");
const pkg = require("../package");

module.exports = clu([{
	header: `${pkg.name} v${pkg.version}`,
	content: pkg.description
}, {
	header: "Synopsis",
	content: "$ conoha-dns <command> <options> [domain or record name]"
}, {
	header: "Commands",
	content: [
		{name: "help", summary: "Show this message."},
		{name: "auth", summary: "Authenticate a user."},
		{name: "list", summary: "Show domains or records."},
		{name: "add", summary: "Create a domain or record."},
		{name: "remove", summary: "Delete a domain or record."},
		{name: "update", summary: "Renew a domain or record."},
		{name: "nginx", summary: "Auto setting with nginx config file."},
	]
}, {
	header: "Auth options",
	optionList: [
		{name: "tenant", alias: "T", type: String},
		{name: "user", alias: "U", type: String},
		{name: "password", alias: "P", type: String},
	]
}, {
	header: "Domain/Record options",
	optionList: [
		{name: "name", alias: "n", type: String, defaultOption: true},
		{name: "ttl", defaultValue: 3600, type: Number},
		{name: "description", type: String},
	]
}, {
	header: "Domain options",
	optionList: [
		{name: "email", alias: "e", defaultValue: "postmaster@example.org", type: String},
		{name: "gslb", type: Number},
	]
}, {
	header: "Record options",
	optionList: [
		{name: "type", alias: "t", type: String},
		{name: "data", alias: "d", type: String},
		{name: "priority", alias: "p", type: Number},
		{name: "gslb_region", type: String},
		{name: "gslb_weight", type: Number},
		{name: "gslb_check", type: Number},
	]
}, {
	header: "Batch options",
	optionList: [
		{name: "file", alias: "f", type: String, description: "Config file path."},
		{name: "directory", alias: "D", type: String, description: "Config file directory."},
		{name: "A", type: String, description: "A record data."},
		{name: "AAAA", type: String, description: "AAAA record data."},
	]
}, {
	header: "Misc",
	optionList: [
		{name: "domain", type: String, description: "Use domain name or id."},
		{name: "record", type: String, description: "Use record name or id."},
		{name: "verbose", alias: "v", type: Boolean, description: "Show full response."},
	]
}]);
