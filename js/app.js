// global variales
var playerTurn;
var board = ['','','','','','','','',''];
var scoreToGet = 3;
var player1Score = 0;
var player2Score = 0;
var waitTimer;
var gameWon = false; // maintains winning state
var volume = true;
var player1Details = {};
var player2Details = {};

// query selectors
var squareArray = document.querySelectorAll('.square');
var lineSvg = document.querySelectorAll('.board .col1 svg');
var linePath = document.querySelectorAll('.board .col1 svg path');
var endgameOverlay = document.querySelector('.endgame_overlay');
var outcome = document.querySelector('.outcome_container');
var restartButton = document.querySelector('.restart');
var player1Area = document.querySelector('.player1_area');
var player2Area = document.querySelector('.player2_area');
var waitingText = document.querySelector('footer .waiting');
var welcomeSubmit = document.querySelector('.welcome_overlay_footer .start');
var player1AvatarSelection = document.querySelectorAll('.avatar_selection1 label');
var player2AvatarSelection = document.querySelectorAll('.avatar_selection2 label');
var welcomeOverlay = document.querySelector('.welcome_overlay');
var changeSettingsButton = document.querySelector('.change_settings');
var minusScore = document.querySelector('.welcome_overlay_footer .fa-minus');
var plusScore = document.querySelector('.welcome_overlay_footer .fa-plus');
var currentScore = document.querySelector('.welcome_overlay_footer .settings_score');
var playToScoreDisplay = document.querySelector('.play_to_score');
var volumeControl = document.querySelectorAll('.sound_control i');
var copyrightSelect = document.querySelector('footer .copyright p');

// web audio with Pizzicato plugin
var laserBlast = new Pizzicato.Sound('./audio/blaster-firing.mp3');
var themeSong = new Pizzicato.Sound({
		source: 'file', 
		options: { path: './audio/star-wars-theme-song.mp3', loop: true }
		}, function() {
			initialiseGame();
		});
var r2d2 = new Pizzicato.Sound('./audio/R2D2-yeah.mp3');
var darthVaderAudio = new Pizzicato.Sound('./audio/swvader02.mp3');
var cantinaBand = new Pizzicato.Sound({
		source: 'file',
		options: { path: './audio/star-wars-cantina-song.mp3', loop: true }
		}, function() {
			copyrightSelect.addEventListener('click', playCantina);
		});
var lightsaberAudio = new Pizzicato.Sound('./audio/lightsaber_on.mp3');
var imperial = new Pizzicato.Sound('./audio/imperial.mp3');
var rebelFanfare = new Pizzicato.Sound('./audio/Rebel_Fanfare.ogx');
var wilhelmScream = new Pizzicato.Sound('./audio/WilhelmScream.mp3');
var ewok = new Pizzicato.Sound('./audio/EWOK.mp3');

var volumeControlArr = [laserBlast, themeSong, r2d2, darthVaderAudio, cantinaBand, lightsaberAudio, imperial, rebelFanfare, wilhelmScream];

// event listeners
squareArray.forEach(function(square) {
	square.addEventListener('click', manageSquareClicks)
});
restartButton.addEventListener('click', () => restartGame(true));
welcomeSubmit.addEventListener('click', setGameSettings);
changeSettingsButton.addEventListener('click', openSettingsMenu);
minusScore.addEventListener('click', decreasePointsSetting);
plusScore.addEventListener('click', increasePointsSetting);
volumeControl.forEach(function(volume) {
	volume.addEventListener('click', toggleVolume);
});
// stop cantine audio when clicking anywhere but copyright div
window.addEventListener('click', stopCantina);

// fix height if browser is greater than body
var body = document.querySelector('body');
if (window.innerHeight > body.offsetHeight) {
	body.style.height = '100vh';
}

// initialise game when themeSong loads

function initialiseGame() {
	// play the theme song on startup
	themeSong.play();

	waitingText.textContent = '';
	playerTurn = whoStarts();
	if (playerTurn === 'X') {
		waitingText.textContent = 'Player 1 Starts';
	} else if (playerTurn === 'O') {
		waitingText.textContent = 'Player 2 Starts';
	}
}

function toggleVolume() {
	if (volume) {
		turnOffVolume();
		volumeControl.forEach(function(icon) {
			icon.classList.remove('fa-volume-up');
			icon.classList.add('fa-volume-off');
		});
		volume = false;
	} else {
		turnOnVolume();
		volumeControl.forEach(function(icon) {
			icon.classList.remove('fa-volume-off');
			icon.classList.add('fa-volume-up');
		});
		volume = true;
	}
}

