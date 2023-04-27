feather.replace();
let focusLength = -1;
let my_videoDevices
const getCameraSelection = async () => {
    const devices = await navigator.mediaDevices?.enumerateDevices();
    const videoDevices = devices.filter((device) => device.kind === "videoinput");
    my_videoDevices = devices;
    if (videoDevices[0]) {
        //TODO find the other cameras on the phone
        // document.querySelector("body").innerHTML = JSON.stringify(devices)
        return videoDevices[0];
    } else {
        return null;
    }
};

const ios = () => {
    if (typeof window === `undefined` || typeof navigator === `undefined`) return false;
  
    return /iPhone|iPad|iPod/i.test(navigator.userAgent || navigator.vendor || (window.opera && opera.toString() === `[object Opera]`));
};
  
var isiPhone = ios();
document.getElementById("btn_capture").addEventListener("click", function() {
    if( !isiPhone ) {
        getCameraSelection()
            .then((r) => {
        
                sessionStorage.setItem(
                    "camera",
                    JSON.stringify({
                        ...constraints,
                        deviceId: { exact: r.deviceId },
                    })
                );
            })
            .catch(
                () =>
                (document.querySelector("body").innerHTML =
                    "Please open this page via mobile device")
            );
    } else {
        document.getElementById("btn_ios_capture").click();
    }
})

var degtorad = Math.PI / 180; // Degree-to-Radian conversion

