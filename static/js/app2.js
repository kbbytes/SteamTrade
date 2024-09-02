$(function() {
    var app2 = new Vue({
        el: '#apphead',
        data: {
            user: false,
        },
    });

    var socket = io.connect();

    socket.on('user', function(user) {
        user.steamID64 = user.id;
        app2.user = user;
    });
});