function turnOnVolume() {
	volumeControlArr.forEach(function(control) {
		control.volume = 1;
	});
}

function turnOffVolume() {
	volumeControlArr.forEach(function(control) {
		control.volume = 0;
	});
}

function decreasePointsSetting() {
	var score = parseInt(currentScore.textContent);
	if (score <= 5 && score >= 2) { score-- }
	currentScore.textContent = score;  
}

function increasePointsSetting() {
	var score = parseInt(currentScore.textContent);
	if (score <= 4 && score >= 1) { score++ }
	currentScore.textContent = score; 
}

function setGamePoint() {
	var score = parseInt(currentScore.textContent);
	scoreToGet = score;

	playToScoreDisplay.textContent = 'play to ' + scoreToGet + ' points'
}

function setGameSettings(event) {

	player1AvatarSelection.forEach(function(avatar) {
		if (avatar.querySelector('input').checked) {
			var player1AvatarImgUrlSelect = avatar.querySelector('img');
			var srcIndex1 = player1AvatarImgUrlSelect.src.indexOf('/images');
			player1Details.avatarImgUrl = player1AvatarImgUrlSelect.src.slice(srcIndex1);
			player1Details.avatarId = avatar.id;
			player1Details.avatarName = determinePlayerAvatarName(avatar.id, 'Player1');
		}
	});

	player2AvatarSelection.forEach(function(avatar) {
		if (avatar.querySelector('input').checked) {
			var player2AvatarImgUrlSelect = avatar.querySelector('img');
			var srcIndex2 = player2AvatarImgUrlSelect.src.indexOf('/images');
			player2Details.avatarImgUrl = player2AvatarImgUrlSelect.src.slice(srcIndex2);
			player2Details.avatarId = avatar.id;
			player2Details.avatarName = determinePlayerAvatarName(avatar.id, 'Player2');
		}
	});

	// set the internal game point variable
	setGamePoint();

	// play button click sounds and stop theme song
	themeSong.stop();
	r2d2.play();

	// place the player avatars on the main screen
	placeAvatarsOnMain(player1Details, player2Details);

	welcomeOverlay.classList.add('hide');
}

function determinePlayerAvatarName(playerAvatarId, player) {
	var avatarName;

	if (player === 'Player1') {
		switch(playerAvatarId) {
			case 'avatar1':
				avatarName = 'kylo ren';
				break;
			case 'avatar2':
				avatarName = 'darth vader';
				break;
			case 'avatar3':
				avatarName = 'darth maul';
				break;
			case 'avatar4':
				avatarName = 'darth darth binks';
				break;
			default:
				avatarName = '';
		}
	}

	if (player === 'Player2') {
		switch(playerAvatarId) {
			case 'avatar1':
				avatarName = 'rey';
				break;
			case 'avatar2':
				avatarName = 'luke skywalker';
				break;
			case 'avatar3':
				avatarName = 'yoda';
				break;
			case 'avatar4':
				avatarName = 'ewok';
				break;
			default:
				avatarName = '';
		}	
	}

	return avatarName;
}

function placeAvatarsOnMain(player1Details, player2Details) {
	// set player avatar on main screen
	var player1Avatar = document.querySelector('.player1_area .player_image');
	var player2Avatar = document.querySelector('.player2_area .player_image');
	var player1AvatarName = document.querySelector('.player1_area .player_avatar_name');
	var player2AvatarName = document.querySelector('.player2_area .player_avatar_name');

	player1Avatar.style.background = "url('." + player1Details.avatarImgUrl + "') no-repeat center center";
	player1Avatar.style.backgroundSize = 'cover';
	
	player2Avatar.style.background = "url('." + player2Details.avatarImgUrl + "') no-repeat center center";
	player2Avatar.style.backgroundSize = 'cover';

	player1AvatarName.textContent = player1Details.avatarName;
	player2AvatarName.textContent = player2Details.avatarName;
}

function whoStarts() {
	var random = Math.random();
	var who;
	random >= 0.5 ? who = 'X' : who = 'O';
	return who;
}

function openSettingsMenu() {
	welcomeOverlay.classList.remove('hide');

	// restart game variables and delete the scores
	restartGame(true);

	// play the theme song when settings opened
	themeSong.play();
}

