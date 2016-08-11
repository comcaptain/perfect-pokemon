$(document).ready(function() {
	$("button#login").click(function() {
		$.ajax({
			url: "login",
			method: "post",
			dataType: "json",
			data: {googleAuthCode: $("#googleAuthCode").val()}
		})
		.done(function(data) {
			sortByIVPerfection(data);
		});
	});
	$("#refresh").click(function() {
		$.ajax({
			url: "refresh",
			dataType: "json",
		})
		.done(function(data) {
			if (data.expired) {
				alert("Client is expired, please login again");
				return;
			}
			sortByIVPerfection(data);
		});
	});
	$("#sortByIVPerfection").click(function() {
		sortByIVPerfection(window.pokemonsData);
	});
	$("#sortByCP").click(function() {
		sortByCP(window.pokemonsData);
	});
	$("#showUselessPokemons").click(function() {
		showUselessPokemons(window.pokemonsData);
	});
	$.ajax({
		url: "pogoData",
		dataType: "json"
	})
	.done(function(data) {
		sortByIVPerfection(data);
	});
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
	pokemonNode.querySelector(".pokemon-name").textContent = pokemonNames[pokemon.pokemon_id];
	pokemonNode.querySelector(".pokemon-image").style.backgroundImage = "url(./images/" + pokemonID + ".png)";
	pokemonNode.querySelector(".pokemon-cp").textContent = pokemon.cp;
	pokemonNode.querySelector(".pokemon-iv-perfection").textContent = calculateIVPerfection(pokemon) + "%";
	return pokemonNode;
}

function calculateIVPerfection(pokemon) {
	return ((pokemon.individual_attack + pokemon.individual_defense + pokemon.individual_stamina) / 45 * 100).toFixed(2)
}


function leftPadZero(integer, minLength) {
	var result = integer + "";
	var toBeAddedCount = minLength - result.length;
	for (var i = 0; i < toBeAddedCount; i++) result = "0" + result;
	return result;
}

//descending
function sortByIVPerfection(data) {
	data.pokemon.sort(function(a, b) {return calculateIVPerfection(b) - calculateIVPerfection(a)});
	renderPage(data);
}
//descending
function sortByCP(data) {
	data.pokemon.sort(function(a, b) {return b.cp - a.cp});
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
    return pokemon.cp <= 500 && calculateIVPerfection(pokemon) <= 75;
}

function showUselessPokemons(data) {
    var pokemonGroups = getPokemonsGroupedByType(data.pokemon);
    var uselessPokemons = [];
    for (var i in pokemonGroups) {
        var pokemons = pokemonGroups[i];
        var uselessPokemonsInGroup = pokemons.filter(isUselessPokemon).sort(function(a, b) {return calculateIVPerfection(a) - calculateIVPerfection(b)});
        if (pokemons.length === uselessPokemonsInGroup.length) uselessPokemonsInGroup.pop();
        uselessPokemonsInGroup.forEach(function(p) {uselessPokemons.push(p)});
    }
    uselessPokemons.sort(function(a, b){return a.pokemon_id - b.pokemon_id});
    data.pokemon = uselessPokemons;
    renderPage(data);
}