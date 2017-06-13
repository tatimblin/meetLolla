
var spinner = anime({
    targets: '.shuffle-next-icon',
    rotate: -720,
    duration: 3000
});

// Timer to change song after x seconds
var timer = setInterval(function() { 
    audio.load();
    audio.play();
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
	var audioUrl = artist[rand].audio[0];
    var link = artist[rand].link[0];
    var date  = artist[rand].date[0];
    
    // Name
    //$(".shuffle-artist h1").html(name);
	
    // Music
    //audio.pause();

    var audio = document.querySelector("audio");
    audio.pause();
    audio.src= audioUrl;
    audio.load();
    $("#audio").bind('canplay', function() {
		audio.play();
	});
    if ($(window).width() <= 600) {
        audio.play();
        audio.src = audioUrl; // Set the real audio source
        beeper = setInterval(function() { audio.play(); } ,1000 * 60);
    }
    
    // Youtube
    document.getElementById('sourceHref').href=link;
    
    // Date
    $(".shuffle-date h4").html(date);
    
    // Animate name in/out
    $( ".shuffle-artist h1" ).fadeOut( "fast", function() {
        $(".shuffle-artist h1").html(name);
        var elem = $(this);
        var characters = elem.text().split("");
        elem.empty();

        $.each(characters, function (i, el) {
            elem.append("<span style='display:inline-block; transform-origin:center bottom; transform: translateY(120px) scale(0); max-width:0px; opacity:0;' class='shuffle-artist-letter'>" + el + "</span>");
        });
        
        var els = document.querySelectorAll('.shuffle-artist .shuffle-artist-letter');

        var artistAnim = anime({
            targets: els,
            translateY: 0,
            scale:1,
            opacity: 1,
            maxWidth: 100,
            duration: function(el, i, l) {
                return 700 + (i * Math.random()* 500);
            },
            direction: 'alternate', // stop vanishing
            loop: false 
        });
        
        $(this).fadeIn(400);
        artistAnim.restart();
    });
}

// Audio control
$('.sound-icon').on('click', function() {
    
    muteSong();
    
});

function muteSong() {
    $('.sound-icon-speaker-cover').toggleClass('silent');
    var audioElem = document.getElementById('audio');
    if (audioElem.volume == 1)
        audioElem.volume = 0;
     else
        audioElem.volume = 1;
}

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

$(function () {
  // initialize skrollr if the window width is large enough
  if ($(window).width() > 600) {
    skrollr.init();
  }

  // disable skrollr if the window is resized below 768px wide
  $(window).on('resize', function () {
    if ($(window).width() <= 600) {
      skrollr.init().destroy(); // skrollr.init() returns the singleton created above
    }
  });
});


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
artist[2] = {
    name:  ["Muse"],
    audio: ["src/audio/muse.mp3"],
    link:  ["https://www.youtube.com/watch?v=b4ozdiGys5g"],
    date:  ["Thurs 8/03"]
};
artist[3] = {
    name:  ["Arcade Fire"],
    audio: ["src/audio/arcade-fire.mp3"],
    link:  ["https://www.youtube.com/watch?v=7E0fVfectDo"],
    date:  ["Sun 8/06"]
};
artist[4] = {
    name:  ["The XX"],
    audio: ["src/audio/the-xx.mp3"],
    link:  ["https://www.youtube.com/watch?v=blJKoXWlqJk"],
    date:  ["Sat 8/05"]
};
artist[5] = {
    name:  ["Lorde"],
    audio: ["src/audio/lorde.mp3"],
    link:  ["https://www.youtube.com/watch?v=nlcIKh6sBtc"],
    date:  ["Thurs 8/03"]
};
artist[6] = {
    name:  ["Blink-182"],
    audio: ["src/audio/blink-182.mp3"],
    link:  ["https://www.youtube.com/watch?v=9Ht5RZpzPqw"],
    date:  ["Fri 8/04"]
};
artist[7] = {
    name:  ["DJ Snake"],
    audio: ["src/audio/dj-snake.mp3"],
    link:  ["https://www.youtube.com/watch?v=IvPT2QuCIOA"],
    date:  ["Fri 8/04"]
};
artist[8] = {
    name:  ["Justice"],
    audio: ["src/audio/justice.mp3"],
    link:  ["https://www.youtube.com/watch?v=tCnBrrnOefs"],
    date:  ["Sun 8/06"]
};
artist[9] = {
    name:  ["Alt-J"],
    audio: ["src/audio/alt-j.mp3"],
    link:  ["https://www.youtube.com/watch?v=rVeMiVU77wo"],
    date:  ["Sat 8/05"]
};
artist[10] = {
    name:  ["Run The Jewels"],
    audio: ["src/audio/run-the-jewels.mp3"],
    link:  ["https://www.youtube.com/watch?v=1b9n0Amr9RI"],
    date:  ["Fri 8/04"]
};
artist[11] = {
    name:  ["Cage The Elephant"],
    audio: ["src/audio/cage-the-elephant.mp3"],
    link:  ["https://www.youtube.com/watch?v=lA-gGl6qihQ"],
    date:  ["Thurs 8/03"]
};
artist[12] = {
    name:  ["Wiz Khalifa"],
    audio: ["src/audio/wiz-khalifa.mp3"],
    link:  ["https://www.youtube.com/watch?v=Wa5B22KAkEk"],
    date:  ["Thurs 8/03"]
};
artist[13] = {
    name:  ["Big Sean"],
    audio: ["src/audio/big-sean.mp3"],
    link:  ["https://www.youtube.com/watch?v=phr1pOFK1V8"],
    date:  ["Sun 8/06"]
};
artist[14] = {
    name:  ["The Head And The Heart"],
    audio: ["src/audio/the-head-and-the-heart.mp3"],
    link:  ["https://www.youtube.com/watch?v=W50zP8K04-E"],
    date:  ["Sat 8/05"]
};
artist[15] = {
    name:  ["Foster The People"],
    audio: ["src/audio/foster-the-people.mp3"],
    link:  ["https://www.youtube.com/watch?v=SDTZ7iX4vTQ"],
    date:  ["Fri 8/04"]
};
artist[16] = {
    name:  ["The Shins"],
    audio: ["src/audio/the-shins.mp3"],
    link:  ["https://www.youtube.com/watch?v=RoLTPcD1S4Q"],
    date:  ["Sun 8/06"]
};
artist[17] = {
    name:  ["Ryan Adams"],
    audio: ["src/audio/ryan-adams.mp3"],
    link:  ["https://www.youtube.com/watch?v=GzZ7HvSnDQo"],
    date:  ["Fri 8/04"]
};
artist[18] = {
    name:  ["Kaskade"],
    audio: ["src/audio/kaskade.mp3"],
    link:  ["https://www.youtube.com/watch?v=NQEzap6k0Dg"],
    date:  ["Sat 8/05"]
};
artist[19] = {
    name:  ["Porter Robinson"],
    audio: ["src/audio/porter-robinson.mp3"],
    link:  ["https://www.youtube.com/watch?v=HAIDqt2aUek"],
    date:  ["Thurs 8/03"]
};
artist[20] = {
    name:  ["Zeds Dead"],
    audio: ["src/audio/zeds-dead.mp3"],
    link:  ["https://www.youtube.com/watch?v=uqzQfOKZoPc"],
    date:  ["Sun 8/06"]
};
artist[21] = {
    name:  ["Liam Gallagher"],
    audio: ["src/audio/liam-gallagher.mp3"],
    link:  ["https://www.youtube.com/watch?v=lnmEAsnjbEU"],
    date:  ["Thurs 8/03"]
};
artist[22] = {
    name:  ["Drummers Ear"],
    audio: ["src/audio/rea-sremmurd.mp3"],
    link:  ["https://www.youtube.com/watch?v=b8m9zhNAgKs"],
    date:  ["Sun 8/06"]
};
artist[23] = {
    name:  ["Glass Animals"],
    audio: ["src/audio/glass-animals.mp3"],
    link:  ["https://www.youtube.com/watch?v=8RkJhJcfOnc"],
    date:  ["Sat 8/05"]
};
artist[24] = {
    name:  ["Gramatik"],
    audio: ["src/audio/gramatik.mp3"],
    link:  ["https://www.youtube.com/watch?v=soNlDEjtkJg"],
    date:  ["Fri 8/04"]
};
artist[25] = {
    name:  ["Migos"],
    audio: ["src/audio/migos.mp3"],
    link:  ["https://www.youtube.com/watch?v=S-sJp1FfG7Q"],
    date:  ["Thurs 8/03"]
};
artist[26] = {
    name:  ["Phantogram"],
    audio: ["src/audio/phantogram.mp3"],
    link:  ["https://www.youtube.com/watch?v=a0ul-BghOAs"],
    date:  ["Fri 8/04"]
};
artist[27] = {
    name:  ["Tove Lo"],
    audio: ["src/audio/tove-lo.mp3"],
    link:  ["https://www.youtube.com/watch?v=oh2LWWORoiM"],
    date:  ["Sun 8/06"]
};
artist[28] = {
    name:  ["Spoon"],
    audio: ["src/audio/spoon.mp3"],
    link:  ["https://www.youtube.com/watch?v=D6KFBFg5q1Y"],
    date:  ["Thurs 8/03"]
};
artist[29] = {
    name:  ["Milky Chance"],
    audio: ["src/audio/milky-chance.mp3"],
    link:  ["https://www.youtube.com/watch?v=iX-QaNzd-0Y"],
    date:  ["Sun 8/06"]
};
artist[30] = {
    name:  ["Lil Uzi Vert"],
    audio: ["src/audio/lil-uzi-vert.mp3"],
    link:  ["https://www.youtube.com/watch?v=zqflC-as2Qo"],
    date:  ["Thurs 8/03"]
};
artist[31] = {
    name:  ["Vance Joy"],
    audio: ["src/audio/vance-joy.mp3"],
    link:  ["https://www.youtube.com/watch?v=zKmWd8DPrEc"],
    date:  ["Sat 8/05"]
};
artist[32] = {
    name:  ["Tegan And Sara"],
    audio: ["src/audio/tegan-and-sara.mp3"],
    link:  ["https://www.youtube.com/watch?v=WLUDxVezNes"],
    date:  ["Fri 8/04"]
};
artist[33] = {
    name:  ["Grouplove"],
    audio: ["src/audio/grouplove.mp3"],
    link:  ["https://www.youtube.com/watch?v=ng8cDzyktEY"],
    date:  ["Sun 8/06"]
};
artist[34] = {
    name:  ["Crystal Castles"],
    audio: ["src/audio/crystal-castles.mp3"],
    link:  ["https://www.youtube.com/watch?v=M7zxAI3GW2o"],
    date:  ["Fri 8/04"]
};
artist[35] = {
    name:  ["Jon Bellion"],
    audio: ["src/audio/jon-bellion.mp3"],
    link:  ["https://www.youtube.com/watch?v=h2ymJcCwS_s"],
    date:  ["Thurs 8/03"]
};
artist[36] = {
    name:  ["Kaleo"],
    audio: ["src/audio/kaleo.mp3"],
    link:  ["https://www.youtube.com/watch?v=0-7IHOXkiV8"],
    date:  ["Fri 8/04"]
};
artist[37] = {
    name:  ["Little Dragon"],
    audio: ["src/audio/little-dragon.mp3"],
    link:  ["https://www.youtube.com/watch?v=-AsLISPht_M"],
    date:  ["Fri 8/04"]
};
artist[38] = {
    name:  ["DVBBS"],
    audio: ["src/audio/dvbbs.mp3"],
    link:  ["https://www.youtube.com/watch?v=9VfAqXBJMwQ"],
    date:  ["Sun 8/06"]
};
artist[39] = {
    name:  ["Mac Demarco"],
    audio: ["src/audio/mac-demarco.mp3"],
    link:  ["https://www.youtube.com/watch?v=wIuBcb2T55Q"],
    date:  ["Sat 8/05"]
};
artist[40] = {
    name:  ["Russ"],
    audio: ["src/audio/russ.mp3"],
    link:  ["https://www.youtube.com/watch?v=oorK4RPgZ8Q"],
    date:  ["Sat 8/05"]
};
artist[41] = {
    name:  ["21 Savage"],
    audio: ["src/audio/21-savage.mp3"],
    link:  ["https://www.youtube.com/watch?v=6wtwpUwxQik"],
    date:  ["Sat 8/05"]
};
artist[42] = {   //   EMPTY!!!!
    name:  ["Lady Pills"],
    audio: ["src/audio/lady-pills.mp3"],
    link:  ["https://www.youtube.com/watch?v=56KWZopvaXY"],
    date:  ["Sat 8/05"]
};
artist[43] = {
    name:  ["Banks"],
    audio: ["src/audio/banks.mp3"],
    link:  ["https://www.youtube.com/watch?v=t99ZhG5LEVk"],
    date:  ["Sat 8/05"]
};
artist[44] = {
    name:  ["3LAU"],
    audio: ["src/audio/3lau.mp3"],
    link:  ["https://www.youtube.com/watch?v=FxhyzYz0PfI"],
    date:  ["Fri 8/04"]
};
artist[45] = {
    name:  ["George Ezra"],
    audio: ["src/audio/george-ezra.mp3"],
    link:  ["https://www.youtube.com/watch?v=VHrLPs3_1Fs"],
    date:  ["Thurs 8/03"]
};
artist[46] = {
    name:  ["Borgore"],
    audio: ["src/audio/borgore.mp3"],
    link:  ["https://www.youtube.com/watch?v=Vyr08m6yRbw"],
    date:  ["Sun 8/06"]
};
artist[47] = {
    name:  ["Sylvan Esso"],
    audio: ["src/audio/sylvan-esso.mp3"],
    link:  ["https://www.youtube.com/watch?v=h-_NNIX8cDA"],
    date:  ["Sat 8/05"]
};
artist[48] = {
    name:  ["Alison Wonderland"],
    audio: ["src/audio/alison-wonderland.mp3"],
    link:  ["https://www.youtube.com/watch?v=F5MMV5qULV0"],
    date:  ["Sat 8/05"]
};
artist[49] = {
    name:  ["LIVE"],
    audio: ["src/audio/live.mp3"],
    link:  ["https://www.youtube.com/watch?v=xsJ4O-nSveg"],
    date:  ["Sat 8/05"]
};
artist[50] = {
    name:  ["Lil Yachty"],
    audio: ["src/audio/lil-yachty.mp3"],
    link:  ["https://www.youtube.com/watch?v=251cxou3yR4"],
    date:  ["Sun 8/06"]
};
artist[51] = {
    name:  ["Whitney"],
    audio: ["src/audio/whitney.mp3"],
    link:  ["https://www.youtube.com/watch?v=CGKN6qiDqnk"],
    date:  ["Fri 8/04"]
};
artist[52] = {
    name:  ["Capital Cities"],
    audio: ["src/audio/capital-cities.mp3"],
    link:  ["https://www.youtube.com/watch?v=_2DkJjBiCWY"],
    date:  ["Thurs 8/03"]
};
artist[53] = {
    name:  ["Royal Blood"],
    audio: ["src/audio/royal-blood.mp3"],
    link:  ["https://www.youtube.com/watch?v=ZSznpyG9CHY"],
    date:  ["Sat 8/05"]
};
artist[54] = {
    name:  ["London Grammar"],
    audio: ["src/audio/london-grammar.mp3"],
    link:  ["https://www.youtube.com/watch?v=oVQqmH4ufCQ"],
    date:  ["Sun 8/06"]
};
artist[55] = {
    name:  ["Rag'N'Bone Man"],
    audio: ["src/audio/rag-n-bone-man.mp3"],
    link:  ["https://www.youtube.com/watch?v=L3wKzyIN1yk"],
    date:  ["Sun 8/06"]
};
artist[56] = {
    name:  ["Andrew McMahon"],
    audio: ["src/audio/andrew-mcmahon.mp3"],
    link:  ["https://www.youtube.com/watch?v=e5ZUfzJoG1E"],
    date:  ["Fri 8/04"]
};
artist[57] = {
    name:  ["NoName"],
    audio: ["src/audio/noname.mp3"],
    link:  ["https://www.youtube.com/watch?v=pUncXbXAiV0"],
    date:  ["Sun 8/06"]
};
artist[58] = {
    name:  ["Majid Jordan"],
    audio: ["src/audio/majid-jordan.mp3"],
    link:  [""],
    date:  ["Fri 8/04"]
};
artist[59] = {
    name:  ["Joey Bada$$"],
    audio: ["src/audio/joey-badass.mp3"],
    link:  ["https://www.youtube.com/watch?v=TeQW-9Cg8qs"],
    date:  ["Sun 8/06"]
};
artist[60] = {
    name:  ["Kaytranada"],
    audio: ["src/audio/kaytranada.mp3"],
    link:  ["https://www.youtube.com/watch?v=rKlA5tRu6f0"],
    date:  ["Thurs 8/03"]
};
artist[61] = {
    name:  ["Charli XCX"],
    audio: ["src/audio/charli-xcx.mp3"],
    link:  ["https://www.youtube.com/watch?v=ABhDiXbUaBE"],
    date:  ["Sun 8/06"]
};
artist[62] = {
    name:  ["Car Seat Headrest"],
    audio: ["src/audio/car-sea-headrest.mp3"],
    link:  ["https://www.youtube.com/watch?v=s_a1hPwXiWw"],
    date:  ["Sun 8/06"]
};
artist[63] = {
    name:  ["Slander"],
    audio: ["src/audio/slander.mp3"],
    link:  ["https://www.youtube.com/watch?v=sjkxT6lTPnk"],
    date:  ["Sun 8/06"]
};
artist[64] = {
    name:  ["Getter"],
    audio: ["src/audio/getter.mp3"],
    link:  ["https://www.youtube.com/watch?v=2YllipGl2Is"],
    date:  ["Fri 8/04"]
};
artist[65] = {
    name:  ["Nghtmre"],
    audio: ["src/audio/nghtmre.mp3"],
    link:  ["https://www.youtube.com/watch?v=N5oTnEJxMac"],
    date:  ["Sat 8/05"]
};
artist[66] = {
    name:  ["Machine Gun Kelly"],
    audio: ["src/audio/machine-gun-kelly.mp3"],
    link:  ["https://www.youtube.com/watch?v=tgvbhxb9yk8"],
    date:  ["Sun 8/06"]
};
artist[67] = {
    name:  ["The Pretty Reckless"],
    audio: ["src/audio/the-pretty-reckless.mp3"],
    link:  ["https://www.youtube.com/watch?v=BQpZv2r8fb4"],
    date:  ["Fri 8/04"]
};
artist[68] = {
    name:  ["Warpaint"],
    audio: ["src/audio/warpaint.mp3"],
    link:  ["https://www.youtube.com/watch?v=gg_OThhfXh0"],
    date:  ["Sat 8/05"]
};
artist[69] = {
    name:  ["Baauer"],
    audio: ["src/audio/baauer.mp3"],
    link:  ["https://www.youtube.com/watch?v=gxApr8QnlGY"],
    date:  ["Thurs 8/03"]
};
artist[70] = {
    name:  ["Highly Suspect"],
    audio: ["src/audio/highly-suspect.mp3"],
    link:  ["https://www.youtube.com/watch?v=l5-gja10qkw"],
    date:  ["Sat 8/05"]
};
artist[71] = {
    name:  ["Zara Larsson"],
    audio: ["src/audio/zara-larsson.mp3"],
    link:  ["https://www.youtube.com/watch?v=lbZ7BG1adGI"],
    date:  ["Sat 8/05"]
};
artist[72] = {
    name:  ["Slushii"],
    audio: ["src/audio/slushii.mp3"],
    link:  ["https://www.youtube.com/watch?v=Cst692tmseQ"],
    date:  ["Fri 8/04"]
};
artist[73] = {
    name:  ["The Drums"],
    audio: ["src/audio/the-drums.mp3"],
    link:  ["https://www.youtube.com/watch?v=yo7xVdUXj5I"],
    date:  ["Thurs 8/03"]
};
artist[74] = {
    name:  ["A-Trak"],
    audio: ["src/audio/a-trak.mp3"],
    link:  ["https://www.youtube.com/watch?v=1HcRmw7Hv2g"],
    date:  ["Thurs 8/03"]
};
artist[75] = {
    name:  ["6lack"],
    audio: ["src/audio/6lack.mp3"],
    link:  ["https://www.youtube.com/watch?v=fS9m0Ac8PCU"],
    date:  ["Sun 8/06"]
};
artist[76] = {
    name:  ["Cloud Nothings"],
    audio: ["src/audio/cloud-nothings.mp3"],
    link:  ["https://www.youtube.com/watch?v=74TP8QhupLU&feature=youtu.be"],
    date:  ["Fri 8/04"]
};
artist[77] = {
    name:  ["Tritonal"],
    audio: ["src/audio/tritonal.mp3"],
    link:  ["https://www.youtube.com/watch?v=gUrbvX4mOHg"],
    date:  ["Thurs 8/03"]
};
artist[78] = {
    name:  ["Sampha"],
    audio: ["src/audio/sampha.mp3"],
    link:  ["https://www.youtube.com/watch?v=_NSuIYwBxu4"],
    date:  ["Sun 8/06"]
};
artist[79] = {
    name:  ["Jai Wolf"],
    audio: ["src/audio/jai-wolf.mp3"],
    link:  ["https://www.youtube.com/watch?v=Z9VoDwy-3Lc"],
    date:  ["Sat 8/05"]
};
artist[80] = {
    name:  ["Ephwurd"],
    audio: ["src/audio/ephwurd.mp3"],
    link:  ["https://www.youtube.com/watch?v=4JX7XaQXDqE"],
    date:  ["Sat 8/05"]
};
artist[81] = {
    name:  ["Alvvays"],
    audio: ["src/audio/alvvays.mp3"],
    link:  ["https://www.youtube.com/watch?v=ZAn3JdtSrnY"],
    date:  ["Sat 8/05"]
};
artist[82] = {
    name:  ["Maggie Rogers"],
    audio: ["src/audio/maggie-rogers.mp3"],
    link:  ["https://www.youtube.com/watch?v=cdIBxhONpC0"],
    date:  ["Sun 8/06"]
};
artist[83] = {
    name:  ["Jidenna"],
    audio: ["src/audio/jidenna.mp3"],
    link:  ["https://www.youtube.com/watch?v=JWIqrKhP2Kg"],
    date:  ["Fri 8/04"]
};
artist[84] = {
    name:  ["Mura Masa"],
    audio: ["src/audio/mura-masa.mp3"],
    link:  ["https://www.youtube.com/watch?v=Z9doCz9P6Pw"],
    date:  ["Fri 8/04"]
};
artist[85] = {
    name:  ["NF"],
    audio: ["src/audio/nf.mp3"],
    link:  ["https://www.youtube.com/watch?v=Po5zT1krKOc"],
    date:  ["Sun 8/06"]
};
artist[86] = {
    name:  ["Gryffin"],
    audio: ["src/audio/gryffin.mp3"],
    link:  ["https://www.youtube.com/watch?v=PWhMoGt0cs8"],
    date:  ["Thurs 8/03"]
};
artist[87] = {
    name:  ["Joyryde"],
    audio: ["src/audio/joyryde.mp3"],
    link:  ["https://www.youtube.com/watch?v=qVi0kEAceik"],
    date:  ["Sun 8/06"]
};
artist[88] = {
    name:  ["CRX"],
    audio: ["src/audio/crx.mp3"],
    link:  ["https://www.youtube.com/watch?v=V8Wq2mO5XyM"],
    date:  ["Thurs 8/03"]
};
artist[89] = {
    name:  ["Temples"],
    audio: ["src/audio/temples.mp3"],
    link:  ["https://www.youtube.com/watch?v=h6zdVaAe0OE"],
    date:  ["Thurs 8/03"]
};
artist[90] = {
    name:  ["G Jones"],
    audio: ["src/audio/g-jones.mp3"],
    link:  ["https://www.youtube.com/watch?v=pZGNblFCvp0"],
    date:  ["Sat 8/05"]
};
artist[91] = {
    name:  ["$uicideboy$"],
    audio: ["src/audio/suicideboys.mp3"],
    link:  ["https://www.youtube.com/watch?v=Nbe-h8Skv3Q"],
    date:  ["Thurs 8/03"]
};
artist[92] = {
    name:  ["Bishop Briggs"],
    audio: ["src/audio/bishop-briggs.mp3"],
    link:  ["https://www.youtube.com/watch?v=h5jz8xdpR0M"],
    date:  ["Fri 8/04"]
};
artist[93] = {
    name:  ["Amine"],
    audio: ["src/audio/amine.mp3"],
    link:  ["https://www.youtube.com/watch?v=3j8ecF8Wt4E"],
    date:  ["Sat 8/05"]
};
artist[94] = {
    name:  ["Ookay"],
    audio: ["src/audio/ookay.mp3"],
    link:  ["https://www.youtube.com/watch?v=knnf2Aw6kMU"],
    date:  ["Fri 8/04"]
};
artist[95] = {
    name:  ["The Districts"],
    audio: ["src/audio/the-districts.mp3"],
    link:  ["https://www.youtube.com/watch?v=zEdWd1W3cV0"],
    date:  ["Fri 8/04"]
};
artist[96] = {
    name:  ["San Fermin"],
    audio: ["src/audio/san-fermin.mp3"],
    link:  ["https://www.youtube.com/watch?v=Ld81Y6Em3NM"],
    date:  ["Sat 8/05"]
};
artist[97] = {
    name:  ["Joseph"],
    audio: ["src/audio/joseph.mp3"],
    link:  ["https://www.youtube.com/watch?v=uVPZADVYqdI"],
    date:  ["Sun 8/06"]
};
artist[98] = {
    name:  ["Pup"],
    audio: ["src/audio/pup.mp3"],
    link:  ["https://www.youtube.com/watch?v=aa3Afg3fzAQ"],
    date:  ["Fri 8/04"]
};
artist[99] = {
    name:  ["Moose Blood"],
    audio: ["src/audio/moose-blood.mp3"],
    link:  ["https://www.youtube.com/watch?v=0P1WIpgKqcA"],
    date:  ["Fri 8/05"]
};
artist[100] = {
    name:  ["The Japanese House"],
    audio: ["src/audio/the-japanese-house.mp3"],
    link:  ["https://www.youtube.com/watch?v=LxZDxF0MyV0"],
    date:  ["Sat 8/05"]
};
artist[101] = {
    name:  ["Leon"],
    audio: ["src/audio/leon.mp3"],
    link:  ["https://www.youtube.com/watch?v=u69lXmBs08o"],
    date:  ["Sat 8/05"]
};
artist[103] = {
    name:  ["Hippo Campus"],
    audio: ["src/audio/hippo-campus.mp3"],
    link:  ["https://www.youtube.com/watch?v=n3TQKEUne5Q"],
    date:  ["Thurs 8/03"]
};
artist[104] = {
    name:  ["Honne"],
    audio: ["src/audio/honne.mp3"],
    link:  ["https://www.youtube.com/watch?v=QF_VzOIECHM"],
    date:  ["Thurs 8/03"]
};
artist[105] = {
    name:  ["MadeinTYO"],
    audio: ["src/audio/madeintyo.mp3"],
    link:  ["https://www.youtube.com/watch?v=BcyFJLrBVhA"],
    date:  ["Sat 8/05"]
};
artist[106] = {
    name:  ["Cheat Codes"],
    audio: ["src/audio/cheat-codes.mp3"],
    link:  ["https://www.youtube.com/watch?v=q1ppRNny9qU"],
    date:  ["Thurs 8/03"]
};
artist[107] = {
    name:  ["Kevin Devine"],
    audio: ["src/audio/kevin-devine.mp3"],
    link:  ["https://www.youtube.com/watch?v=1c8DFfzipZo"],
    date:  ["Thurs 8/03"]
};
artist[108] = {
    name:  ["Paper Diamond"],
    audio: ["src/audio/paper-diamond.mp3"],
    link:  ["https://www.youtube.com/watch?v=-F-6ji-uOOg"],
    date:  ["Thurs 8/03"]
};
artist[109] = {
    name:  ["Skott"],
    audio: ["src/audio/skott.mp3"],
    link:  ["https://www.youtube.com/watch?v=JxuEBt_RIRs"],
    date:  ["Fri 8/04"]
};
artist[110] = {
    name:  ["The Lemon Twigs"],
    audio: ["src/audio/the-lemon-twigs.mp3"],
    link:  ["https://www.youtube.com/watch?v=pJGzm2fF2Uo"],
    date:  ["Fri 8/04"]
};
artist[111] = {
    name:  ["The Shelters"],
    audio: ["src/audio/the-shelters.mp3"],
    link:  ["https://www.youtube.com/watch?v=t_oRcpHv2k0"],
    date:  ["Sat 8/05"]
};
artist[112] = {
    name:  ["Blossoms"],
    audio: ["src/audio/blossoms.mp3"],
    link:  ["https://www.youtube.com/watch?v=tbTmNXbH_Rs"],
    date:  ["Sat 8/05"]
};
artist[113] = {
    name:  ["Jacob Banks"],
    audio: ["src/audio/jacob-banks.mp3"],
    link:  ["https://www.youtube.com/watch?v=wjNxTyEZBMc"],
    date:  ["Sat 8/05"]
};
artist[114] = {
    name:  ["Barns Courtney"],
    audio: ["src/audio/barns-courtney.mp3"],
    link:  ["https://www.youtube.com/watch?v=hLEoictM8p4"],
    date:  ["Sun 8/06"]
};
artist[115] = {
    name:  ["Vant"],
    audio: ["src/audio/vant.mp3"],
    link:  ["https://www.youtube.com/watch?v=coeO8HWHjoc"],
    date:  ["Sun 8/06"]
};
artist[116] = {
    name:  ["Middle Kids"],
    audio: ["src/audio/middle-kids.mp3"],
    link:  ["https://www.youtube.com/watch?v=sUC7OFUbn6A"],
    date:  ["Thurs 8/03"]
};
artist[117] = {
    name:  ["White Reaper"],
    audio: ["src/audio/white-reapar.mp3"],
    link:  ["https://www.youtube.com/watch?v=B09kpkZyDtg"],
    date:  ["Thurs 8/03"]
};
artist[118] = {
    name:  ["Whethan"],
    audio: ["src/audio/whethan.mp3"],
    link:  ["https://www.youtube.com/watch?v=96Bo8n35LYw"],
    date:  ["Sun 8/06"]
};
artist[119] = {
    name:  ["Jain"],
    audio: ["src/audio/jain.mp3"],
    link:  ["https://www.youtube.com/watch?v=59Q_lhgGANc"],
    date:  ["Thurs 8/06"]
};
artist[102] = {
    name:  ["Grace Mitchell"],
    audio: ["src/audio/grace-mitchell.mp3"],
    link:  ["https://www.youtube.com/watch?v=X5zMJUidGLs"],
    date:  ["Sun 8/06"]
};
artist[116] = {
    name:  ["Mondo Cozmo"],
    audio: ["src/audio/mondo-cozmo.mp3"],
    link:  ["https://www.youtube.com/watch?v=1pOUbcbTvOU"],
    date:  ["Fri 8/04"]
};
artist[117] = {
    name:  ["San Holo"],
    audio: ["src/audio/san-holo.mp3"],
    link:  ["https://www.youtube.com/watch?v=ULHeRdgeT54"],
    date:  ["Fri 8/04"]
};
artist[118] = {
    name:  ["Blaenovon"],
    audio: ["src/audio/blaenovon.mp3"],
    link:  ["https://www.youtube.com/watch?v=6VxmbYaNUDY"],
    date:  ["Sun 8/06"]
};
artist[119] = {
    name:  ["Michael Christmas"],
    audio: ["src/audio/michael-christmas.mp3"],
    link:  ["https://www.youtube.com/watch?v=C_zpwxzNCjU"],
    date:  ["Sat 8/05"]
};
artist[120] = {
    name:  ["Lo Moon"],
    audio: ["src/audio/lo-moon.mp3"],
    link:  ["https://www.youtube.com/watch?v=bnXkMNyc794"],
    date:  ["Sun 8/06"]
};
artist[121] = {
    name:  ["Oliver Tree"],
    audio: ["src/audio/oliver-tree.mp3"],
    link:  ["https://www.youtube.com/watch?v=56zwM5B2W_k"],
    date:  ["Thurs 8/03"]
};
artist[122] = {
    name:  ["The O'My's"],
    audio: ["src/audio/the-omys.mp3"],
    link:  ["https://www.youtube.com/watch?v=msism59CuvI"],
    date:  ["Thurs 8/03"]
};
artist[123] = {
    name:  ["Flint Eastwood"],
    audio: ["src/audio/flint-eastwood.mp3"],
    link:  ["https://www.youtube.com/watch?v=HN0cp6xvGaI"],
    date:  ["Sat 8/05"]
};
artist[124] = {
    name:  ["Declan Mckenna"],
    audio: ["src/audio/declan-mckenna.mp3"],
    link:  ["https://www.youtube.com/watch?v=QHgh77iE6qc"],
    date:  ["Thurs 8/03"]
};
artist[125] = {
    name:  ["The Frights"],
    audio: ["src/audio/the-frights.mp3"],
    link:  ["https://www.youtube.com/watch?v=0e_mhn4VN7U"],
    date:  ["Fri 8/04"]
};
artist[126] = {
    name:  ["Saint Jhn"],
    audio: ["src/audio/saint-jhn.mp3"],
    link:  ["https://www.youtube.com/watch?v=R5GNIZP0ceE"],
    date:  ["Fri 8/04"]
};
artist[127] = {
    name:  ["Dirty Audio"],
    audio: ["src/audio/dirty-audio.mp3"],
    link:  ["https://www.youtube.com/watch?v=GhHIqrK3sdc"],
    date:  ["Sun 8/06"]
};
artist[128] = {
    name:  ["Unlike Pluto"],
    audio: ["src/audio/unlike-pluto.mp3"],
    link:  ["https://www.youtube.com/watch?v=lcg6wekmCRA"],
    date:  ["Thurs 8/03"]
};
artist[129] = {
    name:  ["Ron Gallo"],
    audio: ["src/audio/ron-gallo.mp3"],
    link:  ["https://www.youtube.com/watch?v=m3yqgRyHkSU"],
    date:  ["Sat 8/05"]
};
artist[131] = {
    name:  ["Bibi Bourelly"],
    audio: ["src/audio/bibi-bourelly.mp3"],
    link:  ["https://www.youtube.com/watch?v=uJPSIL3DCmY"],
    date:  ["Fri 8/04"]
};
artist[132] = {
    name:  ["Atlas Genius"],
    audio: ["src/audio/atlas-genius.mp3"],
    link:  ["https://www.youtube.com/watch?v=PeAUf-VeXbE"],
    date:  ["Thurs 8/03"]
};
artist[133] = {
    name:  ["Sofi Tukker"],
    audio: ["src/audio/sofi-tukker.mp3"],
    link:  ["https://www.youtube.com/watch?v=gDoZz4ET3nw"],
    date:  ["Sun 8/06"]
};
artist[134] = {
    name:  ["Xavier Omar"],
    audio: ["src/audio/xavier-omar.mp3"],
    link:  ["https://www.youtube.com/watch?v=aP2Sen3HP-4"],
    date:  ["Sun 8/06"]
};
artist[135] = {
    name:  ["Young Bombs"],
    audio: ["src/audio/young-bombs.mp3"],
    link:  ["https://www.youtube.com/watch?v=I6LY5Rct7V0"],
    date:  ["Sat 8/05"]
};
artist[136] = {
    name:  ["Missio"],
    audio: ["src/audio/missio.mp3"],
    link:  ["https://www.youtube.com/watch?v=AHukwv_VX9A"],
    date:  ["Fri 8/04"]
};
artist[137] = {
    name:  ["The Loundon Souls"],
    audio: ["src/audio/the-loundon-souls.mp3"],
    link:  ["https://www.youtube.com/watch?v=S9_V_U7R7JU"],
    date:  ["Sat 8/05"]
};
artist[138] = {
    name:  ["Cobi"],
    audio: ["src/audio/cobi.mp3"],
    link:  ["https://www.youtube.com/watch?v=96pQTiPWDpA"],
    date:  ["Fri 8/04"]
};
artist[139] = {
    name:  ["A R I Z O N A"],
    audio: ["src/audio/arizona.mp3"],
    link:  ["https://www.youtube.com/watch?v=i-eX8ri3pr0"],
    date:  ["Thurs 8/03"]
};
artist[140] = {
    name:  ["Moksi"],
    audio: ["src/audio/moksi.mp3"],
    link:  ["https://www.youtube.com/watch?v=ffuh0WaEt_E"],
    date:  ["Fri 8/04"]
};
artist[141] = {
    name:  ["Gibbz"],
    audio: ["src/audio/gibbz.mp3"],
    link:  ["https://www.youtube.com/watch?v=cYID_TnNTjs"],
    date:  ["Thurs 8/03"]
};
artist[142] = {
    name:  ["Boogie"],
    audio: ["src/audio/boogie.mp3"],
    link:  ["https://www.youtube.com/watch?v=JPl4FJKCeAU"],
    date:  ["Sun 8/06"]
};
artist[143] = {
    name:  ["888"],
    audio: ["src/audio/888.mp3"],
    link:  ["https://www.youtube.com/watch?v=zWAk_CUmpIo"],
    date:  ["Sat 8/05"]
};
artist[144] = {
    name:  ["Wingtip"],
    audio: ["src/audio/wingtip.mp3"],
    link:  ["https://www.youtube.com/watch?v=QfYka1LOAWg"],
    date:  ["Sat 8/05"]
};
artist[145] = {
    name:  ["Wax Motif"],
    audio: ["src/audio/wax-motif.mp3"],
    link:  ["https://www.youtube.com/watch?v=d-rf_gT1leM"],
    date:  ["Sun 8/06"]
};
artist[136] = {
    name:  ["Pham"],
    audio: ["src/audio/pham.mp3"],
    link:  ["https://www.youtube.com/watch?v=uuPMXS7dd9s"],
    date:  ["Thurs 8/03"]
};
artist[137] = {
    name:  ["We Are The Grand"],
    audio: ["src/audio/we-are-the-grand.mp3"],
    link:  ["https://www.youtube.com/watch?v=ywdw4n370eA"],
    date:  ["Sat 8/05"]
};
artist[138] = {
    name:  ["Michael Blume"],
    audio: ["src/audio/michael-blume.mp3"],
    link:  ["https://www.youtube.com/watch?v=1qsC-tGRRgw"],
    date:  ["Thurs 8/03"]
};
artist[139] = {
    name:  ["Slothrust"],
    audio: ["src/audio/slothrust.mp3"],
    link:  ["https://www.youtube.com/watch?v=yjhP1j-7Asw"],
    date:  ["Fri 8/04"]
};
artist[140] = {
    name:  ["Elohim"],
    audio: ["src/audio/elohim.mp3"],
    link:  ["https://www.youtube.com/watch?v=DzOpGMg8g5M"],
    date:  ["Thurs 8/03"]
};
artist[141] = {
    name:  ["Colony House"],
    audio: ["src/audio/colony-house.mp3"],
    link:  ["https://www.youtube.com/watch?v=PcoIbdT6n9I"],
    date:  ["Sat 8/05"]
};
artist[142] = {
    name:  ["Stanaj"],
    audio: ["src/audio/stanaj.mp3"],
    link:  ["https://www.youtube.com/watch?v=7dayEcfvmbQ"],
    date:  ["Thurs 8/03"]
};
artist[143] = {
    name:  ["The Walters"],
    audio: ["src/audio/the-walters.mp3"],
    link:  ["https://www.youtube.com/watch?v=E1V_8LPIPxA"],
    date:  ["Sun 8/06"]
};
artist[144] = {
    name:  ["Allan Rayman"],
    audio: ["src/audio/allan-rayman.mp3"],
    link:  ["https://www.youtube.com/watch?v=vRtXAtzItZM"],
    date:  ["Fri 8/04"]
};
artist[145] = {
    name:  ["Duckwrth"],
    audio: ["src/audio/duckwrth.mp3"],
    link:  ["https://www.youtube.com/watch?v=vV71CEm-svU"],
    date:  ["Sun 8/06"]
};
artist[146] = {
    name:  ["Frenship"],
    audio: ["src/audio/frenship.mp3"],
    link:  ["https://www.youtube.com/watch?v=E8EMeAp1qLo"],
    date:  ["Fri 8/04"]
};
artist[147] = {
    name:  ["Spencer Ludwig"],
    audio: ["src/audio/spencer-ludwig.mp3"],
    link:  ["https://www.youtube.com/watch?v=M1Du2te2TBs"],
    date:  ["Sun 8/06"]
};
artist[148] = {
    name:  ["Flor"],
    audio: ["src/audio/flor.mp3"],
    link:  ["https://www.youtube.com/watch?v=kTwq6SKE-_U"],
    date:  ["Sun 8/06"]
};
artist[149] = {
    name:  ["Kweku Collins"],
    audio: ["src/audio/kweku-collins.mp3"],
    link:  ["https://www.youtube.com/watch?v=nl6OW07A5q4"],
    date:  ["Thurs 8/03"]
};
artist[150] = {
    name:  ["Harriet Brown"],
    audio: ["src/audio/harriet-brown.mp3"],
    link:  ["https://www.youtube.com/watch?v=k78KxrtvJcA"],
    date:  ["Fri 8/04"]
};
artist[151] = {
    name:  ["DJ Who"],
    audio: ["src/audio/dj-who.mp3"],
    link:  ["https://www.youtube.com/watch?v=iCrQQwiAZek"],
    date:  ["Fri 8/04"]
};
artist[152] = {
    name:  ["Brayton Bowman"],
    audio: ["src/audio/brayton-bowman.mp3"],
    link:  ["https://www.youtube.com/watch?v=zissHAc_Vqw"],
    date:  ["Sat 8/05"]
};
artist[153] = {
    name:  ["Goody Grace"],
    audio: ["src/audio/goody-grace.mp3"],
    link:  ["https://www.youtube.com/watch?v=6eedOjgbtTM"],
    date:  ["Sun 8/06"]
};
artist[154] = {
    name:  ["Jesse Malin"],
    audio: ["src/audio/jesse-malin.mp3"],
    link:  ["https://www.youtube.com/watch?v=1vAhriKOSFU"],
    date:  ["Fri 8/04"]
};
artist[155] = {
    name:  ["Max"],
    audio: ["src/audio/max.mp3"],
    link:  ["https://www.youtube.com/watch?v=5-xVwxqjNyI"],
    date:  ["Thurs 8/03"]
};
artist[156] = {
    name:  ["Tucker Beathard"],
    audio: ["src/audio/tucker-beathard.mp3"],
    link:  ["https://www.youtube.com/watch?v=PnUmqiCd2nU"],
    date:  ["Sun 8/06"]
};
artist[157] = {
    name:  ["Caitlin Smith"],
    audio: ["src/audio/caitlin-smith.mp3"],
    link:  ["https://www.youtube.com/watch?v=ajT4Xn1UNoU"],
    date:  ["Fri 8/04"]
};
artist[158] = {
    name:  ["Golf Clap"],
    audio: ["src/audio/golf-clap.mp3"],
    link:  ["https://www.youtube.com/watch?v=5rogRYzuI_g"],
    date:  ["Thurs 8/03"]
};
artist[159] = {
    name:  ["Boogie T"],
    audio: ["src/audio/boogie-t.mp3"],
    link:  ["https://www.youtube.com/watch?v=gvhYuYqMjaE"],
    date:  ["Sun 8/06"]
};
artist[160] = {
    name:  ["Nathan Scott"],
    audio: ["src/audio/nathan-scott.mp3"],
    link:  ["https://www.youtube.com/watch?v=LUF2q89iOuI"],
    date:  ["Sat 8/05"]
};


