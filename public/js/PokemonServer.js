class PokemonServer {

	constructor(loadingFunc) {
		this.loadingFunc = loadingFunc;
	}

	login(authCode) {
		var server = this;
		return new Promise(function(resolve, reject) {
			server.loadingFunc(true);
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
				reject("Error happens while login");
			})
			.always(function() {
				server.loadingFunc(false);
			});
		});
	}

	refreshData() {
		var server = this;
		return new Promise(function(resolve, reject) {
			server.loadingFunc(true);
			$.ajax({
				url: "refresh",
				dataType: "json",
			})
			.done(function(data) {
				if (data.expired) {
					reject("Client is expired, please login again");
				}
				else {
					resolve(server.preprocessData(data));
				}
			})
			.always(function() {
				server.loadingFunc(false);
			});
		});
	}

	getData() {
		var server = this;
		return new Promise(function(resolve, reject) {
			server.loadingFunc(true);
			$.ajax({
				url: "pogoData",
				dataType: "json"
			})
			.done(function(data) {
				resolve(server.preprocessData(data));
			})
			.always(function() {
				server.loadingFunc(false);
			});
		});
	}

	preprocessData(data) {
		//don't know why, there're some pokemons that have 0 cp
		data.pokemon = data.pokemon.filter(p => p.cp > 0)
			.map(this.calculateIVPerfection.bind(this))
			.map(this.normalizeCreationTime.bind(this))
			.map(this.calculatePokemonLevel.bind(this));
		this.calculateLevelXP(data.player);
		this.enrichCandyInfo(data);
		return data;
	}

	enrichCandyInfo(data) {
		//family_id => candy_count
		var candiesCount = {};
		data.candies.forEach(candy => candiesCount[candy.family_id] = candy.candy);

		data.pokemon.forEach(p => {
			var pokemonMetaData = POKEMON_INDEX[p.pokemon_id];
			$.extend(p, pokemonMetaData);
			p.candy_count = candiesCount[p.family_id];
		})
	}

	calculateIVPerfection(pokemon) {
		var ivTotal = pokemon.individual_attack + pokemon.individual_defense + pokemon.individual_stamina;
		pokemon.iv_perfection = ((ivTotal) / 45 * 100).toFixed(2);
		return pokemon
	}

	calculatePokemonLevel(pokemon) {
		var initialLevel = pokemonLevelMaps[Math.round(pokemon.cp_multiplier * 100000) + ""];
		pokemon.level = initialLevel + pokemon.num_upgrades / 2;
		return pokemon
	}

	normalizeCreationTime(pokemon) {
		pokemon.caught_time = new Date(pokemon.creation_time_ms);
		return pokemon
	}

	calculateLevelXP(player) {
		player.current_level_xp = PLAYER_XP_FOR_EACH_LEVEL[player.level];
		player.current_level_earned_xp = player.current_level_xp - (player.next_level_xp - player.experience);
	}
}