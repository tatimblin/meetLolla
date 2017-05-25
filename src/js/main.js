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
    name:  [""],
    audio: ["src/audio/21-savage.mp3"],
    link:  [""],
    date:  [""]
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
    link:  [""],
    date:  ["Sun 8/06"]
};
artist[55] = {
    name:  ["Rag'N'Bone Man"],
    audio: ["src/audio/rag-n-bone-man.mp3"],
    link:  [""],
    date:  ["Sun 8/06"]
};
artist[56] = {
    name:  ["Andrew McMahon"],
    audio: ["src/audio/andrew-mcmahon.mp3"],
    link:  [""],
    date:  ["Fri 8/04"]
};
artist[57] = {
    name:  ["NoName"],
    audio: ["src/audio/noname.mp3"],
    link:  [""],
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
    link:  [""],
    date:  ["Sun 8/06"]
};
artist[60] = {
    name:  ["Kaytranada"],
    audio: ["src/audio/kaytranada.mp3"],
    link:  [""],
    date:  ["Thurs 8/03"]
};
artist[61] = {
    name:  ["Charli XCX"],
    audio: ["src/audio/charli-xcx.mp3"],
    link:  [""],
    date:  ["Sun 8/06"]
};
artist[62] = {
    name:  ["Car Seat Headrest"],
    audio: ["src/audio/car-sea-headrest.mp3"],
    link:  [""],
    date:  ["Sun 8/06"]
};
artist[63] = {
    name:  ["Slander"],
    audio: ["src/audio/slander.mp3"],
    link:  [""],
    date:  ["Sun 8/06"]
};
artist[64] = {
    name:  ["Getter"],
    audio: ["src/audio/getter.mp3"],
    link:  [""],
    date:  ["Fri 8/04"]
};
artist[65] = {
    name:  ["Nghtmre"],
    audio: ["src/audio/nghtmre.mp3"],
    link:  [""],
    date:  ["Sat 8/05"]
};
artist[66] = {
    name:  ["Machine Gun Kelly"],
    audio: ["src/audio/machine-gun-kelly.mp3"],
    link:  [""],
    date:  ["Sun 8/06"]
};
artist[67] = {
    name:  ["The Pretty Reckless"],
    audio: ["src/audio/the-pretty-reckless.mp3"],
    link:  [""],
    date:  ["Fri 8/04"]
};
artist[68] = {
    name:  ["Warpaint"],
    audio: ["src/audio/warpaint.mp3"],
    link:  [""],
    date:  ["Sat 8/05"]
};
artist[69] = {
    name:  ["Baauer"],
    audio: ["src/audio/baauer.mp3"],
    link:  [""],
    date:  ["Thurs 8/03"]
};
artist[70] = {
    name:  ["Highly Suspect"],
    audio: ["src/audio/highly-suspect.mp3"],
    link:  [""],
    date:  ["Sat 8/05"]
};
artist[71] = {
    name:  ["Zara Larsson"],
    audio: ["src/audio/zara-larsson.mp3"],
    link:  [""],
    date:  ["Sat 8/05"]
};
artist[72] = {
    name:  ["Slushii"],
    audio: ["src/audio/slushii.mp3"],
    link:  [""],
    date:  ["Fri 8/04"]
};
artist[73] = {
    name:  ["The Drums"],
    audio: ["src/audio/the-drums.mp3"],
    link:  [""],
    date:  [""]
};
artist[74] = {
    name:  ["A-Trak"],
    audio: ["src/audio/a-trak.mp3"],
    link:  [""],
    date:  [""]
};
artist[75] = {
    name:  ["6lack"],
    audio: ["src/audio/6lack.mp3"],
    link:  [""],
    date:  [""]
};
artist[76] = {
    name:  ["Cloud Nothings"],
    audio: ["src/audio/cloud-nothings.mp3"],
    link:  [""],
    date:  [""]
};
artist[77] = {
    name:  ["Tritonal"],
    audio: ["src/audio/tritonal.mp3"],
    link:  [""],
    date:  [""]
};
artist[78] = {
    name:  ["Sampha"],
    audio: ["src/audio/sampha.mp3"],
    link:  [""],
    date:  [""]
};
artist[79] = {
    name:  ["Jai Wolf"],
    audio: ["src/audio/jai-wolf.mp3"],
    link:  [""],
    date:  [""]
};
artist[80] = {
    name:  ["Ephwurd"],
    audio: ["src/audio/ephwurd.mp3"],
    link:  [""],
    date:  [""]
};
artist[81] = {
    name:  ["Alvvays"],
    audio: ["src/audio/alvvays.mp3"],
    link:  [""],
    date:  [""]
};
artist[82] = {
    name:  ["Maggie Rogers"],
    audio: ["src/audio/maggie-rogers.mp3"],
    link:  [""],
    date:  [""]
};
artist[83] = {
    name:  ["Jidenna"],
    audio: ["src/audio/jidenna.mp3"],
    link:  [""],
    date:  [""]
};
artist[84] = {
    name:  ["Mura Masa"],
    audio: ["src/audio/mura-masa.mp3"],
    link:  [""],
    date:  [""]
};
artist[85] = {
    name:  ["NF"],
    audio: ["src/audio/nf.mp3"],
    link:  [""],
    date:  [""]
};
artist[86] = {
    name:  ["Gryffin"],
    audio: ["src/audio/gryffin.mp3"],
    link:  [""],
    date:  [""]
};
artist[87] = {
    name:  ["Joyryde"],
    audio: ["src/audio/joyryde.mp3"],
    link:  [""],
    date:  [""]
};
artist[88] = {
    name:  ["CRX"],
    audio: ["src/audio/.mp3"],
    link:  [""],
    date:  [""]
};
artist[89] = {
    name:  ["Temples"],
    audio: ["src/audio/temples.mp3"],
    link:  [""],
    date:  [""]
};
artist[90] = {
    name:  ["G Jones"],
    audio: ["src/audio/g-jones.mp3"],
    link:  [""],
    date:  [""]
};
artist[91] = {
    name:  ["$uicideboy$"],
    audio: ["src/audio/suicideboys.mp3"],
    link:  [""],
    date:  [""]
};
artist[92] = {
    name:  ["Bishop Briggs"],
    audio: ["src/audio/bishop-briggs.mp3"],
    link:  [""],
    date:  [""]
};
artist[93] = {
    name:  ["Amine"],
    audio: ["src/audio/amine.mp3"],
    link:  [""],
    date:  [""]
};
artist[94] = {
    name:  ["Ookay"],
    audio: ["src/audio/ookay.mp3"],
    link:  [""],
    date:  [""]
};
artist[95] = {
    name:  ["The Districts"],
    audio: ["src/audio/the-districts.mp3"],
    link:  [""],
    date:  [""]
};
artist[96] = {
    name:  ["San Fermin"],
    audio: ["src/audio/san-fermin.mp3"],
    link:  [""],
    date:  [""]
};
artist[97] = {
    name:  ["Joseph"],
    audio: ["src/audio/joseph.mp3"],
    link:  [""],
    date:  [""]
};
artist[98] = {
    name:  ["Pup"],
    audio: ["src/audio/pup.mp3"],
    link:  [""],
    date:  [""]
};
artist[99] = {
    name:  ["Moose Blood"],
    audio: ["src/audio/moose-blood.mp3"],
    link:  [""],
    date:  [""]
};
artist[100] = {
    name:  ["The Japanese House"],
    audio: ["src/audio/the-japanese-house.mp3"],
    link:  [""],
    date:  [""]
};
// End of base lineup
artist[83] = {
    name:  [""],
    audio: ["src/audio/.mp3"],
    link:  [""],
    date:  [""]
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

