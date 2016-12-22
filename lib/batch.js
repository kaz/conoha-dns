const fs = require("fs");
const path = require("path");
const glob = require("glob");
const ip = require("public-ip");

module.exports = client => {
	const nginx = function*(opts){
		const items = [];
		const dir = "directory" in opts ? opts.directory : path.dirname(opts.file);
		const read = file => {
			const content = fs.readFileSync(file, "utf-8");
			content.replace(/include\s+"?(.+?)"?;/g, (m, load) => glob.sync(path.join(dir, load)).forEach(read));
			content.replace(/[^$]server_name(.+?);/g, (m, names) => names.replace(/"/g, "").split(/\s/).forEach(item => items.push(item)));
			return items;
		};
		
		if(!opts.A){
			opts.A = yield ip.v4();
		}
		if(!opts.AAAA){
			opts.AAAA = yield ip.v6();
		}
		
		const rmJobs = [];
		const addJobs = [];
		for(let name of read(opts.file).filter((item, index) => items.indexOf(item) === index).filter(item => /\./.test(item))){
			let domain = (yield client.exportDomain(name)).replace(/[^.]$/, "$&.");
			name = `${name}.`.replace(/^\./, "*.");
			
			if(domain == name){
				domain = name.split(".").slice(-3).join(".");
				if(!(yield client.findDomainID(domain))){
					yield client.addDomain({name: domain, email: opts.email, ttl: opts.ttl});
				}
			}
			domain = yield client.findDomainID(domain);
			
			const records = yield client.listRecord({domain});
			records.records
				.filter(record => record.name == name && (record.type == "A" || record.type == "AAAA" || record.type == "CNAME"))
				.map(record => record.id)
				.forEach(record => rmJobs.push({domain, record}));
				
			if(opts.A !== "null"){
				addJobs.push({domain, name, type: "A", data: opts.A, ttl: opts.ttl});
			}
			if(opts.AAAA !== "null"){
				addJobs.push({domain, name, type: "AAAA", data: opts.AAAA, ttl: opts.ttl});
			}
		}
		
		for(const job of rmJobs){
			console.log(`remove:\t${job.record}`);
			yield client.removeRecord(job);
		}
		for(const job of addJobs){
			console.log(`add:\t${job.name}\t${job.type}\t${job.data}`);
			yield client.addRecord(job);
		}
	};
	
	return {nginx};
};