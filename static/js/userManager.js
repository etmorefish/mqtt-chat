// 用户身份管理
const userManager = {
    // 生成UUID
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    // 获取或创建用户ID
    getUserId() {
        let userId = localStorage.getItem('userId');
        if (!userId) {
            userId = 'user-' + this.generateUUID();
            localStorage.setItem('userId', userId);
        }
        return userId;
    },

    // 获取显示名称
    getDisplayName() {
        return localStorage.getItem('displayName') || '';
    },

    // 保存显示名称
    setDisplayName(name) {
        localStorage.setItem('displayName', name);
        return name;
    },

    // 获取完整用户信息
    getUserInfo() {
        const displayName = this.getDisplayName();
        return {
            userId: this.getUserId(),
            displayName: displayName,
            avatar: displayName.charAt(0).toUpperCase()
        };
    }
}; 