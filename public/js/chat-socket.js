class ChatSocket {
    socket;
    currentId = null;
    constructor(_io) {
        var token = localStorage.getItem('token');
        console.log('token', token);
        this.socket = io({
            auth: {
                token
            }
        });
        window.socket = this.socket;
        this.InitialLoad();

        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '/login'
        })

        var input_msg = document.getElementById('send-message-input');
        input_msg.addEventListener('keyup', (e) => {
            if(this.currentId && e.keyCode == 13) {
                console.log('enter pressed', e.target.value)
                this.socket.volatile.emit("chat:send:message", {
                    userId: this.currentId,
                    message: e.target.value,
                    type: 'message'
                }, (data) => {
                    console.log('chat', data.name);
                    this.append_message('send', this.currentId, e.target.value, data.image)
                    input_msg.value = '';
                    var msg_box = document.getElementById('chat-messages');
                    msg_box.scrollTo(0, msg_box.scrollHeight);
                });
            }
        })
    }

    InitialLoad() {
        setTimeout(() => {
            this.loadUsers();
        }, 500);
        setTimeout(() => {
            if(!this.socket.connected) {
                window.location.href = "/login"
            }
        }, 2000);

        this.socket.on('user:profile', (user) => {
            console.log('user.name', user)
            try {
                document.getElementById('user-name').innerText = user.username
                this.profile_body(user.name, user.username, user.image, user.createdAt);
            } catch {}
            return;
        })

        this.socket.on('connect_error', err => handleErrors(err, 'connect_error'))
        this.socket.on('connect_failed', err => console.log(err, 'connect_failed'))
        this.socket.on('disconnect', err => console.log(err, 'disconnect'))

        this.socket.on('another:connect', old_socket => {
            console.log('another connected', this.socket.id, old_socket);
            this.socket.id == old_socket && this.socket.disconnect();
        })

        this.socket.on('new:user', user => {
            user && this.append_user(user._id, user.name, user.username, user.image);
        });

        this.socket.on('user-connected', userId => {
            console.log('user connected', userId);
            document.getElementById('online_' + userId).classList.add('bg-title')
            document.getElementById('online_' + userId).classList.add('shadow-md')
            document.getElementById('online_' + userId).classList.add('shadow-title')
        })

        this.socket.on('user-disconnected', userId => {
            console.log('user disconnected', userId);
            document.getElementById('online_' + userId).classList.remove('bg-title')
            document.getElementById('online_' + userId).classList.remove('shadow-md')
            document.getElementById('online_' + userId).classList.remove('shadow-title')
        })


        this.socket.on('message:received', msg_obj => {
            console.log('message:received got', msg_obj)
            if(this.currentId == msg_obj.senderId) {
                this.append_message('receive', this.currentId, msg_obj.message, msg_obj.image)
                var msg_box = document.getElementById('chat-messages');
                msg_box.scrollTo(0, msg_box.scrollHeight);
            }
            else {
                Toastify({
                text: msg_obj.senderName + ' send you a message',
                duration: 3000,
                onClick: () => this.getUserChat(msg_obj.senderId)
                }).showToast();
            }
        })


        this.socket.on('user:current:online', user_socket_list => {
            setTimeout(() => {
            for(let i = 0; i < user_socket_list.length; i++) {
                var online_el =  document.getElementById('online_' + user_socket_list[i].userId);
                console.log('online_el', online_el);
                if(online_el) {
                    online_el.classList.add('bg-title');
                    online_el.classList.add('shadow-md');
                    online_el.classList.add('shadow-title');
                }
            }
            }, 1000)
        })

        this.socket.on('connect',() => {
            console.log('connected to server');
        })
        this.socket.on('disconnect',() => {
            console.log('disconnected from server');
        })
    }

    loadUsers() {
        var user_box = document.getElementById('chat-users');
        user_box.innerHTML = '<div class="loader m-auto mt-12"></div>'

        this.socket.emit("user:list", (users) => {
            console.log('users', users);
            user_box.innerHTML = '';

            users.forEach(user => {
                this.append_user(user._id, user.name, user.username, user.image) // user.image
            });
        });
    }

    handleErrors(err, type) {
        console.log(type, err)
        // window.location.href = '/login'
    }

    append_user(id, name, username, image) {
        var body = `<div id="user_${id}"
        class="flex flex-row py-4 px-2 justify-center items-center border-b-2 cursor-pointer hover:opacity-90"
        onClick="chat_socket.getUserChat('${id}')"
        >
        <div class="w-1/4">
        <img
            src="/${image}"
            class="object-cover h-12 w-12 rounded-full"
            alt=""
        />
        </div>
        <div class="w-full">
        <div class="text-lg font-semibold">${name}</div>
        <span class="text-gray-500">@${username}</span>
        </div>
        <div class="w-1/4">
        <div class="h-2 w-2 rounded-full" id="online_${id}"></div>
        </div>
        </div>`

        document.getElementById('chat-users').insertAdjacentHTML('beforeend', body);
    }

    append_message(type, id, message, image) {
        var body = '';
        if(type == 'send') {
            body = `<div class="flex justify-end mb-4" id="${id}">
                <div
                class="mr-2 py-3 px-4 bg-title rounded-bl-3xl rounded-tl-3xl rounded-tr-xl text-desc"
                >
                ${message}
                </div>
                <img
                src="/${image}"
                class="object-cover h-8 w-8 rounded-full"
                alt=""
                />
            </div>`;
        }
        else {
            body = `<div class="flex justify-start mb-4" id="${id}">
                <img
                src="/${image}"
                class="object-cover h-8 w-8 rounded-full"
                alt=""
                />
                <div
                class="ml-2 py-3 px-4 bg-gray-400 rounded-br-3xl rounded-tr-3xl rounded-tl-xl text-white"
                >
                ${message}
                </div>
            </div>`;
        }

        
      document.getElementById('chat-messages').insertAdjacentHTML('beforeend', body);
    }

    profile_body(name, username, image, createdAt) {
        var body = `<div class="flex flex-col mt-2">
        <div class="font-semibold text-xl">${name}</div>
        <div class="font-light text-gray-300 pb-4">
            @${username}
        </div>
        <img
            src="/${image}"
            class="object-cover rounded-xl h-64"
            alt=""
        />
        <div class="font-semibold py-4">Created ${new Date(createdAt).toUTCString()}</div>
        </div>`;
      document.getElementById('user-profile').innerHTML = body;
    }

    getUserChat(id) {
        if(this.currentId == id) return;
        if(this.currentId) {
            var old_active_user = document.getElementById('user_' + this.currentId);
            old_active_user.classList.remove('border-l-4')
            old_active_user.classList.remove('border-title')
        }

        var active_user = document.getElementById('user_' + id);
        active_user.classList.add('border-l-4')
        active_user.classList.add('border-title')
    
        this.currentId = id;
        var msg_box = document.getElementById('chat-messages');
        msg_box.innerHTML = '';
        this.socket.emit("user:chat", id, (chat) => {
            console.log('chat', chat);
            chat.forEach(c => {
                var type = id == c.userId_1 ? 'receive' : 'send';
                console.log('type', type)
                append_message(type, c._id, c.message, c.image) // user.image
            });
            setTimeout(() => {
                msg_box.scrollTo(0, msg_box.scrollHeight);
            }, 50);
        });
    }

    
}