function placeAvatarOnBoard(event) {

	var imageStyle = event.target.style

	if (playerTurn === 'X') {
		imageStyle.background = "url('." + player1Details.avatarImgUrl + "') no-repeat center center"
		imageStyle.backgroundSize = 'cover';

	} else if (playerTurn === 'O') {
		imageStyle.background = "url('." + player2Details.avatarImgUrl + "') no-repeat center center"
		imageStyle.backgroundSize = 'cover';
	}
}

function manageSquareClicks(event) {
	if (!gameWon) {
		clearTimeout(waitTimer);
		// remove all non digit characters 
		var buttonId = event.target.id.replace(/\D+/g, '');
		
		// clear the waiting on message
		waitingText.textContent = '';

		// checking for valid move
		if (board[buttonId] === '') {
			laserBlast.stop();
			laserBlast.play();
			board[buttonId] = playerTurn;
			placeAvatarOnBoard(event);
			swapPlayerTurns();
		}
		
		var winner = checkWinCondition();
		if (winner) {

			showStrikethrough(winner)
			lightsaberAudio.play();

			if (winner.player === 'Player 1') {
				player1Score++;
				drawScoreLines(player1Score, player1Area);
			} else if (winner.player === 'Player 2') {
				player2Score++;
				drawScoreLines(player2Score, player2Area);
			}

			// if player 1 wins or player 2 wins
			if (player1Score === scoreToGet || player2Score === scoreToGet) {
				setTimeout(function() {
					gameOver(winner.player);
				}, 1000);
			} else {
				setTimeout(function() {
					restartGame();
				}, 2000);
			}
		} else if (!board.includes('')) {
			showDrawMessage();
		} else {
			startWaitingTimer();
		}
	}
}

function swapPlayerTurns() {
	playerTurn === 'X' ? playerTurn = 'O' : playerTurn = 'X';
}

function checkWinCondition() {
	var win = {};

	if (board[0] === board[1] && board[0] === board[2] && board[0] !== '') { 
		win.player = board[0];
		win.strikeId = '0';
	}
	
	if (board[3] === board[4] && board[3] === board[5] && board[3] !== '') { 
		win.player = board[3]; 
		win.strikeId = '1';
	}

	if (board[6] === board[7] && board[6] === board[8] && board[6] !== '') { 
		win.player = board[6]; 
		win.strikeId = '2';
	}
	
	if (board[0] === board[3] && board[0] === board[6] && board[0] !== '') { 
		win.player = board[0];
		win.strikeId = '3';
	}

	if (board[1] === board[4] && board[1] === board[7] && board[1] !== '') { 
		win.player = board[1];
		win.strikeId = '4';
	}

	if (board[2] === board[5] && board[2] === board[8] && board[2] !== '') { 
		win.player = board[2];
		win.strikeId = '5'; 
	}

	if (board[0] === board[4] && board[0] === board[8] && board[0] !== '') { 
		win.player = board[0];
		win.strikeId = '6';
	}

	if (board[2] === board[4] && board[2] === board[6] && board[2] !== '') { 
		win.player = board[2];
		win.strikeId = '7';
	}

	if (!objectIsEmpty(win)) {
		if (win.player === 'X') {
			win.player = 'Player 1';
			gameWon = true;
			return win;
		} else if (win.player === 'O') {
			win.player = 'Player 2';
			gameWon = true;
			return win;
		}
	} else {
		return false;
	}
}

