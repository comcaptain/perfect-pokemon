//Caterpie, Weedle, Pidgey, Rattata
const SHOULD_BE_EVOLVED_FOR_XP_POKEMONS = [10, 16, 19, 13];


const pokemonServer = new PokemonServer(function(isLoading) {
	if (isLoading) $(".loading").show();
	else $(".loading").hide();
});
document.addEventListener("paste", event => {
	event.preventDefault();
	event.stopPropagation();

	var clipboardData = event.clipboardData || window.clipboardData;
	document.getElementById("googleAuthCode").value = clipboardData.getData("Text");
});
$(document).ready(function() {
	$("button#login").click(function() {
		var authCode = $("#googleAuthCode").val();
		if (!authCode) {
			alert("Please specify auth code");
			return;
		}
		pokemonServer.login(authCode).then(sortByIVPerfection, window.alert);
	});
	var language = localStorage.getItem("language");
	language = language === null ? "en" : language;
	window.language = language;
	$("#language > img").attr("src", `./images/${language}.png`);
	$("#language").click(function() {
		var newLanguage = null;
		if (window.language == "en") newLanguage = "jp";
		else newLanguage = "en";
		localStorage.setItem("language", newLanguage);
		window.location.reload();
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
		var uselessPokemons = getUselessPokemons(window.pokemonsData);
	    if (uselessPokemons.length === 0) {
	    	alert("Congratulations! All your pokemons are useful now!")
	    	return;
	    }
		window.pokemonsData.pokemon = uselessPokemons
    	sortByID(window.pokemonsData);
	});

	$("#releasePokemons").click(function() {
		var uselessPokemons = getUselessPokemons(window.pokemonsData);
	    if (uselessPokemons.length === 0) {
	    	alert("Congratulations! All your pokemons are useful now!")
	    	return;
	    }
		if (!confirm(`Are you sure that you want to release ${uselessPokemons.length} pokemons?

This will be done automatically and your account may be banned for this operation.`)) return;

		pokemonServer.releasePokemons(uselessPokemons.map(p => p.id)).then(data => {
			alert(`Released ${uselessPokemons.length} pokemons!`);
			sortByIVPerfection(data);
		}, window.alert);

	});
	
	pokemonServer.getData().then(sortByIVPerfection);
})

function renderPage(data) {
	window.pokemonsData = data;
	document.title = `Perfect Pokemon (${data.pokemon.length}/250)`;
	document.querySelector("#player").textContent = `LEVEL${data.player.level}: ${data.player.current_level_earned_xp}/${data.player.current_level_xp}`;
	document.querySelector("#evolvable-count").textContent = getEvolvedForXPPokemonCount(data.pokemon);
	$(".other-info").css("visibility", "visible");
	var pokemonsNode = document.querySelector("#pokemons");
	pokemonsNode.innerHTML = "";
	data.pokemon.map(renderPokemon).forEach(function(p) {pokemonsNode.appendChild(p)});
	adjustControllerPosition();
}

window.onresize = adjustControllerPosition;

function adjustControllerPosition() {
	var $firstPokemonCard = $(".pokemon:first-child");
	var pokemonsContainerWidth = $("#pokemons").width();
	var $pokemons = $(".pokemon");
	var pokemonWidth = ["margin-left", "border-left-width", "padding-left", "width", "padding-right", "border-right-width", "margin-right"].map(p => $pokemons.css(p)).map(v => parseInt(v)).reduce((a, b) => a + b);
	var pokemonsInOneRow = Math.floor(pokemonsContainerWidth / pokemonWidth);
	if (pokemonsInOneRow > $pokemons.length) $("#controller").css("margin-left", "");
	else $("#controller").css("margin-left", $firstPokemonCard.offset().left - parseInt($firstPokemonCard.css("margin-left")) + "px");
}

