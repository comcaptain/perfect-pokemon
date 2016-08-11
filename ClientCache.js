function ClientCache() {
	this.clients = [];
	this.size = 100;
}

ClientCache.prototype.addClient = function(client) {
	while (this.clients.length >= this.size) this.clients.shift();
	var randomString = Math.random().toString(36);
	this.clients.push({data: client, key: randomString});
	return randomString;
}

ClientCache.prototype.getClient = function(key) {
	for (var i = 0; i < this.clients.length; i++) {
		var client = this.clients[i];
		if (client.key === key) return client.data;
	}
	return null;
}

module.exports = ClientCache;