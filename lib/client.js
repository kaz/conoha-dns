const filter = require("./filter");

module.exports = api => {
	const exportDomain = function*(fqdn){
		const json = yield listDomain();
		const rest = fqdn.split(".");
		let domain = "";
		while(rest.length){
			domain = `${rest.pop()}.${domain}`;
			if(json.domains.some(item => item.name == domain)){
				return domain.slice(0, -1);
			}
		}
		return domain.slice(0, -1);
	};
	const findDomainID = function*(domainName){
		const json = yield listDomain();
		for(const item of json.domains){
			if(item.name == domainName){
				return item.id;
			}
		}
		return null;
	};
	const findRecordID = function*(domainID, recordName){
		const json = yield listRecord({domain: domainID});
		for(const item of json.records){
			if(item.name == recordName){
				return item.id;
			}
		}
		return null;
	};
	
	let dCache;
	const listDomain = function*(opts){
		return dCache || (dCache = yield api("GET", `/v1/domains`));
	};
	const addDomain = function*(opts){
		dCache = null;
		return yield api("POST", `/v1/domains`, filter.domReq(opts));
	};
	const updateDomain = function*(opts){
		dCache = null;
		return yield api("PUT", `/v1/domains/${opts.domain}`, filter.domReq(opts));
	};
	const removeDomain = function*(opts){
		dCache = null;
		return yield api("DELETE", `/v1/domains/${opts.domain}`);
	};
	
	const rCache = {};
	const listRecord = function*(opts){
		return opts.domain in rCache ? rCache[opts.domain] : (rCache[opts.domain] = yield api("GET", `/v1/domains/${opts.domain}/records`));
	};
	const addRecord = function*(opts){
		rCache[opts.domain] = undefined;
		return yield api("POST", `/v1/domains/${opts.domain}/records`, filter.recReq(opts));
	};
	const updateRecord = function*(opts){
		rCache[opts.domain] = undefined;
		return yield api("PUT", `/v1/domains/${opts.domain}/records/${opts.record}`, filter.recReq(opts));
	};
	const removeRecord = function*(opts){
		rCache[opts.domain] = undefined;
		return yield api("DELETE", `/v1/domains/${opts.domain}/records/${opts.record}`);
	};
	
	return {
		exportDomain, findDomainID, findRecordID,
		listDomain, addDomain, updateDomain, removeDomain,
		listRecord, addRecord, updateRecord, removeRecord,
	};
};