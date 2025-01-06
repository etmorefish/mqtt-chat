// 消息存储管理
const messageStore = {
    db: null,
    dbName: 'ChatDB',
    storeName: 'messages',
    maxMessages: 200,  // 最多保存200条消息

    // 初始化数据库
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { 
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    // 创建索引以便按时间查询
                    store.createIndex('timestamp', 'timestamp');
                }
            };
        });
    },

    // 保存消息
    async saveMessage(message) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(this.storeName, 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            // 添加消息
            const request = store.add(message);
            
            request.onsuccess = () => {
                this.cleanup(); // 清理旧消息
                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    },

    // 加载最近的消息
    async loadRecentMessages() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(this.storeName, 'readonly');
            const store = transaction.objectStore(this.storeName);
            const index = store.index('timestamp');
            
            const request = index.getAll();
            request.onsuccess = () => {
                const messages = request.result;
                resolve(messages.slice(-this.maxMessages)); // 只返回最近的消息
            };
            request.onerror = () => reject(request.error);
        });
    },

    // 清理旧消息
    async cleanup() {
        const transaction = this.db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const countRequest = store.count();
        
        countRequest.onsuccess = () => {
            const total = countRequest.result;
            if (total > this.maxMessages) {
                // 获取需要删除的数量
                const deleteCount = total - this.maxMessages;
                
                // 获取所有key
                const request = store.getAllKeys();
                request.onsuccess = () => {
                    const keys = request.result;
                    // 删除最旧的消息
                    keys.slice(0, deleteCount).forEach(key => {
                        store.delete(key);
                    });
                };
            }
        };
    }
}; 