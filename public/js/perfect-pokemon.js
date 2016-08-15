const pokemonServer = new PokemonServer();
$(document).ready(function() {
	$("button#login").click(function() {
		pokemonServer.login($("#googleAuthCode").val()).then(sortByIVPerfection);
	});
	$("#refresh").click(function() {
		pokemonServer.refreshData().then(sortByIVPerfection, window.alert);
	});
	$("#sortByIVPerfection").click(function() {
		sortByIVPerfection(window.pokemonsData);
	});
	$("#sortByCP").click(function() {
		sortByCP(window.pokemonsData);
	});
	$("#sortByTime").click(function() {
		sortByTime(window.pokemonsData);
	});
	$("#sortByID").click(function() {
		sortByID(window.pokemonsData);
	});
	$("#sortByLevel").click(function() {
		sortByLevel(window.pokemonsData);
	});
	$("#showUselessPokemons").click(function() {
		showUselessPokemons(window.pokemonsData);
	});
	
	pokemonServer.getData().then(sortByIVPerfection);
})

function renderPage(data) {
	window.pokemonsData = data;
	document.title = `Perfect Pokemon (${data.pokemon.length}/250)`;
	document.querySelector("#player").textContent = `LEVEL${data.player.level}: ${data.player.current_level_earned_xp}/${data.player.current_level_xp}`;
	var pokemonsNode = document.querySelector("#pokemons");
	pokemonsNode.innerHTML = "";
	data.pokemon.map(renderPokemon).filter(function(p){return p;}).forEach(function(p) {pokemonsNode.appendChild(p)});
	adjustControllerPosition();
}

window.onresize = adjustControllerPosition;

function adjustControllerPosition() {
	var $firstPokemonCard = $(".pokemon:first-child");
	$("#controller").css("margin-left", $firstPokemonCard.offset().left - parseInt($firstPokemonCard.css("margin-left")) + "px");
}

function renderPokemon(pokemon) {
	//don't know why, there're some pokemons that have 0 cp
	if (pokemon.cp == 0) return;

	var template = document.getElementById("pokemonTemplate");
	var pokemonNode = document.importNode(template.content, true).querySelector(".pokemon");
	pokemonNode.setAttribute("title", generateDetail(pokemon));

	var pokemonID = leftPadZero(pokemon.pokemon_id, 3);
	pokemonNode.querySelector(".caught-time").textContent = `${timeSince(pokemon.caught_time)} ago`;
	pokemonNode.querySelector(".pokemon-level").textContent = pokemon.level;
	pokemonNode.querySelector(".pokemon-image").style.backgroundImage = `url(./images/${pokemonID}.png)`;
	pokemonNode.querySelector(".pokemon-cp").textContent = pokemon.cp;
	pokemonNode.querySelector(".pokemon-iv-perfection").textContent = pokemon.iv_perfection + "%";
	return pokemonNode;
}

function generateDetail(pokemon) {
	return `Height: ${pokemon.height_m.toFixed(2)} m
Weight: ${pokemon.weight_kg.toFixed(2)} kg
Attack: ${pokemon.individual_attack}
Defense: ${pokemon.individual_defense}
Stamina: ${pokemon.individual_stamina}`;
}


function leftPadZero(integer, minLength) {
	var result = integer + "";
	var toBeAddedCount = minLength - result.length;
	for (var i = 0; i < toBeAddedCount; i++) result = "0" + result;
	return result;
}

//descending
function sortByIVPerfection(data) {
	data.pokemon.sort(function(a, b) {return b.iv_perfection - a.iv_perfection});
	renderPage(data);
}
//descending
function sortByCP(data) {
	data.pokemon.sort(function(a, b) {return b.cp - a.cp});
	renderPage(data);
}

//descending
function sortByTime(data) {
	data.pokemon.sort(function(a, b) {return b.caught_time - a.caught_time});
	renderPage(data);
}

//ascending
function sortByID(data) {
	data.pokemon.sort(function(a, b) {
		var idDiff = a.pokemon_id - b.pokemon_id;
		if (idDiff === 0) return b.cp - a.cp;
		return idDiff;
	});
	renderPage(data);
}

//descending
function sortByLevel(data) {
	data.pokemon.sort(function(a, b) {
		var levelDiff = b.level - a.level;
		if (levelDiff === 0) return b.pokemon_id - a.pokemon_id;
		return levelDiff;
	});
	renderPage(data);
}

function getPokemonsGroupedByType(pokemons) {
    var pokemonsGroupedByType = {};
    var data = pokemons.map(function(pokemon) {
        var pokemonsOfThisType = pokemonsGroupedByType[pokemon.pokemon_id];
        if (pokemonsOfThisType === undefined) {
            pokemonsOfThisType = [];
            pokemonsGroupedByType[pokemon.pokemon_id] = pokemonsOfThisType
        }
        pokemonsOfThisType.push(pokemon);
    })
    return pokemonsGroupedByType;
}

function isUselessPokemon(pokemon) {
    return pokemon.cp <= 700 && pokemon.iv_perfection <= 80;
}

function showUselessPokemons(data) {
    var pokemonGroups = getPokemonsGroupedByType(data.pokemon);
    var uselessPokemons = [];
    for (var i in pokemonGroups) {
        var pokemons = pokemonGroups[i];
        var uselessPokemonsInGroup = pokemons.filter(isUselessPokemon).sort(function(a, b) {return a.iv_perfection - b.iv_perfection});
        if (pokemons.length === uselessPokemonsInGroup.length) uselessPokemonsInGroup.pop();
        uselessPokemonsInGroup.forEach(function(p) {uselessPokemons.push(p)});
    }
    //Skip Pikachu. You know, Pikachu has privilege
    data.pokemon = uselessPokemons.filter(p => p.pokemon_id != 25);
    sortByID(data);
}

function timeSince(date) {

    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
        return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " minutes";
    }
    return Math.floor(seconds) + " seconds";
}