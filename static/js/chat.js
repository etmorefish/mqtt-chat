const socket = io(window.location.origin, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
});

socket.on('connect', () => {
    console.log('Connected to server');
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

function sendMessage() {
    const username = document.getElementById('username').value;
    const message = document.getElementById('message').value;
    
    if (username && message) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        socket.emit('chat_message', {
            username: username,
            message: message,
            timestamp: timeString
        });

        document.getElementById('message').value = '';
    } else {
        alert('请输入用户名和消息');
    }
}

function displayMessage(message) {
    const messageDiv = document.getElementById('messages');
    const msgContainer = document.createElement('div');
    msgContainer.className = 'mb-4';
    
    // 创建消息行
    const messageRow = document.createElement('div');
    messageRow.className = 'flex';
    
    const isCurrentUser = message.username === document.getElementById('username').value;
    
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
        ? 'bg-wechat-light text-black p-3 rounded-2xl rounded-tr-sm break-words cursor-pointer hover:bg-opacity-90 transition-colors'
        : 'bg-msg-bg text-black p-3 rounded-2xl rounded-tl-sm break-words shadow-sm cursor-pointer hover:bg-opacity-90 transition-colors';
    bubble.textContent = message.message;
    
    // 添加点击复制功能
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

// 将事件监听器包装在 DOMContentLoaded 事件中
document.addEventListener('DOMContentLoaded', function() {
    // 添加回车发送功能
    document.getElementById('message').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}); 