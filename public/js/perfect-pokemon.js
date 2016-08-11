$(document).ready(function() {
	$("button#login").click(function() {
		$.ajax({
			url: "login",
			method: "post",
			dataType: "json",
			data: {googleAuthCode: $("#googleAuthCode").val()}
		})
		.done(function(data) {
			renderPage(data);
		});
	});
	$("#refresh").click(function() {
		$.ajax({
			url: "refresh",
			dataType: "json",
		})
		.done(function(data) {
			renderPage(data);
		});
	});
	$("#sortByIVPerfection").click(function() {
		sortByIVPerfection(window.pokemonsData);
	});
	$("#sortByCP").click(function() {
		sortByCP(window.pokemonsData);
	});
	$.ajax({
		url: "pogoData",
		dataType: "json"
	})
	.done(function(data) {
		renderPage(data);
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
	pokemonNode.querySelector(".pokemon-id").textContent = pokemonID;
	pokemonNode.querySelector(".pokemon-image").src = "./images/" + pokemonID + ".png";
	pokemonNode.querySelector(".pokemon-cp").textContent = pokemon.cp;
	pokemonNode.querySelector(".pokemon-iv-perfection").textContent = (calculateIVPerfection(pokemon) * 100).toFixed(2) + "%";
	return pokemonNode;
}

function calculateIVPerfection(pokemon) {
	return ((pokemon.individual_attack + pokemon.individual_defense + pokemon.individual_stamina) / 45).toFixed(4)
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