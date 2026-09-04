const client = io("http://127.0.0.1:3000", {
  auth: {
    token: "Bearer 123456789",
  },
});

client.on("connect", () => {
  console.log("Srever Establish Connection Successfully");
});
client.emit("sayHi", "Hello from socket io FE TO BE", (res) => {
  console.log(res);
});
client.emit("userInfo", { name: "John", age: 20 }, (res) => {
  console.log(res);
});
