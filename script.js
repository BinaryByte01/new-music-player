console.log('Lets write JS');
let currentSong = new Audio();
let songs;
let currFolder;

function convertSecondsToMinutesAndSeconds(seconds) {
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = Math.floor(seconds % 60);

    // Adding leading zeros
    var formattedMinutes = String(minutes).padStart(2, '0');
    var formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return formattedMinutes + ':' + formattedSeconds;
}


async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`${folder}`)
    let response = await a.text()
    // console.log(response)

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    // console.log(as)
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    // show the list of songs
    let songUL = document.querySelector('.songList').getElementsByTagName('ul')[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> <img src="assets/music.svg" alt="">
        <div class="info">
            <div>${song.replaceAll("%20", " ")}</div> 
            <div>Shiv Baba</div>

        </div>
        <div class="playNow">
            <span>Play Now</span>
            <img class = "invert" src="assets/playsong.svg" alt="">
        </div>
         </li>`;
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })
    });
    
    return songs;
}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track);
    currentSong.src = `/${currFolder}/` + track;
    // console.log(currFolder)
    if (!pause) {
        currentSong.play();
        play.src = "assets/pause.svg"
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track);
    document.querySelector(".songTime").innerHTML = "00:00/00:00"

}

async function displayAlbums() {
    let a = await fetch(`songs/`)
    let response = await a.text()
    let div = document.createElement("div");
    div.innerHTML = response;
    let cardContainer = document.querySelector(".cardContainer")
    let anchors = div.getElementsByTagName("a");

    let array = Array.from(anchors);

    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-1)[0];
            // get the metadata of the folder
            let a = await fetch(`songs/${folder}/info.json`)
            let response = await a.json()
            console.log(response);

                cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                <div class="playButton">
                <img src="assets/play.svg" alt="">
                </div>
                <img src="songs/${folder}/cover.jpg" alt="">
                <h3>${response.title}</h3>
                <p>${response.description}</p>
                </div>`
        }


        // load the playlist whenver card is clicked
        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                console.log(item.currentTarget.dataset.folder)
                songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
                playMusic(songs[0])
            })
        })
    }
}
async function main() {
    // get the list of songs
    await getSongs("songs/bkashmitasongs");
    playMusic(songs[0], true);

    // display all the albums on the page
    displayAlbums();

    // Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "assets/pause.svg"

            // playPause.innerHTML =  '<img src = "assets/pause.svg" alt="">';
        }
        else {
            currentSong.pause();
            play.src = "assets/playsong.svg"
        }
    })

    // Listen or timeUpdate event
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songTime").innerHTML = `${convertSecondsToMinutesAndSeconds(currentSong.currentTime)}/${convertSecondsToMinutesAndSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // add an event listner to seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    })

    // add an event listner for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    // add event listner for close button
    document.querySelector(".crossImg").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-180%";
    })

    // Add an event listener to previous song
    previous.addEventListener("click", () => {
        // console.log(currentSong);
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    // Add an event listener to next song
    next.addEventListener("click", () => {
        // console.log(currentSong);
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) > length) {
            playMusic(songs[index + 1])
        }
    })

    // Add and event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to " + e.target.value)
        currentSong.volume = parseInt(e.target.value) / 100;
    })

    // add event listner to mute the song
    document.querySelector(".volume").getElementsByTagName("img")[0].addEventListener("click", (e)=>{
        if (e.target.src.includes("assets/volume.svg")){
            e.target.src = e.target.src.replace("assets/volume.svg","assets/mute.svg"); 
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value=0;
        }

        else{
            e.target.src = e.target.src.replace("assets/mute.svg","assets/volume.svg");
            currentSong.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value=10;
        }
    })

}
main();

