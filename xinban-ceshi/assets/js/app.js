// 鑫办办公协作平台 - 核心数据管理
// 使用 localStorage 模拟云数据库

const APP_KEY = 'xinban_webapp_data_v1';

// 默认数据 - 包含测试账号
function getDefaultData() {
  return {
    users: [
      {
        _id: 'admin_user',
        username: 'admin',
        password: '123456',
        name: '超级管理员',
        department: '系统管理部',
        role: 'super_admin',
        roleName: '超级管理员',
        createTime: new Date().toISOString()
      },
      {
        _id: 'dept_admin_user',
        username: 'manager',
        password: '123456',
        name: '张经理',
        department: '技术部',
        role: 'dept_admin',
        roleName: '部门管理员',
        createTime: new Date().toISOString()
      },
      {
        _id: 'employee_user',
        username: 'employee',
        password: '123456',
        name: '李员工',
        department: '技术部',
        role: 'employee',
        roleName: '普通员工',
        createTime: new Date().toISOString()
      }
    ],
    departments: [
      { _id: 'd1', name: '系统管理部', adminId: 'admin_user' },
      { _id: 'd2', name: '技术部', adminId: 'dept_admin_user' },
      { _id: 'd3', name: '市场部', adminId: '' },
      { _id: 'd4', name: '财务部', adminId: '' },
      { _id: 'd5', name: '人力资源部', adminId: '' },
      { _id: 'd6', name: '运营部', adminId: '' }
    ],
    clockRecords: [],
    approvals: [],
    messages: {},
    notices: [
      {
        _id: 'n1',
        content: '欢迎使用鑫办智能办公协作平台！您可以使用测试账号登录体验：admin/123456（超级管理员）、manager/123456（部门管理员）、employee/123456（普通员工）。',
        publisher: '系统公告',
        publisherId: 'admin_user',
        scope: 'all',
        createTime: new Date().toISOString()
      }
    ],
    conversations: [
      {
        _id: 'conv_all',
        name: '公司全员群',
        type: 'group',
        lastMessage: '欢迎加入公司全员群！',
        lastTime: new Date().toISOString()
      },
      {
        _id: 'conv_tech',
        name: '技术部',
        type: 'group',
        lastMessage: '技术部交流群',
        lastTime: new Date().toISOString()
      }
    ]
  };
}

