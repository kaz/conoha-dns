const _domainRequest = ["name", "ttl", "email", "description", "gslb"];
const _recordRequest = ["name", "type", "data", "priority", "ttl", "gslb_region", "gslb_weight", "gslb_check"];
const _domainResponse = ["id", "name", "ttl"];
const _recordResponse = ["id", "name", "type", "ttl", "data", "priority"];

const _createFilter = allow => obj => {
	const newObj = {};
	for(const key of allow){
		if(key in obj){
			newObj[key] = obj[key];
		}
	}
	return newObj;
};

module.exports = {
	domReq: _createFilter(_domainRequest),
	recReq: _createFilter(_recordRequest),
	domRes: _createFilter(_domainResponse),
	recRes: _createFilter(_recordResponse),
};