// Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyD9Yu33oCbBfX6QFA3mB32hY-NboGU42Fc",
  authDomain: "testgpt-65b2b.firebaseapp.com",
  projectId: "testgpt-65b2b",
  storageBucket: "testgpt-65b2b.appspot.com",
  messagingSenderId: "1067958736606",
  appId: "1:1067958736606:web:aefd75ab0da6cff677944f",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get the current user
const user = firebase.auth().currentUser;
const db = firebase.firestore();
const usersRef = db.collection("users");

// Check if the user is logged in
firebase.auth().onAuthStateChanged(async function (user) {
  if (user) {
    // User is signed in, so you can allow access to your main.js page
    console.log("User is logged in.");

    const userEmail = user.email.toLowerCase();
    const querySnapshot = await usersRef.where("email", "==", userEmail).get();
    let foundId, foundUser;
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      // console.log(doc.id, " => ", doc.data());
      foundId = doc.id;
      foundUser = doc.data();
    });

    try {
      if (!foundUser.isAccepted) {
        window.location.href = "sign-in.html";
      } else {
        document.querySelector(".loader").remove();
      }
    } catch (err) {
      console.log(err);
      window.location = "index.html";
    }
  } else {
    // User is not signed in, so you should redirect them to the sign-in page
    console.log("User is not logged in.");
    window.location.href = "sign-in.html";
  }
});

let apiKey = "";

let messages = [];

function init() {
  inputField.addEventListener("keyup", (e) => {
    if (e.keyCode === 13) {
      if (inputField.value.trim() !== "") {
        handle_QUERY();
        inputField.value = "";
      }
    }
  });
  submitBtn.addEventListener("click", () => {
    if (inputField.value.trim() !== "") {
      handle_QUERY();
      inputField.value = "";
    }
  });
}

function handle_QUERY() {
  const div = document.createElement("div");
  div.classList.add("message");
  div.classList.add("user");
  div.innerHTML = inputField.value;
  results.appendChild(div);

  results.scrollTop = results.scrollHeight;

  messages.push({
    role: "user",
    content: inputField.value,
  });

  fetch(`https://api.openai.com/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages,
      max_tokens: 100,
      temperature: 1,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      messages.push({
        role: "assistant",
        content: data.choices[0].message.content,
      });

      const div = document.createElement("div");
      div.classList.add("message");
      div.classList.add("bot");
      results.appendChild(div);

      const message = data.choices[0].message.content;
      const typingSpeed = 25; // milliseconds per character

      for (let i = 0; i < message.length; i++) {
        setTimeout(() => {
          div.innerHTML += message[i];
          results.scrollTop = results.scrollHeight;
        }, i * typingSpeed);
      }
    });
}
fetch("./config.json")
  .then((response) => response.json())
  .then((data) => {
    apiKey = data.apiKey;
    init();
  });
