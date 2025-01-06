const socket = io(window.location.origin, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
});

socket.on('connect', () => {
    console.log('Connected to server');
    // 发送用户信息
    const userInfo = userManager.getUserInfo();
    if (userInfo.displayName) {
        socket.emit('user_join', userInfo);
    }
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

socket.on('chat_message', (data) => {
    const message = JSON.parse(data.data);
    displayMessage(message);
});

socket.on('error', (error) => {
    console.error('Error:', error);
    alert('发送消息失败：' + error.error);
});

// 添加用户相关事件处理
socket.on('user_online', (user) => {
    console.log('User online:', user);
    showSystemMessage(`${user.displayName} 加入了聊天室`);
});

socket.on('user_offline', (user) => {
    console.log('User offline:', user);
    showSystemMessage(`${user.displayName} 离开了聊天室`);
});

socket.on('user_updated', (data) => {
    console.log('User updated:', data);
    showSystemMessage(`${data.old.displayName} 修改昵称为 ${data.new.displayName}`);
});

socket.on('online_users', (users) => {
    console.log('Online users:', users);
    // 这里可以更新在线用户列表UI
});

function sendMessage() {
    const userInfo = userManager.getUserInfo();
    const messageInput = document.getElementById('message');
    const message = messageInput.value.trim();
    
    if (!userInfo.displayName) {
        alert('请先输入昵称');
        return;
    }
    
    if (message) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        socket.emit('chat_message', {
            userId: userInfo.userId,
            username: userInfo.displayName,
            message: message,
            timestamp: timeString
        });

        messageInput.value = '';
        messageInput.style.height = '80px';
    }
}

function displayMessage(message) {
    const messageDiv = document.getElementById('messages');
    const msgContainer = document.createElement('div');
    msgContainer.className = 'mb-4';
    
    // 创建消息行
    const messageRow = document.createElement('div');
    messageRow.className = 'flex';
    
    // 使用 userManager 来判断是否是当前用户
    const isCurrentUser = message.userId === userManager.getUserId();
    
    // 创建头像
    const avatar = document.createElement('div');
    avatar.className = `w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-medium ${
        isCurrentUser ? 'ml-2 bg-wechat' : 'mr-2 bg-blue-500'
    }`;
    avatar.textContent = message.username.charAt(0).toUpperCase();
    
    // 创建消息内容区域
    const contentContainer = document.createElement('div');
    contentContainer.className = 'flex flex-col max-w-[70%]';
    if (isCurrentUser) {
        contentContainer.className += ' items-end ml-auto';
    }
    
    // 创建用户名和时间
    const userInfo = document.createElement('div');
    userInfo.className = 'text-xs text-gray-500 mb-1 px-1';
    userInfo.textContent = isCurrentUser ? 
        `${message.timestamp}` :
        `${message.username}  ${message.timestamp}`;
    
    // 创建消息气泡
    const bubble = document.createElement('div');
    bubble.className = isCurrentUser 
        ? 'bg-wechat-light text-black p-3 rounded-2xl rounded-tr-sm break-words whitespace-pre-wrap cursor-pointer hover:bg-opacity-90 transition-colors'
        : 'bg-msg-bg text-black p-3 rounded-2xl rounded-tl-sm break-words whitespace-pre-wrap shadow-sm cursor-pointer hover:bg-opacity-90 transition-colors';
    
    if (message.type === 'image') {
        bubble.innerHTML = message.message;  // 对于图片消息，使用innerHTML
        // 移除点击复制功能
        bubble.style.cursor = 'default';
    } else {
        bubble.textContent = message.message;
        // 保持原有的点击复制功能
        bubble.addEventListener('click', () => {
            // 创建临时文本区域
            const textArea = document.createElement('textarea');
            textArea.value = message.message;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            
            try {
                // 选择文本
                textArea.select();
                textArea.setSelectionRange(0, 99999); // 对于移动设备
                
                // 尝试使用新API
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(message.message)
                        .then(showToast)
                        .catch(fallbackCopy);
                } else {
                    fallbackCopy();
                }
            } catch (err) {
                console.error('复制失败:', err);
                alert('复制失败，请手动复制');
            } finally {
                document.body.removeChild(textArea);
            }
        });
    }
    
    // 显示提示toast
    function showToast() {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm';
        toast.textContent = '已复制到剪贴板';
        document.body.appendChild(toast);
        
        // 1.5秒后移除提示
        setTimeout(() => {
            toast.classList.add('opacity-0', 'transition-opacity');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 1500);
    }
    
    // 回退到传统复制方法
    function fallbackCopy() {
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                showToast();
            } else {
                throw new Error('复制失败');
            }
        } catch (err) {
            console.error('复制失败:', err);
            alert('复制失败，请手动复制');
        }
    }
    
    // 组装消息
    contentContainer.appendChild(userInfo);
    contentContainer.appendChild(bubble);
    if (isCurrentUser) {
        messageRow.appendChild(contentContainer);
        messageRow.appendChild(avatar);
    } else {
        messageRow.appendChild(avatar);
        messageRow.appendChild(contentContainer);
    }
    msgContainer.appendChild(messageRow);
    messageDiv.appendChild(msgContainer);
    
    // 滚动到最新消息
    messageDiv.scrollTop = messageDiv.scrollHeight;
}

