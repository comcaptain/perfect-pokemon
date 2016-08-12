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
		data.pokemon.forEach(this.calculateIVPerfection);
		return data;
	}

	calculateIVPerfection(pokemon) {
		var ivTotal = pokemon.individual_attack + pokemon.individual_defense + pokemon.individual_stamina;
		pokemon.iv_perfection = ((ivTotal) / 45 * 100).toFixed(2);
	}
}