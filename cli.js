#!/usr/bin/env node

const co = require("co");
const cla = require("command-line-args");
const clc = require("command-line-commands");
require("console.table");

const auth = require("./lib/auth");
const usage = require("./lib/usage");
const filter = require("./lib/filter");

const {command, argv} = clc([null, "help", "auth", "list", "add", "remove", "update"]);

const opts = cla([
	// auth
	{name: "tenant", alias: "T", type: String},
	{name: "user", alias: "U", type: String},
	{name: "password", alias: "P", type: String},
	
	// domain, record
	{name: "name", alias: "n", type: String, defaultOption: true},
	{name: "ttl", defaultValue: 3600, type: Number},
	{name: "description", type: String},
	
	// domain
	{name: "email", alias: "e", defaultValue: "postmaster@example.org", type: String},
	{name: "gslb", type: Number},
	
	// record
	{name: "type", alias: "t", type: String},
	{name: "data", alias: "d", type: String},
	{name: "priority", alias: "p", defaultValue: 10, type: Number},
	{name: "gslb_region", type: String},
	{name: "gslb_weight", type: Number},
	{name: "gslb_check", type: Number},
	
	// switch
	{name: "domain", type: String},
	{name: "record", type: String},
	{name: "verbose", alias: "v", type: Boolean},
], argv);

const show = data => {
	data = JSON.parse(data);
	const keys = Object.keys(data);
	if(keys.length == 1){
		data = data[keys[0]];
	}else{
		data = [data];
	}
	if("verbose" in opts){
		console.log(data);
	}else{
		console.table(data.map(filter["domain_id" in data[0] ? "recRes" : "domRes"]));
	}
};
const necessary = keys => {
	for(const key of keys){
		if(!Object.keys(opts).some(item => item == key)){
			throw new Error(`No ${key} specified.`);
		}
	}
};

co(function*(){
	if(command === "auth"){
		yield auth.authorize(opts);
		return console.log("OK");
	}
	
	const client = yield auth.getClient(opts);
	
	if("name" in opts){
		if(!("domain" in opts)){
			opts.domain = yield client.exportDomain(opts.name);
		}
		if(!("record" in opts)){
			opts.record = opts.domain == opts.name ? null : opts.name;
		}
		opts.name += ".";
	}
	if(opts.domain && /\./.test(opts.domain)){
		opts.domain += ".";
		opts.domain = yield client.findDomainID(opts.domain);
	}
	if(opts.domain && opts.record && /\./.test(opts.record)){
		opts.record += ".";
		opts.record = yield client.findRecordID(opts.domain, opts.record);
	}
	
	if(opts.domain && opts.record){
		if(command == "update"){
			necessary(["type", "data"]);
			show(yield client.updateRecord(opts));
		}else if(command == "remove"){
			yield client.removeRecord(opts);
			console.log("OK");
		} 
	}else if(opts.domain){
		if(command == "list"){
			show(yield client.listRecord(opts));
		}else if(command == "add"){
			necessary(["type", "data"]);
			show(yield client.addRecord(opts));
		}else if(command == "update"){
			necessary(["name"]);
			show(yield client.updateDomain(opts));
		}else if(command == "remove"){
			yield client.removeDomain(opts);
			console.log("OK");
		}
	}else{
		if(command == "list"){
			show(yield client.listDomain(opts));
		}else if(command == "add"){
			necessary(["name"]);
			show(yield client.addDomain(opts));
		}else{
			console.log(usage);
		}
	}
}).catch(e => console.error(e));
