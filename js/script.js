const fromText = document.querySelector(".from-text");
const toText = document.querySelector(".to-text");
const exchageIcon = document.querySelector(".exchange");
const selectTag = document.querySelectorAll("select");
const icons = document.querySelectorAll(".row i");

let voices = []; // Array para almacenar las voces disponibles

// Cargar las voces disponibles
speechSynthesis.onvoiceschanged = () => {
    voices = speechSynthesis.getVoices();
};

// Función para obtener la voz según el idioma
function getVoiceByLang(lang) {
    return voices.find(voice => voice.lang.startsWith(lang)) || voices[0];
}

// Poblar los select con los idiomas disponibles
selectTag.forEach((tag, id) => {
    for (let country_code in countries) {
        let selected = id == 0 ? country_code == "en-GB" ? "selected" : "" : country_code == "de-DE" ? "selected" : "";
        let option = `<option ${selected} value="${country_code}">${countries[country_code]}</option>`;
        tag.insertAdjacentHTML("beforeend", option);
    }
});

// Intercambiar los textos y los idiomas cuando se hace clic en el ícono de intercambio
exchageIcon.addEventListener("click", () => {
    let tempText = fromText.value,
        tempLang = selectTag[0].value;
    fromText.value = toText.value;
    toText.value = tempText;
    selectTag[0].value = selectTag[1].value;
    selectTag[1].value = tempLang;
});

// Traducir automáticamente cuando el usuario escribe en el campo "fromText"
fromText.addEventListener("input", () => {
    let text = fromText.value.trim();
    let translateFrom = selectTag[0].value;
    let translateTo = selectTag[1].value;
    
    // Si no hay texto, no traducir
    if (!text) {
        toText.value = "";
        return;
    }

    toText.setAttribute("placeholder", "Traduciendo...");
    
    // Usamos la API de MyMemory para traducir
    let apiUrl = `https://api.mymemory.translated.net/get?q=${text}&langpair=${translateFrom}|${translateTo}`;
    
    fetch(apiUrl)
        .then(res => res.json())
        .then(data => {
            toText.value = data.responseData.translatedText;
            data.matches.forEach(data => {
                if (data.id === 0) {
                    toText.value = data.translation;
                }
            });
            toText.setAttribute("placeholder", "Traduciendo");
        });
});

// Funcionalidad de copiar y escuchar el texto
icons.forEach(icon => {
    icon.addEventListener("click", ({ target }) => {
        if (!fromText.value || !toText.value) return;

        let utterance;
        if (target.id == "from") {
            utterance = new SpeechSynthesisUtterance(fromText.value);
            // Asignar la voz correspondiente al idioma de origen
            utterance.voice = getVoiceByLang(selectTag[0].value);
        } else {
            utterance = new SpeechSynthesisUtterance(toText.value);
            // Asignar la voz correspondiente al idioma de destino
            utterance.voice = getVoiceByLang(selectTag[1].value);
        }

        // Reproducir la pronunciación
        speechSynthesis.speak(utterance);
        
        // Copiar al portapapeles si se hace clic en el ícono de copiar
        if (target.classList.contains("fa-copy")) {
            if (target.id == "from") {
                navigator.clipboard.writeText(fromText.value);
            } else {
                navigator.clipboard.writeText(toText.value);
            }
        }
    });
});