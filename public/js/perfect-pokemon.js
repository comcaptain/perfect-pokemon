const pokemonServer = new PokemonServer();
$(document).ready(function() {
	$("button#login").click(function() {
		pokemonServer.login($("#googleAuthCode").val()).then(sortByIVPerfection);
	});
	$("#refresh").click(function() {
		pokemonServer.refreshData().then(sortByIVPerfection);
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
	$("#showUselessPokemons").click(function() {
		showUselessPokemons(window.pokemonsData);
	});
	
	pokemonServer.getData().then(sortByIVPerfection);
})

function renderPage(data) {
	window.pokemonsData = data;
	var pokemonsNode = document.querySelector("#pokemons");
	pokemonsNode.innerHTML = "";
	data.pokemon.map(renderPokemon).filter(function(p){return p;}).forEach(function(p) {pokemonsNode.appendChild(p)});
}

function renderPokemon(pokemon) {
	//don't know why, there're some pokemons that have 0 cp
	if (pokemon.cp == 0) return;
	var template = document.getElementById("pokemonTemplate");
	var pokemonNode = document.importNode(template.content, true);
	var pokemonID = leftPadZero(pokemon.pokemon_id, 3);
	pokemonNode.querySelector(".pokemon-name").textContent = `${timeSince(pokemon.caught_time)} ago`;
	pokemonNode.querySelector(".pokemon-image").style.backgroundImage = `url(./images/${pokemonID}.png)`;
	pokemonNode.querySelector(".pokemon-cp").textContent = pokemon.cp;
	pokemonNode.querySelector(".pokemon-iv-perfection").textContent = pokemon.iv_perfection + "%";
	return pokemonNode;
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
	data.pokemon.sort(function(a, b) {return a.pokemon_id - b.pokemon_id});
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
    return pokemon.cp <= 500 && pokemon.iv_perfection <= 75;
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
    uselessPokemons.sort(function(a, b){return a.pokemon_id - b.pokemon_id});
    data.pokemon = uselessPokemons;
    renderPage(data);
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