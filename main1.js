const templateSource = document.getElementById("marker-template").innerHTML;
const template = Handlebars.compile(templateSource);

// Example Data for Multiple Markers
const markerData = {
    markers: [
        { id: "marker1", preset: "hiro", modelPath: "flamingo.glb", audioPath: "flamingo.mp3" },
        { id: "marker2", preset: "kanji", modelPath: "labrador.glb", audioPath: "flamingo.mp3" },
    ]
};

// Inject compiled template into the scene
document.querySelector("a-scene").innerHTML += template(markerData);

// Attach event listeners to each marker & model
markerData.markers.forEach(marker => {
    const markerElement = document.querySelector(`#${marker.id}`);
    const model = document.querySelector(`#model_${marker.id}`);
    const audio = document.querySelector(`#audio_${marker.id}`);
    let checkInterval = null;
    let isAnimating = false;

    // Handle Marker Found
    markerElement.addEventListener("markerFound", () => {
        console.log(`Marker ${marker.id} found`);
        checkCrosshairAlignment(markerElement, model);
        model.setAttribute("visible", true);

        // Play audio if not already playing
        if (audio.paused) {
            audio.play();
        }
    });

    // Handle Marker Lost
    markerElement.addEventListener("markerLost", () => {
        console.log(`Marker ${marker.id} lost`);
        model.setAttribute("visible", false);
        clearInterval(checkInterval);
    });

    // Toggle animation and audio on screen click
    document.addEventListener("click", () => {
        console.log(`Screen clicked for ${marker.id}`);

        if (isAnimating) {
            model.removeAttribute("animation-mixer");
            console.log("Animation Stopped");
            isAnimating = false;
        } else {
            model.setAttribute("animation-mixer", "loop: repeat");
            console.log("Animation Started");

            // Play audio if paused
            if (audio.paused) {
                audio.play();
            }
            isAnimating = true;
        }
    });

    // Function to check crosshair alignment
    function checkCrosshairAlignment(marker, model) {
        const camera = document.querySelector("a-entity[camera]");

        // Clear previous interval before starting a new one
        if (checkInterval) {
            clearInterval(checkInterval);
        }

        checkInterval = setInterval(() => {
            if (!marker.object3D.visible) {
                clearInterval(checkInterval);
                return;
            }

            const markerPos = marker.object3D.position;
            const cameraPos = camera.object3D.position;

            // Calculate distance between camera and marker
            const distance = Math.sqrt(
                Math.pow(markerPos.x - cameraPos.x, 2) +
                Math.pow(markerPos.y - cameraPos.y, 2) +
                Math.pow(markerPos.z - cameraPos.z, 2)
            );

            console.log(`Distance to ${marker.id}:`, distance);

            if (distance < 2.7) { // Adjust threshold
                console.log("Model Visible!");
                model.setAttribute("visible", true);
            } else {
                model.setAttribute("visible", false);
            }
        }, 500); // Check alignment every 500ms
    }
});