// 数据管理对象
const DB = {
  // 校验数据完整性 - 确保默认测试账号始终可用
  validateDefaultUsers(data) {
    if (!data || !data.users || !Array.isArray(data.users)) return false;
    // 检查超级管理员账号是否存在
    const hasAdmin = data.users.some(u => u.username === 'admin' && u.role === 'super_admin');
    const hasManager = data.users.some(u => u.username === 'manager' && u.role === 'dept_admin');
    const hasEmployee = data.users.some(u => u.username === 'employee' && u.role === 'employee');
    return hasAdmin && hasManager && hasEmployee;
  },

  // 初始化数据 - 确保数据存在且完整
  init() {
    try {
      const existing = localStorage.getItem(APP_KEY);
      if (existing) {
        let parsed = null;
        try {
          parsed = JSON.parse(existing);
        } catch (e) {
          console.log('[DB] JSON解析失败，重新初始化');
        }
        if (parsed && this.validateDefaultUsers(parsed)) {
          console.log('[DB] 使用已有的本地数据，用户数：', parsed.users.length);
          return;
        }
        console.log('[DB] 已有数据不完整，重新初始化');
      }
      // 没有数据或数据无效，写入默认数据
      const defaultData = getDefaultData();
      localStorage.setItem(APP_KEY, JSON.stringify(defaultData));
      console.log('[DB] 初始化完成，默认用户数：', defaultData.users.length);
    } catch (e) {
      console.error('[DB] 初始化失败，重置数据：', e);
      localStorage.setItem(APP_KEY, JSON.stringify(getDefaultData()));
    }
  },

  // 强制重置数据（用于调试）
  reset() {
    localStorage.setItem(APP_KEY, JSON.stringify(getDefaultData()));
    console.log('[DB] 数据已重置为默认值');
  },

  // 获取所有数据
  getAll() {
    try {
      const data = localStorage.getItem(APP_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        // 确保所有必需字段存在
        if (!parsed.users) parsed.users = [];
        if (!parsed.departments) parsed.departments = [];
        if (!parsed.clockRecords) parsed.clockRecords = [];
        if (!parsed.approvals) parsed.approvals = [];
        if (!parsed.messages) parsed.messages = {};
        if (!parsed.notices) parsed.notices = [];
        if (!parsed.conversations) parsed.conversations = [];
        return parsed;
      }
      // 如果没有数据，重新初始化
      this.init();
      return JSON.parse(localStorage.getItem(APP_KEY));
    } catch (e) {
      console.error('[DB] 读取数据失败：', e);
      return getDefaultData();
    }
  },

  // 保存数据
  save(data) {
    localStorage.setItem(APP_KEY, JSON.stringify(data));
  },

  // 用户相关
  users: {
    getAll() {
      return DB.getAll().users;
    },
    getByUsername(username) {
      const users = DB.getAll().users;
      const user = users.find(u => u.username === username);
      console.log('[DB] 查询用户', username, '→', user ? '找到' : '未找到');
      return user;
    },
    getById(id) {
      return DB.getAll().users.find(u => u._id === id);
    },
    add(user) {
      const data = DB.getAll();
      user._id = 'u_' + Date.now();
      user.createTime = new Date().toISOString();
      data.users.push(user);
      DB.save(data);
      console.log('[DB] 新增用户:', user.username);
      return user;
    },
    update(id, updates) {
      const data = DB.getAll();
      const idx = data.users.findIndex(u => u._id === id);
      if (idx !== -1) {
        data.users[idx] = { ...data.users[idx], ...updates };
        DB.save(data);
        return data.users[idx];
      }
      return null;
    },
    getByDepartment(dept) {
      return DB.getAll().users.filter(u => u.department === dept);
    }
  },

  // 部门相关
  departments: {
    getAll() {
      return DB.getAll().departments;
    },
    add(dept) {
      const data = DB.getAll();
      dept._id = 'd_' + Date.now();
      dept.adminId = dept.adminId || '';
      data.departments.push(dept);
      DB.save(data);
      return dept;
    }
  },

  // 打卡记录相关
  clock: {
    getAll() {
      return DB.getAll().clockRecords;
    },
    getByUserId(userId) {
      return DB.getAll().clockRecords.filter(r => r.userId === userId);
    },
    add(record) {
      const data = DB.getAll();
      record._id = 'c_' + Date.now();
      record.createTime = new Date().toISOString();
      data.clockRecords.unshift(record);
      DB.save(data);
      return record;
    }
  },

  // 审批相关
  approval: {
    getAll() {
      return DB.getAll().approvals;
    },
    getByApplicantId(userId) {
      return DB.getAll().approvals.filter(a => a.applicantId === userId);
    },
    getByDepartment(dept) {
      return DB.getAll().approvals.filter(a => a.department === dept);
    },
    add(approval) {
      const data = DB.getAll();
      approval._id = 'a_' + Date.now();
      approval.status = 'pending';
      approval.createTime = new Date().toISOString();
      data.approvals.unshift(approval);
      DB.save(data);
      return approval;
    },
    updateStatus(id, status) {
      const data = DB.getAll();
      const idx = data.approvals.findIndex(a => a._id === id);
      if (idx !== -1) {
        data.approvals[idx].status = status;
        data.approvals[idx].approveTime = new Date().toISOString();
        DB.save(data);
        return data.approvals[idx];
      }
      return null;
    }
  },

  // 消息相关
  messages: {
    getByRoom(roomId) {
      const data = DB.getAll();
      return data.messages[roomId] || [];
    },
    add(roomId, message) {
      const data = DB.getAll();
      if (!data.messages[roomId]) {
        data.messages[roomId] = [];
      }
      message._id = 'm_' + Date.now();
      message.createTime = new Date().toISOString();
      data.messages[roomId].push(message);

      // 更新会话列表的最后消息
      const convIdx = data.conversations.findIndex(c => c._id === roomId);
      if (convIdx !== -1) {
        data.conversations[convIdx].lastMessage = message.content || '[图片]';
        data.conversations[convIdx].lastTime = message.createTime;
      }

      DB.save(data);
      return message;
    }
  },

  // 会话相关
  conversations: {
    getAll() {
      return DB.getAll().conversations;
    },
    add(conversation) {
      const data = DB.getAll();
      conversation._id = 'conv_' + Date.now();
      conversation.lastTime = new Date().toISOString();
      data.conversations.push(conversation);
      DB.save(data);
      return conversation;
    }
  },

  // 公告相关
  notice: {
    getAll() {
      return DB.getAll().notices;
    },
    add(notice) {
      const data = DB.getAll();
      notice._id = 'n_' + Date.now();
      notice.createTime = new Date().toISOString();
      data.notices.unshift(notice);
      DB.save(data);
      return notice;
    }
  }
};

