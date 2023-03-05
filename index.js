require('dotenv').config()
const io = require("socket.io")(process.env.PORT || 8900, {
  cors: {
    origin: `${process.env.BASE_URL}`,
  },
});

//Senders
let users = [];


const addUser = (newUser, socketId) => {
  console.log('list users ONLINE: ', users);
  !users.some((user) => user.id === newUser?.id) &&
    users.push({ ...newUser, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.id === userId);
};

io.on("connection", (socket) => {
  //when ceonnect
  console.log("a user connected.");

  //take userId and socketId from user
  socket.on("addUser", (newUser) => {
    addUser(newUser, socket.id);
    io.emit("getUsers", users);
  });

  //send and get message
  socket.on("sendMessage", ({ sender, receiverId, message }) => {
    const user = getUser(receiverId);
    console.log("Tingg",user);
    io.to(user?.socketId).emit("getMessage", {
      sender,
      message,
    });
  });

  //when disconnect
  socket.on("disconnect", () => {
    console.log("a user disconnected!");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});