function renderPokemon(pokemon) {
	var template = document.getElementById("pokemonTemplate");
	var pokemonNode = document.importNode(template.content, true).querySelector(".pokemon");
	pokemonNode.setAttribute("title", generateDetail(pokemon));

	var pokemonID = leftPadZero(pokemon.pokemon_id, 3);
	pokemonNode.querySelector(".caught-time").textContent = `${timeSince(pokemon.caught_time)} ago`;
	pokemonNode.querySelector(".pokemon-level").textContent = pokemon.level;
	pokemonNode.querySelector(".pokemon-image").style.backgroundImage = `url(./images/${pokemonID}.png)`;
	pokemonNode.querySelector(".pokemon-cp").textContent = pokemon.cp;
	pokemonNode.querySelector(".pokemon-iv-perfection").textContent = pokemon.iv_perfection + "%";
	pokemonNode.querySelector(".pokemon-candy-count").textContent = pokemon.candy_count;
	pokemonNode.setAttribute("UUID", pokemon.id);
	if (hasPerfectMoveSet(pokemon)) {
		pokemonNode.classList.add("best-moveset-pokemon");
	}
	return pokemonNode;
}
function generateDetail(pokemon) {
	return `${printMove(pokemon.move_1, pokemon)}
${printMove(pokemon.move_2, pokemon)}
UUID: ${pokemon.id}
ID: ${pokemon.pokemon_id}
Name: ${pokemon.nickname}
Height: ${pokemon.height_m.toFixed(2)} m
Weight: ${pokemon.weight_kg.toFixed(2)} kg
Attack: ${pokemon.individual_attack}
Defense: ${pokemon.individual_defense}
Stamina: ${pokemon.individual_stamina}
${pokemon.evolve_candy ? "Evolve Candy: " + pokemon.evolve_candy : "Cannot Evolve"}`;
}

function hasPerfectMoveSet(pokemon) {
	return isBestMove(pokemon.move_1, pokemon) && isBestMove(pokemon.move_2, pokemon);
}

function printMove(moveID, pokemon) {
	let move = MOVE_INDEX[moveID];
	let moveName = window.language == "jp" ? NAME_INDEX[move.name].jp : move.name;
	let bestMove = getBestMove(move.is_main_move ? pokemon.main_moves : pokemon.quick_moves);
	return `${moveName}: ${move.dps}/${bestMove.dps}`;
}

function isBestMove(moveID, pokemon) {
	var move = MOVE_INDEX[moveID];
	var bestMoveDPS = getBestMove(move.is_main_move ? pokemon.main_moves : pokemon.quick_moves).dps;
	return move.dps === bestMoveDPS;
}

function getBestMove(possibleMoveIDs) {
	return possibleMoveIDs.map($ => MOVE_INDEX[$]).sort((a, b) => b.dps - a.dps)[0];
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

/**
 * @return pokemon_id => [pokemon]
 */
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
    return pokemon.cp <= 1000 && pokemon.iv_perfection < 90;
}

function getUselessPokemons(data) {
    var pokemonGroups = getPokemonsGroupedByType(data.pokemon);
    var uselessPokemons = [];
    for (let id in pokemonGroups) {
        var pokemons = pokemonGroups[id];
        var uselessPokemonsInGroup = pokemons.filter(isUselessPokemon).sort(function(a, b) {return a.iv_perfection - b.iv_perfection});

        if (SHOULD_BE_EVOLVED_FOR_XP_POKEMONS.includes(parseInt(id))) {
        	let firstPokemon = pokemons[0];
        	let candyCount = firstPokemon.candy_count;
        	let canEvolvePokemonsCount = Math.floor(candyCount / firstPokemon.evolve_candy);
        	if (pokemons.length <= canEvolvePokemonsCount) continue;
        	uselessPokemonsInGroup = uselessPokemonsInGroup.slice(0, (pokemons.length - canEvolvePokemonsCount));
        }
    	//every pokemon type should have at least one
        else if (pokemons.length === uselessPokemonsInGroup.length) {
        	uselessPokemonsInGroup.pop();
        }
        uselessPokemonsInGroup.forEach(function(p) {uselessPokemons.push(p)});
    }
    //Skip Pikachu. You know, Pikachu has privilege
    uselessPokemons = uselessPokemons.filter(p => p.pokemon_id != 25);
    return uselessPokemons;
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

function getEvolvedForXPPokemonCount(pokemons) {
	var counts = {};
	pokemons
		.filter(p => SHOULD_BE_EVOLVED_FOR_XP_POKEMONS.indexOf(p.pokemon_id) >= 0)
		.forEach(p => {
			var id = p.pokemon_id;
			if (counts[id] === undefined) counts[id] = $.extend({count: 0}, p);
			counts[id].count++;
		});
	var count = 0;
	for (var id in counts) {
		count += Math.min(counts[id].count, Math.floor(counts[id].candy_count / counts[id].evolve_candy));
	}
	return count;
}
