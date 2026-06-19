// URL ini otomatis ngebaca file chat.js di dalam folder netlify/functions/
const BACKEND_URL = "/.netlify/functions/chat";

async function kirimPesan() {
    const inputField = document.getElementById("user-input");
    const pesan = inputField.value.trim();
    
    if (!pesan) return;

    tambahPesanLayar(pesan, "user-msg");
    inputField.value = ""; 

    const loadingId = tambahPesanLayar('<div class="typing-dots"><span></span><span></span><span></span></div>', "ai-msg", true);

    try {
        // Nge-fetch ke fungsi internal Netlify
        const response = await fetch(BACKEND_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                pesan: pesan 
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP Error! Status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        const balasanAI = data.choices[0].message.content;
        const targetMessageElement = document.getElementById(loadingId).querySelector('.msg-content');
        targetMessageElement.innerText = balasanAI;

    } catch (error) {
        const targetMessageElement = document.getElementById(loadingId).querySelector('.msg-content');
        targetMessageElement.innerText = `Aduh bos, ada kendala: ${error.message}`;
    }
}

function tambahPesanLayar(teks, className, isHTML = false) {
    const chatBox = document.getElementById("chat-box");
    const welcomeScreen = document.getElementById("welcome-screen");
    if (welcomeScreen) welcomeScreen.style.display = "none";

    const msgDiv = document.createElement("div");
    const msgId = "msg-" + Date.now() + Math.random().toString(36).substr(2, 5);
    msgDiv.id = msgId;
    msgDiv.className = "message " + className;
    
    if (className === "user-msg") {
        msgDiv.innerHTML = `<div class="msg-content"></div>`;
        msgDiv.querySelector('.msg-content').textContent = teks;
    } 
    else if (className === "ai-msg") {
        if (isHTML) {
            msgDiv.innerHTML = `
                <div class="ai-avatar"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
                <div class="msg-content">${teks}</div>
            `;
        } else {
            msgDiv.innerHTML = `
                <div class="ai-avatar"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
                <div class="msg-content"></div>
            `;
            msgDiv.querySelector('.msg-content').textContent = teks;
        }
    }
    
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    return msgId;
}

function handleEnter(event) {
    if (event.key === "Enter") {
        kirimPesan();
    }
}