function gameOver(winner) {
	endgameOverlay.classList.add('show');
	outcome.querySelector('h2').textContent = 'game over'
	outcome.querySelector('.winner').textContent =  winner + ' wins';
	var smackTalk = '';
	if (winner === 'Player 1') {
		switch(player1Details.avatarId) {
			case 'avatar1': // kylo ren
				smackTalk = 'you need a teacher! i can show you the ways of the force!';
				imperial.play();
				break;
			case 'avatar2': // darth vader
				smackTalk = '"heavy breathing"';
				setTimeout(function() {
					darthVaderAudio.play();
				},2000);
				break;
			case 'avatar3': // darth maul
				smackTalk = '. . . . . . .'; //Darth Maul only speaks two lines in the whole movie for a total of 31 words
				imperial.play();
				break;
			case 'avatar4': // darth darth binks
				smackTalk = 'meesa find yousa lackin in faith disturbin';
				imperial.play();
				break;
			default:
				smackTalk = '';
		}
		outcome.querySelector('img').src = './' + player1Details.avatarImgUrl;
	} else if (winner === 'Player 2') {
		switch(player2Details.avatarId) {
			case 'avatar1': // rey
				smackTalk = 'you\'re afraid... that you will never be as strong as darth vader';
				rebelFanfare.play();
				break;
			case 'avatar2': // luke
				smackTalk = 'i\’ll never turn to the dark side';
				rebelFanfare.play();
				break;
			case 'avatar3': // yoda
				smackTalk = 'stupid you are, breed you should not';
				rebelFanfare.play();
				break;
			case 'avatar4': // ewok
				smackTalk = 'yub nub';
				// rebelFanfare.play();
				ewok.play();
				break;
			default:
				smackTalk = '';
		}
		outcome.querySelector('img').src = './' + player2Details.avatarImgUrl;
	}
	outcome.querySelector('.smack_talk').textContent = smackTalk;
}

function objectIsEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

function showStrikethrough(winner) {
	if (winner.player === 'Player 1') {
		lineSvg[winner.strikeId].style.boxShadow = '0px 0px 10px 10px red';
	} else if (winner.player === 'Player 2') {
		lineSvg[winner.strikeId].style.boxShadow = '0px 0px 10px 10px rgba(12, 144, 244, 1)';
	}
	// lineSvg[winner.strikeId].style.boxShadow = 'none'
	lineSvg[winner.strikeId].style.visibility = 'visible';
	lineSvg[winner.strikeId].classList.add('draw');
	linePath[winner.strikeId].classList.add('draw');
}

function restartGame(end) {
	// reset internal game variables
	board = ['','','','','','','','',''];
	gameWon = false;
	
	// loser starts the next round
	if (playerTurn === 'X') {
		waitingText.textContent = 'Player 1 Starts';
	} else if (playerTurn === 'O') {
		waitingText.textContent = 'Player 2 Starts';
	}

	// clear the square image
	squareArray.forEach(function(square) {
		square.style.background = 'none';
	});
	// remove strike through lines
	lineSvg.forEach(function(svg) {
		svg.style.visibility = 'hidden';
		svg.classList.remove('draw');
	});
	linePath.forEach(function(path) {
		path.classList.remove('draw');
	});

	// turn off all audio
	volumeControlArr.forEach(function(audio) {
		audio.stop();
	});

	// only if the game has finished reset these
	if (end) {
		player1Score = 0;
		player2Score = 0;

		// reset score svgs
		resetScoreSvgs();

		// remove end game overlay
		endgameOverlay.classList.remove('show');
	}
}

function drawScoreLines(scoreId, player) {
	var scoreSvg = player.querySelector('#score' + scoreId + '_svg');
	scoreSvg.style.visibility = 'visible';
	scoreSvg.classList.add('draw');

	var scorePath = scoreSvg.querySelector('path');
	scorePath.classList.add('draw');
}

function resetScoreSvgs() {
	var player1Svgs = player1Area.querySelectorAll('svg');
	player1Svgs.forEach(function(svg) {
		svg.style.visibility = 'hidden';
		svg.classList.remove('draw');
		var path = svg.querySelector('path');
		path.classList.remove('draw');
	})

	var player2Svgs = player2Area.querySelectorAll('svg');
	player2Svgs.forEach(function(svg) {
		svg.style.visibility = 'hidden';
		svg.classList.remove('draw');
		var path = svg.querySelector('path');
		path.classList.remove('draw');
	})
}

function startWaitingTimer() {
	var playerWaitingOn;

	if (playerTurn === 'X') {
		playerWaitingOn = 'Player 1';
	} else if (playerTurn === 'O') {
		playerWaitingOn = 'Player 2';
	}

	waitTimer = setTimeout(function() {
		waitingText.textContent = "Waiting for " + playerWaitingOn;
	}, 1000);
}

function showDrawMessage() {
	var drawMessage = document.querySelector('.draw_container');
	drawMessage.classList.add('show');
	wilhelmScream.play();

	setTimeout(function() {
		restartGame();
		drawMessage.classList.remove('show');
	}, 3000);
}

function playCantina() {
	cantinaBand.stop();
	cantinaBand.play();
}

function stopCantina(event) {
	if (event.target !== copyrightSelect) {
		cantinaBand.stop();
	}
}