// 自动调整文本框高度
function adjustTextareaHeight() {
    const messageInput = document.getElementById('message');
    messageInput.style.height = '80px';  // 设置为初始高度
    const scrollHeight = messageInput.scrollHeight;
    if (scrollHeight > 80) {  // 只有当内容超过初始高度时才调整
        messageInput.style.height = Math.min(scrollHeight, 128) + 'px';
    }
}

// 将事件监听器包装在 DOMContentLoaded 事件中
document.addEventListener('DOMContentLoaded', function() {
    const messageInput = document.getElementById('message');
    
    // 监听输入事件来调整高度
    messageInput.addEventListener('input', adjustTextareaHeight);
    
    // 处理按键事件
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            if (e.ctrlKey) {
                // Ctrl + Enter: 插入换行
                const start = this.selectionStart;
                const end = this.selectionEnd;
                const value = this.value;
                this.value = value.substring(0, start) + '\n' + value.substring(end);
                this.selectionStart = this.selectionEnd = start + 1;
                adjustTextareaHeight();
                e.preventDefault();
            } else if (!e.shiftKey) {
                // 仅 Enter: 发送消息
                e.preventDefault();
                sendMessage();
            }
        }
    });

    // 初始化高度
    messageInput.style.height = '80px';

    // 初始化表情选择器
    initEmojiPicker();
    
    // 点击其他地方时关闭表情选择器
    document.addEventListener('click', function(e) {
        const picker = document.getElementById('emojiPicker');
        const emojiButton = e.target.closest('button[onclick="toggleEmojiPicker()"]');
        if (!picker.contains(e.target) && !emojiButton) {
            picker.classList.add('hidden');
        }
    });

    // 初始化用户信息
    initUserInfo();
});

// 添加表情功能
const emojis = ['😀', '😂', '🤣', '😊', '😍', '🥰', '😘', '😎', '🤔', '😏', '😮', '😭', '😱', '😡', '🥳', '🤮', '🤧', '😷', '🤠', '😈', '👻', '👍', '👎', '👌', '✌️', '🤞', '🙏', '💪', '🧠', '👀', '💩', '❤️', '💔', '💯', '💢', '💤', '💦', '🎉', '✨', '💫', '🌟'];

function initEmojiPicker() {
    const picker = document.getElementById('emojiPicker');
    emojis.forEach(emoji => {
        const button = document.createElement('button');
        button.className = 'p-1 hover:bg-gray-100 rounded';
        button.textContent = emoji;
        button.onclick = () => insertEmoji(emoji);
        picker.appendChild(button);
    });
}

function toggleEmojiPicker() {
    const picker = document.getElementById('emojiPicker');
    picker.classList.toggle('hidden');
}

function insertEmoji(emoji) {
    const messageInput = document.getElementById('message');
    const start = messageInput.selectionStart;
    const end = messageInput.selectionEnd;
    const text = messageInput.value;
    messageInput.value = text.substring(0, start) + emoji + text.substring(end);
    messageInput.selectionStart = messageInput.selectionEnd = start + emoji.length;
    messageInput.focus();
}

