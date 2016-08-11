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
	$("#reload").click(function() {
		$.ajax({
			url: "pogoData",
			dataType: "json"
		})
		.done(function(data) {
			if (data)renderPage(data);
		});
	});
})

function renderPage(data) {
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
	pokemonNode.querySelector(".pokemon-iv-perfection").textContent = 
		((pokemon.individual_attack + pokemon.individual_defense + pokemon.individual_stamina) / 45 * 100).toFixed(2) + "%";
	return pokemonNode;
}

function leftPadZero(integer, minLength) {
	var result = integer + "";
	var toBeAddedCount = minLength - result.length;
	for (var i = 0; i < toBeAddedCount; i++) result = "0" + result;
	return result;
}