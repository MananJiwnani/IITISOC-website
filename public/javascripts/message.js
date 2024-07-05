(function() {
  const app = document.querySelector(".app");
  const socket = io();

  let uname;
  let roomid;

  // Handle user joining
  app.querySelector(".join-screen #join-user").addEventListener("click", function() {
    let name = app.querySelector(".join-screen #username").value;
     roomid = app.querySelector(".join-screen #roomid").value;
    if (name.length == 0 || roomid.length == 0) {
      return;
    }
    uname = name;
    const button1=document.getElementById("join-user");
    button1.addEventListener("click",function(){
      if (name !== "" && roomid !== "") {
            socket.emit("join_room", roomid);
            socket.emit("newUser", name, roomid);
            app.querySelector(".join-screen").classList.remove("active");
            app.querySelector(".chat-screen").classList.add("active");
          }
    
          else{
            return;
          }
        });
      });
   
  // Handle sending message
  app.querySelector(".chat-screen #send-message").addEventListener("click", function() {
    let message = app.querySelector(".chat-screen #message-input").value;
    if (message.length == 0) {
      return;
    }
    renderMessage("my", {
      name: uname,
      text: message,
    });
    socket.emit("chat", {
      name: uname,
      text: message,
    }, roomid);
    app.querySelector(".chat-screen #message-input").value = "";
  });

  // Handle user exiting chat
  app.querySelector(".chat-screen #exit-chat").addEventListener("click", function() {
    socket.emit("exitUser", uname, roomid);
    window.location.href = window.location.href; // Reload the page
  });

  // Receive updates from the server
  socket.on("update", function(update) {
    renderMessage("update", update);
  });

  // Receive chat messages from the server
  socket.on("chat", function(message) {
    renderMessage("other", message);
  });

  // Render messages to the chat screen
  let messageContainer;
  function renderMessage(type, message) {
    messageContainer = app.querySelector(".chat-screen .messages");
    let el = document.createElement("div");

    if (type == "my") {
      el.setAttribute("class", "message my-message");
      el.innerHTML = `
        <div>
          <div class="name">You</div>
          <div class="text">${message.text}</div>
        </div>`;
    } else if (type == "other") {
      el.setAttribute("class", "message other-message");
      el.innerHTML = `
        <div>
          <div class="name">${message.name}</div>
          <div class="text">${message.text}</div>
        </div>`;
    } else if (type == "update") {
      el.setAttribute("class", "update");
      el.innerText = message;
    }

    messageContainer.appendChild(el);

    // Scroll chat to end
    messageContainer.scrollTop = messageContainer.scrollHeight - messageContainer.clientHeight;
  }
})();