// 会话管理
const Session = {
  KEY: 'xinban_current_user',

  // 获取当前登录用户（同时验证用户在数据库中是否有效）
  getCurrentUser() {
    try {
      const userData = localStorage.getItem(this.KEY);
      if (!userData) return null;
      const user = JSON.parse(userData);
      // 双重验证：登录用户必须在数据库中存在
      if (!user || !user.username) return null;
      const dbUser = DB.users.getByUsername(user.username);
      if (!dbUser) {
        console.log('[Session] 用户已失效，清除登录状态');
        this.logout();
        return null;
      }
      return user;
    } catch (e) {
      console.error('[Session] 获取用户失败:', e);
      return null;
    }
  },

  setCurrentUser(user) {
    localStorage.setItem(this.KEY, JSON.stringify(user));
    console.log('[Session] 已登录用户:', user.username, user.roleName);
  },

  logout() {
    localStorage.removeItem(this.KEY);
    console.log('[Session] 已退出登录');
  },

  // 检查是否已登录（双重验证）
  isLoggedIn() {
    const user = this.getCurrentUser();
    return !!user;
  },

  // 强制检查登录状态
  checkAuth() {
    if (!this.isLoggedIn()) {
      this.logout();
      window.location.href = 'login.html';
      return false;
    }
    return true;
  },

  // 获取用户角色
  getRole() {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  },

  // 是否超级管理员
  isSuperAdmin() {
    return this.getRole() === 'super_admin';
  },

  // 是否部门管理员
  isDeptAdmin() {
    return this.getRole() === 'dept_admin';
  }
};

// 工具函数
const Utils = {
  // 格式化时间 HH:MM
  formatTime(dateStr) {
    const date = new Date(dateStr);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  // 格式化日期时间 MM-DD HH:MM
  formatDateTime(dateStr) {
    const date = new Date(dateStr);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}-${day} ${hours}:${minutes}`;
  },

  // 格式化日期 MM/DD
  formatDate(dateStr) {
    const date = new Date(dateStr);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}`;
  },

  // 今天日期显示
  getTodayDate() {
    const today = new Date();
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${today.getFullYear()}年${String(today.getMonth() + 1).padStart(2, '0')}月${String(today.getDate()).padStart(2, '0')}日 ${weekDays[today.getDay()]}`;
  },

  // 显示 Toast 提示
  showToast(message, duration = 2000) {
    // 移除旧的 toast
    const old = document.querySelector('.toast-notification');
    if (old) old.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.85);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 99999;
      pointer-events: none;
      animation: fadeIn 0.2s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, duration);
  },

  // 显示确认对话框
  showConfirm(title, message, onConfirm) {
    // 移除旧的 modal
    const old = document.querySelector('.confirm-modal');
    if (old) old.remove();

    const modal = document.createElement('div');
    modal.className = 'confirm-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    `;
    modal.innerHTML = `
      <div style="background-color: white; width: 100%; max-width: 400px; border-radius: 12px; padding: 20px; box-shadow: 0 8px 24px rgba(0,0,0,0.15);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #f0f0f0;">
          <div style="font-size: 18px; font-weight: bold; color: #333;">${title}</div>
          <button class="modal-close-btn" style="background: none; border: none; font-size: 24px; color: #999; cursor: pointer; line-height: 1; padding: 0;">&times;</button>
        </div>
        <div style="padding: 10px 0; color: #666; font-size: 14px; line-height: 1.6;">${message}</div>
        <div style="display: flex; gap: 10px; margin-top: 20px;">
          <button class="modal-cancel-btn" style="flex: 1; padding: 12px; background: white; color: #666; border: 1px solid #e8e8e8; border-radius: 24px; font-size: 14px; cursor: pointer;">取消</button>
          <button class="modal-confirm-btn" style="flex: 1; padding: 12px; background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%); color: white; border: none; border-radius: 24px; font-size: 14px; cursor: pointer;">确定</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('.modal-close-btn');
    const cancelBtn = modal.querySelector('.modal-cancel-btn');
    const confirmBtn = modal.querySelector('.modal-confirm-btn');

    const close = () => modal.remove();

    closeBtn.addEventListener('click', close);
    cancelBtn.addEventListener('click', close);
    confirmBtn.addEventListener('click', () => {
      close();
      if (onConfirm) onConfirm();
    });
  },

  // 获取用户头像文字
  getAvatarText(name) {
    return name ? name.charAt(0) : '?';
  },

  // 将图片文件转为 base64
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
};

// 初始化数据库
DB.init();
console.log('[App] 鑫办平台初始化完成');
console.log('[App] 可用测试账号: admin / manager / employee (密码均为 123456)');

// 添加一个"重置数据"的调试工具（按住Ctrl+R 可调用）
window.XinbanDB = {
  reset: function() {
    DB.reset();
    Session.logout();
    Utils.showToast('数据已重置，请刷新页面');
    setTimeout(() => window.location.reload(), 1000);
  },
  info: function() {
    const data = DB.getAll();
    console.log('=== 鑫办数据 ===');
    console.log('用户:', data.users.map(u => u.username + '(' + u.role + ')'));
    console.log('部门:', data.departments.map(d => d.name));
    console.log('打卡记录数:', data.clockRecords.length);
    console.log('审批记录数:', data.approvals.length);
    console.log('公告数:', data.notices.length);
    console.log('当前登录用户:', Session.getCurrentUser());
  }
};