function compassHeading(alpha, beta, gamma) {

    var _x = beta ? beta * degtorad : 0; // beta value
    var _y = gamma ? gamma * degtorad : 0; // gamma value
    var _z = alpha ? alpha * degtorad : 0; // alpha value

    var cX = Math.cos(_x);
    var cY = Math.cos(_y);
    var cZ = Math.cos(_z);
    var sX = Math.sin(_x);
    var sY = Math.sin(_y);
    var sZ = Math.sin(_z);

    // Calculate Vx and Vy components
    var Vx = - cZ * sY - sZ * sX * cY;
    var Vy = - sZ * sY + cZ * sX * cY;

    // Calculate compass heading
    var compassHeading = Math.atan(Vx / Vy);

    // Convert compass heading to use whole unit circle
    if (Vy < 0) {
        compassHeading += Math.PI;
    } else if (Vx < 0) {
        compassHeading += 2 * Math.PI;
    }

    return compassHeading * (180 / Math.PI); // Compass Heading (in degrees)

}
sessionStorage.setItem("stream", "stopped");
// auto started device orientation
function deviceOrientationHandler(event) {
    if (sessionStorage.getItem("camera")) {
        // document.querySelector("body").innerHTML = my_videoDevices;
        // return;

        let alpha = (event.alpha).toFixed(1);
        let beta = (event.beta).toFixed(1);
        let gamma = (event.gamma).toFixed(1);

        alpha = (180 - compassHeading(alpha, beta, gamma)).toFixed(1);
        if (beta > 85 && beta < 95)
            gamma = 0;

        const displayCover = document.querySelector(".display-cover");
        const video = document.querySelector("video");
        const canvas = document.querySelector("canvas");
        const gradientImages = document.querySelector(".gradient-images");
        const alphaBetta = document.querySelector(".alphaBetta");
        const playButton = document.querySelector(".play");
        const showResultButton = document.querySelector(".showResult");
        const loading = document.querySelector(".loading");
        const sphereImage = document.querySelector(".sphereImage");
        const centerCircle = document.querySelector(".center");
        const centerSquare = document.querySelector(".square");
        const warningText = document.querySelector(".warning_text");

        // <p>ABS ${event.absolute} </p>
        alphaBetta.innerHTML = `
            <p>α   ${alpha} </p>
            <p>β  ${beta} </p>
            <p>τ  ${gamma} </p>
         `;

        let streamStarted = false;
        //when already photographed needCountPhoto(38) photos
        if (sessionStorage.getItem("countPhoto")) {
            if (+sessionStorage.getItem("countPhoto") === needCountPhoto) {
                video.style.display = "none";
                playButton.style.display = "none";
                alphaBetta.style.display = "none";
                warningText.style.display = "none";
                centerCircle.style.display = "none";
                centerSquare.style.display = "none";
                gradientImages.style.display = "none";
                //turn off camera
                const mediaStream = video.srcObject;
                const tracks = mediaStream.getTracks();
                tracks.forEach((track) => track.stop());
                if (loading.style.display === "block") {
                    showResultButton.style.display = "none";
                } else {
                    showResultButton.style.display = "block";
                }
            }
        }

        const verifySphere = () => {
            setTimeout(async () => {
                await fetch(
                    `${ENV_SERVER_DOMAIN_ENDPOINT}/getSphereGenerationStatus?sessionID=${sessionStorage.getItem(
                        "sessionID"
                    )}`
                )
                    .then((response) => response.text())
                    .then((data) => {
                        if (!data) {
                            verifySphere();
                        } else {
                            sessionStorage.setItem("resultSphere", data);
                            // it's a bad way
                            if (data[0] === "<") {
                                verifySphere();
                            } else {
                                setTimeout(() => {
                                    window.open(
                                        `${ENV_WEB_SITE_URL}/demo-new-look-beta?id=${sessionStorage.getItem(
                                            "sessionID"
                                        )}_o`,
                                        "_self"
                                    );
                                }, 2000);
                            }
                        }
                    })
                    .catch(() => {
                        verifySphere();
                        // loading.innerHTML = JSON.stringify(e);
                    });
            }, 7000);
        };

        if (sessionStorage.getItem("resultSphere")) {
            document.querySelector(".image").style.display = "block";
            sphereImage.src = sessionStorage.getItem("resultSphere");
            loading.style.display = "none";
            showResultButton.style.display = "none";
        }
        showResultButton.onclick = async () => {
            if (sessionStorage.getItem("sessionID")) {
                loading.style.display = "block";
                showResultButton.disabled = true;
                showResultButton.style.display = "none";

                await fetch(
                    `${ENV_SERVER_DOMAIN_ENDPOINT}/generateSphere?sessionID=${sessionStorage.getItem(
                        "sessionID"
                    )}`,
                    { headers: { "Content-Type": "application/json" } }
                )
                    .then((response) => response.text())
                    .then((data) => console.log(data))
                    .finally(() => verifySphere());
            }
        };
        let onlyFirstStartStream = false;
        // function for open camera
        const startStream = async (constraints) => {
            video.srcObject = await navigator.mediaDevices.getUserMedia(constraints);
            // const videoTrack = video.srcObject.getVideoTracks()[0];
            // const trackCapabilities = videoTrack.getCapabilities();
            // const maxFocusDistance = trackCapabilities.focusDistance.max;

            // videoTrack.applyConstraints({ advanced: [{ focusMode: "manual", focusDistance: maxFocusDistance }] })
            //     .then(function () {
            //         focusLength = maxFocusDistance;
            //     })
            //     .catch(function (error) {
            //         console.log(error);
            //     });

            playButton.classList.add("d-none");
            playButton.style.display = "none";
            streamStarted = true;
            onlyFirstStartStream = true;
        };
        playButton.onclick = async () => {
            if (sessionStorage.getItem("stream") !== "started") {
                if (!sessionStorage.getItem("images")) {
                    sessionStorage.setItem("images", JSON.stringify([]));
                }
                if (!sessionStorage.getItem("state")) {
                    sessionStorage.setItem(
                        "state",
                        JSON.stringify(stateForGradientImages)
                    );
                }
                if (
                    streamStarted &&
                    +sessionStorage.getItem("countPhoto") !== needCountPhoto
                ) {
                    video.play();
                    playButton.classList.add("d-none");
                    return;
                }
                if (
                    "mediaDevices" in navigator &&
                    navigator.mediaDevices.getUserMedia
                ) {
                    if (sessionStorage.getItem("camera")) {
                        await startStream(JSON.parse(sessionStorage.getItem("camera")));
                        centerCircle.style.display = "block";
                        centerSquare.style.display = "block";
                    }
                }
            }
        };
        // for AutoStarting
        if (
            sessionStorage.getItem("camera") &&
            playButton.style.display !== "none"
        ) {
            if (+sessionStorage.getItem("countPhoto") !== needCountPhoto) {
                playButton.onclick();
                sessionStorage.setItem("stream", "started");
            }
        }
        const transformStyleGenerator = (gradient, beta, translateX) => {
            return `translate(${translateX}vw, ${-(gradient.beta - beta)}vh)
                            perspective(300px)
                            rotateY(${-translateX * 1.5}deg)
                            rotateX(${-(gradient.beta - beta)}deg)`;
        };
        // function for photographing
        const doScreenshot = (gradient) => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext("2d").drawImage(video, 0, 0);
            const images = JSON.parse(sessionStorage.getItem("images"));

            let fileName = `img${gradient.id}_${alpha}_${beta}_${gamma}_${focusLength.toFixed(4)}.png`;

            const d = new Date();
            let sessionID;
            if (sessionStorage.getItem("sessionID")) {
                sessionID = sessionStorage.getItem("sessionID");
            } else {
                sessionID = `Pack_${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}_${d.getHours()}-${d.getMinutes()}-${d.getSeconds()}_rand${Math.floor(
                    Math.random() * 50000
                )}`;
                sessionStorage.setItem("sessionID", sessionID);
            }

            const formData = new FormData();

            const urlToFile = async (url, filename, mimeType) => {
                const res = await fetch(url);
                const buf = await res.arrayBuffer();
                true;
                return new File([buf], filename, { type: mimeType });
            };
            const base64toFile = async () => {
                const file = await urlToFile(
                    canvas.toDataURL("image/jpeg"),
                    `image${gradient.id}.png`,
                    "text/plain"
                );
                formData.append("sessionID", sessionID);
                formData.append("imageName", fileName);
                formData.append("file", file);
                await fetch(`${ENV_SERVER_DOMAIN_ENDPOINT}/spherePartUpload`, {
                    method: "post",
                    body: formData,
                })
                    .then((response) => response.text())
                    .then(() => {
                        if (sessionStorage.getItem("countPhoto")) {
                            sessionStorage.setItem(
                                "countPhoto",
                                +sessionStorage.getItem("countPhoto") + 1
                            );
                        } else {
                            sessionStorage.setItem("countPhoto", 1);
                        }
                        sessionStorage.setItem(
                            "images",
                            JSON.stringify(
                                [
                                    ...images,
                                    {
                                        src: `${ENV_PHOTOSPHERE_CAPTURES_URL}/${sessionID}/${fileName}`, // alpha,
                                        forSorting: gradient.id,
                                    },
                                ].sort((a, b) => a.forSorting - b.forSorting)
                            )
                        );
                    })
                    .catch((e) => JSON.stringify(e));
            };

            base64toFile();
        };

        gradientImages.innerHTML = "";
        let readyToScan = 0;
        playButton.classList.forEach((item) => {
            if (item === "d-none") {
                readyToScan = 1;
            }
        });

        if (readyToScan) {
            const state = JSON.parse(sessionStorage.getItem("state"));
            state?.forEach((gradient) => {
                if (gradient.forCircles) {
                    const div = document.createElement("div");
                    div.className = `div-${gradient.name} parentForCircles`;
                    gradientImages.appendChild(div);
                }
                const readyForScreenShot = () => {
                    if (document.querySelector(`.circleBig_${gradient.id}`)) {
                        document.querySelector(`.circleBig_${gradient.id}`).remove();
                        document.querySelector(`.guideDiv_${gradient.id}`).remove();
                    }
                    warningText.style.display = "none";
                    if (!gradient.readyToPhotographed) {
                        const time = new Date().getTime();
                        sessionStorage.setItem("fixTime", time);
                        centerCircle.style.background = guideColor;
                        centerSquare.style.background = squareColor;
                        gradient.readyToPhotographed = true;
                    } else {
                        if (sessionStorage.getItem("fixTime")) {
                            if (
                                new Date().getTime() - waitCapturingTime >
                                sessionStorage.getItem("fixTime")
                            ) {
                                gradient.photographed = true;
                                centerCircle.style.background = "none";
                                centerSquare.style.background = "none";
                                gradient.readyToPhotographed = false;
                                doScreenshot(gradient);
                            }
                        }
                    }
                };
                const forRemoveCircleAndWarningText = () => {
                    if (document.querySelector(`.circleBig_${gradient.id}`)) {
                        document.querySelector(`.circleBig_${gradient.id}`).remove();
                        document.querySelector(`.guideDiv_${gradient.id}`).remove();
                    }
                    gradient.readyToPhotographed = false;
                };
                const guidePosition = () => {
                    gradient.readyToPhotographed = false;
                    warningText.style.display = "none";
                    document.querySelector(`.smallCircle${gradient.id}`).style.background = rangeColor;

                    let translateX = -(gradient.alpha - alpha) * (deltaAngle < 25 ? 3 : 2);
                    if (gradient.name === "ceiling") {
                        translateX = 0;
                    }
                    if (!document.querySelector(`.circleBig_${gradient.id}`)) {
                        centerCircle.style.background = "none";
                        centerSquare.style.background = "none";
                        const guideDiv = document.createElement("div");
                        const guideCircle = document.createElement("div");
                        guideDiv.className = `guideDiv guideDiv_${gradient.id}`;
                        guideCircle.className = `circleBig circleBig_${gradient.id}`;
                        displayCover.appendChild(guideDiv);
                        displayCover.appendChild(guideCircle);
                        guideCircle.style.transform = transformStyleGenerator(
                            gradient,
                            beta,
                            translateX
                        );
                        guideDiv.style.transform = transformStyleGenerator(
                            gradient,
                            beta,
                            translateX
                        );
                    } else {
                        document.querySelector(
                            `.circleBig_${gradient.id}`
                        ).style.transform = transformStyleGenerator(
                            gradient,
                            beta,
                            translateX
                        );
                        document.querySelector(
                            `.guideDiv_${gradient.id}`
                        ).style.transform = transformStyleGenerator(
                            gradient,
                            beta,
                            translateX
                        );
                    }
                };
                const span = document.createElement("span");
                span.className = gradient.photographed
                    ? `photographed circle smallCircle${gradient.id}`
                    : `noPhotographed circle smallCircle${gradient.id}`;
                if (gradient.readyToPhotographed) {
                    span.classList.add("readyPhotographed");
                }
                document.querySelector(`.div-${gradient.name}`).appendChild(span);


                if (
                    (
                        gradient.alpha - 5 < alpha &&
                        gradient.alpha + 5 > alpha &&
                        gradient.beta + 5 > beta &&
                        gradient.beta - 5 < beta &&
                        gradient.alpha > 85 &&
                        gradient.alpha < 95 &&
                        !gradient.photographed) ||
                    (
                        gradient.alpha - 5 < alpha &&
                        gradient.alpha + 5 > alpha &&
                        gradient.beta + 5 > beta &&
                        gradient.beta - 5 < beta &&
                        5 > gamma &&
                        gamma > -5 &&
                        !gradient.photographed) ||
                    (
                        (gradient.name === "ceiling" || gradient.name === "floor") &&
                        gradient.beta + 5 > beta &&
                        gradient.beta - 5 < beta &&
                        5 > gamma &&
                        gamma > -5 &&
                        !gradient.photographed
                    )) {
                    readyForScreenShot();
                    if (document.querySelector(`.circleBig_${gradient.id}`)) {
                        document.querySelector(`.circleBig_${gradient.id}`).remove();
                        document.querySelector(`.guideDiv_${gradient.id}`).remove();
                    }
                } else if (
                    (
                        gradient.alpha - 30 < alpha &&
                        gradient.alpha + 30 > alpha &&
                        gradient.beta + 60 > beta &&
                        gradient.beta - 60 < beta &&
                        !gradient.photographed) ||
                    (
                        (gradient.name === "ceiling" || gradient.name === "floor") &&
                        gradient.beta + 60 > beta &&
                        gradient.beta - 60 < beta &&
                        !gradient.photographed)

                ) {
                    if (!gradient.photographed) {
                        guidePosition();
                    } else {
                        document.querySelector(
                            `.smallCircle${gradient.id}`
                        ).style.background = rangeColor;
                        forRemoveCircleAndWarningText();
                    }
                } else {
                    forRemoveCircleAndWarningText();
                }
            }

            );
            sessionStorage.setItem("state", JSON.stringify([...state]));
        }
    }
}
// window.addEventListener(
//     "deviceorientation",
//     deviceOrientationHandler,
//     false
// );
if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', deviceOrientationHandler, false);
} else {
    // document.querySelector("body").innerHTML = "Device orientation not supported in this browser.";
    console.error('Device orientation not supported in this browser.');
}

