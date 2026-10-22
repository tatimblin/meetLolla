// The Lollapalooza 2017 lineup as printed on the official admat: one entry per festival day,
// `rows` in poster billing order (row 0 = the top-billed names), names in the poster's own
// spelling/capitalisation. A name with a `slug` has a clip at src/audio/<slug>.mp3 (see
// artists.js); a name without one is display-only. `also` holds artists.js entries that are not
// printed on the admat (late additions), shown after the poster rows for their day.
// Kidzapalooza (the kids' stage) is intentionally left out: none of its acts have clips.

const n = (name, slug) => (slug ? { name, slug } : { name });

export const days = [
  {
    id: "thu",
    label: "Thursday",
    date: "Aug 3, 2017",
    rows: [
      [n("MUSE", "muse"), n("LORDE", "lorde"), n("CAGE THE ELEPHANT", "cage-the-elephant"), n("WIZ KHALIFA", "wiz-khalifa")],
      [n("PORTER ROBINSON", "porter-robinson"), n("LIAM GALLAGHER", "liam-gallagher"), n("MIGOS", "migos"), n("SPOON", "spoon"), n("LIL UZI VERT", "lil-uzi-vert")],
      [n("JON BELLION", "jon-bellion"), n("GEORGE EZRA", "george-ezra"), n("CAPITAL CITIES", "capital-cities"), n("KAYTRANADA", "kaytranada"), n("BAAUER", "bauer")],
      [n("THE DRUMS"), n("A-TRAK", "a-trak"), n("TRITONAL", "tritonal"), n("GRYFFIN", "gryffin"), n("CRX", "crx"), n("TEMPLES", "temples"), n("$UICIDEBOY$", "suicideboys")],
      [n("HIPPO CAMPUS", "hippo-campus"), n("HONNE", "honne"), n("CHEAT CODES", "cheat-codes"), n("KEVIN DEVINE", "kevin-devine"), n("PAPER DIAMOND", "paper-diamond")],
      [n("MIDDLE KIDS", "middle-kids"), n("THE HUNNA"), n("OLIVER TREE", "oliver-tree"), n("JAIN", "jain"), n("THE O'MY'S", "the-omys")],
      [n("DECLAN MCKENNA", "declan-mckenna"), n("UNLIKE PLUTO", "unlike-pluto"), n("ATLAS GENIUS", "atlas-genius"), n("A R I Z O N A", "arizona"), n("GIBBZ", "gibbz")],
      [n("PHAM", "pham"), n("MICHAEL BLUME", "michael-blume"), n("ELOHIM", "elohim"), n("STANAJ", "stanaj"), n("KWEKU COLLINS", "kweku-collins"), n("MAX", "max")],
    ],
    also: [n("WHITE REAPER", "white-reaper"), n("GOLF CLAP", "golf-clap")],
  },
  {
    id: "fri",
    label: "Friday",
    date: "Aug 4, 2017",
    rows: [
      [n("THE KILLERS", "the-killers 1"), n("BLINK-182", "blink-182"), n("DJ SNAKE", "dj-snake"), n("RUN THE JEWELS", "run-the-jewels")],
      [n("FOSTER THE PEOPLE", "foster-the-people"), n("RYAN ADAMS", "ryan-adams"), n("GRAMATIK", "gramatik"), n("PHANTOGRAM", "phantogram")],
      [n("TEGAN AND SARA", "tegan-and-sara"), n("CRYSTAL CASTLES", "crystal-castles"), n("KALEO", "kaleo"), n("LITTLE DRAGON", "little-dragon"), n("3LAU", "3lau")],
      [n("WHITNEY", "whitney"), n("ANDREW MCMAHON IN THE WILDERNESS", "andrew-mcmahon"), n("MAJID JORDAN")],
      [n("GETTER", "getter"), n("THE PRETTY RECKLESS", "the-pretty-reckless"), n("SLUSHII", "slushii"), n("CLOUD NOTHINGS", "cloud-nothings"), n("JIDENNA", "jidenna")],
      [n("MURA MASA", "mura-masa"), n("BISHOP BRIGGS", "bishop-briggs"), n("OOKAY", "ookay"), n("THE DISTRICTS", "the-districts"), n("PUP", "pup"), n("MOOSE BLOOD", "moose-blood")],
      [n("SKOTT", "skott"), n("THE LEMON TWIGS", "the-lemon-twigs"), n("MONDO COZMO", "mondo-cozmo"), n("SAN HOLO", "san-holo"), n("THE FRIGHTS", "the-frights")],
      [n("SAINT JHN", "saint-jhn"), n("BIBI BOURELLY", "bibi-bourelly"), n("MISSIO", "missio"), n("COBI", "cobi"), n("MOKSI", "moksi"), n("SLOTHRUST", "slothrust")],
      [n("ALLAN RAYMAN", "allan-rayman"), n("FRENSHIP", "frenship"), n("HARRIET BROWN", "harriet-brown"), n("JESSE MALIN", "jesse-malin")],
    ],
    also: [n("DJ WHO", "dj-who"), n("CAITLYN SMITH", "caitlyn-smith")],
  },
  {
    id: "sat",
    label: "Saturday",
    date: "Aug 5, 2017",
    rows: [
      [n("CHANCE THE RAPPER", "chance-the-rapper"), n("THE XX", "the-xx"), n("ALT-J", "alt-j"), n("THE HEAD AND THE HEART", "the-head-and-the-heart")],
      [n("KASKADE", "kaskade"), n("GLASS ANIMALS", "glass-animals"), n("VANCE JOY", "vance-joy"), n("MAC DEMARCO", "mac-demarco"), n("RUSS", "russ")],
      [n("21 SAVAGE", "21-savage"), n("BANKS", "banks"), n("SYLVAN ESSO", "sylvan-esso"), n("ALISON WONDERLAND", "alison-wonderland"), n("LĪVE", "live")],
      [n("ROYAL BLOOD", "royal-bood"), n("NGHTMRE", "nghtmre"), n("WARPAINT", "warpaint"), n("HIGHLY SUSPECT", "highly-suspect"), n("ZARA LARSSON", "zara-larsson")],
      [n("JAI WOLF", "jai-wolf"), n("EPHWURD", "ephwurd"), n("ALVVAYS", "alvvays"), n("G JONES", "g-jones"), n("AMINÉ", "amine"), n("SAN FERMIN", "san-fermin")],
      [n("THE JAPANESE HOUSE", "the-japanese-house"), n("LÉON", "leon"), n("THE SHELTERS", "the-shelters"), n("BLOSSOMS", "blossoms"), n("JACOB BANKS", "jacob-banks")],
      [n("MICHAEL CHRISTMAS", "michael-christmas"), n("FLINT EASTWOOD", "flint-eastwood"), n("RON GALLO", "ron-gallo"), n("MADEINTYO", "madeintyo"), n("YOUNG BOMBS", "young-bombs")],
      [n("THE LONDON SOULS", "the-london-souls"), n("888", "888"), n("WINGTIP", "wingtip"), n("COLONY HOUSE", "colony-house"), n("BRAYTON BOWMAN", "brayton-bowman"), n("LADY PILLS", "lady-pills")],
    ],
    also: [n("WE ARE THE GRAND", "we-are-the-grand"), n("NATHAN SCOTT", "nathan-scott")],
  },
  {
    id: "sun",
    label: "Sunday",
    date: "Aug 6, 2017",
    rows: [
      [n("ARCADE FIRE", "arcade-fire"), n("JUSTICE", "justice"), n("BIG SEAN", "big-sean"), n("THE SHINS", "the-shins"), n("ZEDS DEAD", "zeds-dead")],
      [n("RAE SREMMURD", "rae-sremmurd"), n("TOVE LO", "tove-lo"), n("MILKY CHANCE", "milky-chance"), n("GROUPLOVE", "grouplove"), n("DVBBS", "dvbbs")],
      [n("BORGORE", "borgore"), n("LIL YACHTY", "lil-yachty"), n("LONDON GRAMMAR", "london-grammar"), n("RAG'N'BONE MAN", "rag-n-bone-man")],
      [n("NONAME", "noname"), n("JOEY BADA$$", "joey-badass"), n("CHARLI XCX", "charli-xcx"), n("CAR SEAT HEADREST", "car-seat-headrest"), n("SLANDER", "slander")],
      [n("MACHINE GUN KELLY", "machine-gun-kelly"), n("6LACK", "6lack"), n("SAMPHA", "sampha"), n("MAGGIE ROGERS", "maggie-rogers"), n("NF", "nf"), n("JOYRYDE", "joyryde")],
      [n("JOSEPH", "joseph"), n("BARNS COURTNEY", "barns-courtney"), n("VANT", "vant"), n("GRACE MITCHELL", "grace-mitchell"), n("BLAENOVON", "blaenovon"), n("LO MOON", "lo-moon")],
      [n("DIRTY AUDIO", "dirty-audio"), n("WHETHAN", "wethan"), n("SOFI TUKKER", "sofi-tukker"), n("XAVIER OMÄR", "xavier-omar"), n("BOOGIE", "boogie"), n("WAX MOTIF", "wax-motif")],
      [n("THE WALTERS", "the-walters"), n("DUCKWRTH", "duckwrth"), n("SPENCER LUDWIG", "spencer-ludwig"), n("FLOR", "flor"), n("GOODY GRACE", "goody-grace"), n("TUCKER BEATHARD", "tucker-beathard")],
    ],
    also: [n("BOOGIE T", "boogie-t")],
  },
];