// 图片上传功能
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        alert('请选择图片文件');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {  // 5MB限制
        alert('图片大小不能超过5MB');
        return;
    }
    
    compressImage(file, function(compressedImage) {
        sendImage(compressedImage);
    });
}

// 添加图片压缩函数
function compressImage(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            
            // 计算缩放比例
            const maxSize = 800;
            if (width > maxSize || height > maxSize) {
                if (width > height) {
                    height *= maxSize / width;
                    width = maxSize;
                } else {
                    width *= maxSize / height;
                    height = maxSize;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // 转换为较小的 JPEG 格式
            canvas.toBlob(function(blob) {
                const reader = new FileReader();
                reader.onloadend = function() {
                    callback(reader.result);
                }
                reader.readAsDataURL(blob);
            }, 'image/jpeg', 0.7); // 压缩质量为 0.7
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function sendImage(imageData) {
    const username = document.getElementById('username').value;
    if (!username) {
        alert('请输入用户名');
        return;
    }
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    socket.emit('chat_message', {
        username: username,
        message: `<img src="${imageData}" class="max-w-full rounded-lg cursor-pointer" alt="用户上传的图片" onclick="previewImage(this.src)">`,
        timestamp: timeString,
        type: 'image'
    });
}

// 添加图片预览功能
function previewImage(src) {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
    overlay.onclick = () => document.body.removeChild(overlay);
    
    const img = document.createElement('img');
    img.src = src;
    img.className = 'max-w-[90%] max-h-[90vh] object-contain';
    
    overlay.appendChild(img);
    document.body.appendChild(overlay);
}

// 拖拽相关函数
function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
}

function handleDragEnter(event) {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('dragOverlay').classList.remove('hidden');
}

function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    const overlay = document.getElementById('dragOverlay');
    // 确保鼠标真的离开了区域而不是进入了子元素
    const rect = overlay.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
        overlay.classList.add('hidden');
    }
}

function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('dragOverlay').classList.add('hidden');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            if (file.size > 5 * 1024 * 1024) {  // 5MB限制
                alert('图片大小不能超过5MB');
                return;
            }
            compressImage(file, function(compressedImage) {
                sendImage(compressedImage);
            });
        } else {
            alert('请拖拽图片文件');
        }
    }
}

// 初始化用户信息
function initUserInfo() {
    const userInfo = userManager.getUserInfo();
    const displayNameInput = document.getElementById('displayName');
    const userAvatar = document.getElementById('userAvatar');
    
    displayNameInput.value = userInfo.displayName;
    userAvatar.textContent = userInfo.avatar;
    
    // 如果没有显示名称，要求用户输入
    if (!userInfo.displayName) {
        displayNameInput.focus();
    }
}

// 更新显示名称
function updateDisplayName() {
    const displayNameInput = document.getElementById('displayName');
    const newName = displayNameInput.value.trim();
    
    if (!newName) {
        alert('请输入昵称');
        return;
    }
    
    const oldName = userManager.getDisplayName();
    userManager.setDisplayName(newName);
    
    // 更新头像
    const userAvatar = document.getElementById('userAvatar');
    userAvatar.textContent = newName.charAt(0).toUpperCase();
    
    // 检查连接状态并发送更新
    if (socket.connected) {
        const userInfo = userManager.getUserInfo();
        
        if (!oldName) {
            // 首次设置昵称
            socket.emit('user_join', userInfo);
        } else {
            // 更新昵称
            socket.emit('name_updated', userInfo);
        }
        
        // 添加反馈提示
        showToast('昵称已更新');
    } else {
        showToast('连接已断开，请刷新页面');
    }
}

// 添加一个通用的提示函数
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // 1.5秒后移除提示
    setTimeout(() => {
        toast.classList.add('opacity-0', 'transition-opacity');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 1500);
}

// 显示系统消息
function showSystemMessage(text) {
    const messageDiv = document.getElementById('messages');
    const msgContainer = document.createElement('div');
    msgContainer.className = 'flex justify-center my-2';
    
    const systemMsg = document.createElement('div');
    systemMsg.className = 'text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full';
    systemMsg.textContent = text;
    
    msgContainer.appendChild(systemMsg);
    messageDiv.appendChild(msgContainer);
    messageDiv.scrollTop = messageDiv.scrollHeight;
} 