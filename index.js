const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// fake database (in memory)
let profiles = {};

// save profile
app.post("/save", (req, res) => {
  const { username, bio, links } = req.body;
  profiles[username] = { username, bio, links };
  res.json({ success: true });
});

// get profile
app.get("/:username", (req, res) => {
  const user = profiles[req.params.username];
  if (!user) return res.send("User not found");
  
  res.send(`
  <html>
  <head>
    <title>${user.username}</title>
    <style>
      body {
        margin:0;
        font-family: Arial;
        background: linear-gradient(135deg, #0f0f0f, #1a1a1a);
        color:white;
        display:flex;
        align-items:center;
        justify-content:center;
        height:100vh;
      }
      .card {
        text-align:center;
        padding:30px;
        border-radius:20px;
        background: rgba(255,255,255,0.05);
        backdrop-filter: blur(10px);
        box-shadow: 0 0 40px rgba(0,0,0,0.6);
        animation: fadeIn 1s ease;
      }
      h1 {
        margin-bottom:10px;
      }
      a {
        display:block;
        margin:10px 0;
        padding:10px;
        border-radius:10px;
        background:#111;
        color:white;
        text-decoration:none;
        transition:0.3s;
      }
      a:hover {
        background:#222;
        transform: scale(1.05);
      }
      @keyframes fadeIn {
        from {opacity:0; transform:translateY(20px);}
        to {opacity:1; transform:translateY(0);}
      }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>@${user.username}</h1>
      <p>${user.bio}</p>
      ${user.links.map(l => `<a href="${l.url}" target="_blank">${l.title}</a>`).join("")}
    </div>
  </body>
  </html>
  `);
});

// editor page
app.get("/", (req, res) => {
  res.send(`
  <html>
  <body style="background:#0f0f0f;color:white;font-family:sans-serif;text-align:center;padding:40px">
    <h1>Create your bio</h1>
    <input id="username" placeholder="username"><br><br>
    <input id="bio" placeholder="bio"><br><br>
    <input id="linkTitle" placeholder="link title"><br><br>
    <input id="linkUrl" placeholder="link url"><br><br>
    <button onclick="addLink()">Add Link</button>
    <button onclick="save()">Save</button>

    <script>
      let links = [];

      function addLink() {
        const title = document.getElementById("linkTitle").value;
        const url = document.getElementById("linkUrl").value;
        links.push({ title, url });
        alert("Added!");
      }

      async function save() {
        const username = document.getElementById("username").value;
        const bio = document.getElementById("bio").value;

        await fetch("/save", {
          method:"POST",
          headers: { "Content-Type":"application/json" },
          body: JSON.stringify({ username, bio, links })
        });

        alert("Saved! Go to /" + username);
      }
    </script>
  </body>
  </html>
  `);
});

app.listen(3000, () => console.log("Running"));
