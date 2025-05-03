let currentSong = new Audio();
let songs
let currFolder

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

const togglePlayPause = () => {
    if (currentSong.paused) {
        currentSong.play();
        document.getElementById("play").src = "pause.svg";
    } else {
        currentSong.pause();
        document.getElementById("play").src = "plays.svg";
    }
}

async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        console.log("Element href:", element.href);
        if (element.href.endsWith(".mp3")) {
            let song = element.href.split(`/${folder}/`)[1];
            console.log("Song found:", song); // Debugging statement
            if (song) {
                songs.push(song);
            } else {
                console.error("Song is undefined:", element.href); // Debugging statement
            }
        }
    }
    let songsUL = document.querySelector(".songList ul");
    songsUL.innerHTML = '';
    for (const song of songs) {
        let li = document.createElement("li");
        li.innerHTML = `
            <img class="invert" src="music.svg" alt="">
            <div class="songinfo">${song.replaceAll("%20", " ")}</div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="plays.svg" alt="">
            </div>
        `;
        songsUL.appendChild(li);
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".songinfo").innerHTML);
            playMusic(e.querySelector(".songinfo").innerHTML.trim());
            document.getElementById("play").src = "pause.svg";
        });
    });
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "pause.svg"
    }
    document.getElementById("play").src = "plays.svg";
    document.querySelector(".songsinfo").innerHTML = decodeURI(track)
    document.querySelector(".songduration").innerHTML = "00:00 / 00:00"
};

async function main() {
    await getSongs("songs/new");
    console.log(songs);
    playMusic(songs[0], true)

    

    let play = document.getElementById("play");
    if (play) {
        play.addEventListener("click", togglePlayPause)
    }
    document.addEventListener("keydown", (e) => {

        if (e.code === "Space") {
            e.preventDefault
            togglePlayPause()
        }
    })

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songduration").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = e.offsetX / e.target.getBoundingClientRect().width * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    });

    let ham = document.querySelector(".hamburger")
    ham.addEventListener("click",() =>{
        document.querySelector(".left").style.left = "0%"
    })
    document.querySelector(".close").addEventListener("click",() =>{
        document.querySelector(".left").style.left = "-120%"
    })

    next.addEventListener("click", () => {
      let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0])
      if((index+1) < songs.length){
        playMusic(songs[index+1])
      }
    })
    prev.addEventListener("click", () => {
      let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0])
      if((index-1) >= 0){
        playMusic(songs[index-1])
      }
    })

    document.querySelector(".volume").addEventListener("change",(e) => {
      currentSong.volume = parseInt(e.target.value)/100
    })

    Array.from(document.getElementsByClassName("card")).forEach(e =>{
        e.addEventListener("click" , async item =>{
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
        })
        if (songs.length > 0) {
            playMusic(songs[0], true); // Play the first song after fetching
        } 
    })
}

main();