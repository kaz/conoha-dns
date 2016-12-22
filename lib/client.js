const filter = require("./filter");

module.exports = api => {
	const exportDomain = function*(fqdn){
		const json = JSON.parse(yield listDomain());
		const rest = fqdn.split(".");
		let domain = "";
		while(rest.length){
			domain = `${rest.pop()}.${domain}`;
			if(json.domains.some(item => item.name == domain)){
				return domain.slice(0, -1);
			}
		}
		return domain;
	};
	const findDomainID = function*(domainName){
		const json = JSON.parse(yield listDomain());
		for(const item of json.domains){
			if(item.name == domainName){
				return item.id;
			}
		}
		return null;
	};
	const findRecordID = function*(domainID, recordName){
		const json = JSON.parse(yield listRecord({domain: domainID}));
		for(const item of json.records){
			if(item.name == recordName){
				return item.id;
			}
		}
		return null;
	};
	
	let cache;
	const listDomain = function*(opts){
		return cache || (cache = yield api("GET", `/v1/domains`));
	};
	const addDomain = function*(opts){
		return yield api("POST", `/v1/domains`, filter.domReq(opts));
	};
	const updateDomain = function*(opts){
		return yield api("PUT", `/v1/domains/${opts.domain}`, filter.domReq(opts));
	};
	const removeDomain = function*(opts){
		return yield api("DELETE", `/v1/domains/${opts.domain}`);
	};
	
	const listRecord = function*(opts, domain){
		return yield api("GET", `/v1/domains/${opts.domain}/records`);
	};
	const addRecord = function*(opts, domain){
		return yield api("POST", `/v1/domains/${opts.domain}/records`, filter.recReq(opts));
	};
	const updateRecord = function*(opts, domain){
		return yield api("PUT", `/v1/domains/${opts.domain}/records/${opts.record}`, filter.recReq(opts));
	};
	const removeRecord = function*(opts, domain){
		return yield api("DELETE", `/v1/domains/${opts.domain}/records/${opts.record}`);
	};
	
	return {
		exportDomain, findDomainID, findRecordID,
		listDomain, addDomain, updateDomain, removeDomain,
		listRecord, addRecord, updateRecord, removeRecord,
	};
};