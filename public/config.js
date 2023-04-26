const ENV_WEB_SITE_URL = "https://staging.dospace.tech"; //   https://demo.dospace.tech
const ENV_SERVER_DOMAIN_ENDPOINT = "https://stagnyc.com/api"; //  https://pixeria.org/api
const ENV_PHOTOSPHERE_CAPTURES_URL =
    "https://stagnyc.com/public/photosphere_captures"; //  https://pixeria.org/public/photosphere_captures

const guideColor = "#34D980";
const squareColor = "rgba(255, 255, 255, 0.35)";
const navbarColor = "#3c756a";
const rangeColor = "deepskyblue"


const angleStep = 15;
const betaCeiling = 180

const betaTop = 120
const betaMiddle = 90
const bettaBottom = 50
const betaFloor = 0

const waitCapturingTime = 700 //milliseconds

const deltaAngle = 360 / angleStep;

const needCountPhoto = angleStep * 3+2;


let stateForGradientImages = [];

stateForGradientImages.push({
    id: stateForGradientImages.length,
    name: "floor",
    alpha: 0,
    beta: betaFloor,
    readyToPhotographed: false,
    photographed: false,
    forCircles: !(0),
});

for (let i = 0; i < angleStep; i++) {
    stateForGradientImages.push({
        id: stateForGradientImages.length,
        name: "bottom",
        alpha: ((i + 0.5) * deltaAngle).toFixed(0) - 180,
        beta: bettaBottom,
        readyToPhotographed: false,
        photographed: false,
        forCircles: !((i + 1) % angleStep),
    });
}
for (let i = 0; i < angleStep; i++) {
    stateForGradientImages.push({
        id: stateForGradientImages.length,
        name: "middle",
        alpha: ((i + 0.5) * deltaAngle).toFixed(0) - 180,
        beta: betaMiddle,
        readyToPhotographed: false,
        photographed: false,
        forCircles: !((i + 1) % angleStep),
    });
}

for (let i = 0; i < angleStep; i++) {
    stateForGradientImages.push({
        id: stateForGradientImages.length,
        name: "top",
        alpha: ((i + 0.5) * deltaAngle).toFixed(0) - 180,
        beta: betaTop,
        readyToPhotographed: false,
        photographed: false,
        forCircles: !((i + 1) % angleStep),
    });
}
stateForGradientImages.push({
    id: stateForGradientImages.length,
    name: "ceiling",
    alpha: 0,
    beta: betaCeiling,
    readyToPhotographed: false,
    photographed: false,
    forCircles: !(0),
});


stateForGradientImages = [...stateForGradientImages.sort((a, b) => b.id - a.id)];


const homeButton = document.querySelector(".homeButton");
const exitButton = document.querySelector(".exitButton");

homeButton.addEventListener("click", () => {
    window.open(ENV_WEB_SITE_URL, "_self");
})
exitButton.addEventListener("click", () => {
    window.open(`${ENV_WEB_SITE_URL}/look-in-your-space-beta`, "_self");
})

const constraints = {
    audio: false,
    video: {
        facingMode: "environment",
        width: {
            min: 1280,
            ideal: 1920,
            max: 2560,
        },
        height: {
            min: 720,
            ideal: 1080,
            max: 1440,
        },
    },
};
