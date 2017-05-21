var s = skrollr.init();

var artist = [];

artist[0] = {
    name:  ["Chance The Rapper"],
    audio: ["/src/audio/horse.mp3"],
    date:  ["Sat 8/05"]
};
artist[1] = {
    name:  ["The Killers"],
    audio: ["/src/audio/horse.mp3"],
    date:  ["Fri 8/04"]
};

var spinner = anime({
    targets: '.shuffle-next-icon',
    rotate: -720,
    duration: 3000
});

$('.shuffle-next').on('click',function(){ 
    spinner.restart();
    
    var rand = Math.floor(Math.random() * artist.length);
    
	var name  = artist[rand].name[0];
	var audio = artist[rand].audio[0];
    var date  = artist[rand].date[0];
	
    $(".shuffle-artist h1").html(name);
    $(".shuffle-date h4").html(date);
    var sourceMp3=document.getElementById('audio');
    sourceMp3.src= audio;
});

// Audio control
$('.sound-icon').on('click', function() {
    
    $('.sound-icon-speaker-cover').toggleClass('silent');
    var audioElem = document.getElementById('audio');
    if (audioElem.volume == 1)
        audioElem.volume = 0;
     else
        audioElem.volume = 1;
});

