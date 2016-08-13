class PokemonServer {
	login(authCode) {
		var server = this;
		return new Promise(function(resolve, reject) {
			$.ajax({
				url: "login",
				method: "post",
				dataType: "json",
				data: {googleAuthCode: authCode}
			})
			.done(function(data) {
				resolve(server.preprocessData(data));
			})
			.fail(function() {
				console.error(arguments);
				throw "Error happens while login";
			});
		});
	}

	refreshData() {
		var server = this;
		return new Promise(function(resolve, reject) {
			$.ajax({
				url: "refresh",
				dataType: "json",
			})
			.done(function(data) {
				if (data.expired) {
					//TODO: somehow this cannot be caught by Promise.catch, fix this bug
					throw "Client is expired, please login again";
				}
				resolve(server.preprocessData(data));
			});
		});
	}

	getData() {
		var server = this;
		return new Promise(function(resolve, reject) {
			$.ajax({
				url: "pogoData",
				dataType: "json"
			})
			.done(function(data) {
				resolve(server.preprocessData(data));
			});
		});
	}

	preprocessData(data) {
		data.pokemon.map(this.calculateIVPerfection).forEach(this.normalizeCreationTime);
		return data;
	}

	calculateIVPerfection(pokemon) {
		var ivTotal = pokemon.individual_attack + pokemon.individual_defense + pokemon.individual_stamina;
		pokemon.iv_perfection = ((ivTotal) / 45 * 100).toFixed(2);
		return pokemon
	}

	normalizeCreationTime(pokemon) {
		var creationTimeMs = pokemon.creation_time_ms;
		//`number >>> 0` will convert signed number to unsigner number, e.g. for `(-3).toString(2)`, you'll get `-11`.
		// but for `(-3 >>> 0).toString(2)`, you'll get its unsigned format value `11111111111111111111111111111101` 
		// Thanks http://stackoverflow.com/questions/16155592/negative-numbers-to-binary-string-in-javascript
		var normalizedTime = parseInt((creationTimeMs.high >>> 0).toString(16) + (creationTimeMs.low >>> 0).toString(16), 16);
		pokemon.caught_time = new Date(normalizedTime);
	}
}