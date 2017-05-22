// ### VISUALIZER ###

$(function () {
    // Future-proofing...
    var context;
    if (typeof AudioContext !== "undefined") {
        context = new AudioContext();
    } else if (typeof webkitAudioContext !== "undefined") {
        context = new webkitAudioContext();
    } else {
        $(".hideIfNoApi").hide();
        $(".showIfNoApi").show();
        return;
    }

    // Overkill - if we've got Web Audio API, surely we've got requestAnimationFrame. Surely?...
    // requestAnimationFrame polyfill by Erik M�ller
    // fixes from Paul Irish and Tino Zijdel
    // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
                                    || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () { callback(currTime + timeToCall); },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };

    // Create the analyser
    var analyser = context.createAnalyser();
    analyser.fftSize = 64;
    var frequencyData = new Uint8Array(analyser.frequencyBinCount);

    // Set up the visualisation elements
    var visualisation = $("#visualisation");
	var barSpacingPercent = 160 / analyser.frequencyBinCount;
    for (var i = 0; i < analyser.frequencyBinCount / 1.6; i++) {
    	$("<div/>").css("left", i * barSpacingPercent + "%")
			.appendTo(visualisation);
    }
    var bars = $("#visualisation > div");

    // Get the frequency data and update the visualisation
    function update() {
        requestAnimationFrame(update);

        analyser.getByteFrequencyData(frequencyData);

        bars.each(function (index, bar) {
            bar.style.height = frequencyData[index]/2 + 'px';
        });
    };

    // Hook up the audio routing...
    // player -> analyser -> speakers
	// (Do this after the player is ready to play - https://code.google.com/p/chromium/issues/detail?id=112368#c4)
	$("#audio").bind('canplay', function() {
		var source = context.createMediaElementSource(this);
		source.connect(analyser);
		analyser.connect(context.destination);
	});

    // Kick it off...
    update();
});


// ### INIT SKROLLR ###

var s = skrollr.init();


// ### ARTIST DATA ###

var artist = [];

artist[0] = {
    name:  ["Chance The Rapper"],
    audio: ["src/audio/chance-the-rapper.mp3"],
    link:  ["https://www.youtube.com/watch?v=DVkkYlQNmbc"],
    date:  ["Sat 8/05"]
};
artist[1] = {
    name:  ["The Killers"],
    audio: ["src/audio/the-killers.mp3"],
    link:  ["https://www.youtube.com/watch?v=gGdGFtwCNBE"],
    date:  ["Fri 8/04"]
};

var spinner = anime({
    targets: '.shuffle-next-icon',
    rotate: -720,
    duration: 3000
});

// Timer to change song after x seconds
var timer = setInterval(function() { 
    nextSong(); 
}, 30000);

$('.shuffle-next').on('click',function(){ 
    clearInterval(timer);
    timer = setInterval(function() { 
        nextSong(); 
    }, 30000);
    nextSong();
});

function nextSong() {
    spinner.restart();
    
    var rand = Math.floor(Math.random() * artist.length);
    
	var name  = artist[rand].name[0];
	var audio = artist[rand].audio[0];
    var link = artist[rand].link[0];
    var date  = artist[rand].date[0];
	
    $(".shuffle-artist h1").html(name);
    var sourceMp3=document.getElementById('audio');
    sourceMp3.src= audio;
    document.getElementById('sourceHref').href=link;
    $(".shuffle-date h4").html(date);
}

// Audio control
$('.sound-icon').on('click', function() {
    
    $('.sound-icon-speaker-cover').toggleClass('silent');
    var audioElem = document.getElementById('audio');
    if (audioElem.volume == 1)
        audioElem.volume = 0;
     else
        audioElem.volume = 1;
});

