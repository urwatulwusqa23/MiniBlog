const connection = new signalR.HubConnectionBuilder()
    .withUrl("/notificationHub")
    .build();

connection.start().catch(err => console.error(err));

connection.on("ReceiveNotification", (message) => {
    alert(message); // Display an alert when a new post is added
});
