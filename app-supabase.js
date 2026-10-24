// app-supabase.js - AVSI Scratch Card Inventory System
// Production Client Engine with SHA-256 Hashing, Multi-Level Workflow, and Dynamic Roles

const SUPABASE_URL = 'https://cgteaimxnwggxgcgzotn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_RaVlF6tbox5dBFjdM4-Aqg_mG5HdQDF';

const { createClient } = window.supabase || {};
const db = createClient ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Global App State
let currentUser = null;
let currentLang = localStorage.getItem('avsi_inventory_lang') || 'en';
let cardTypes = [];
let allRequests = [];
let realtimeChannels = [];
let currentReportData = [];

// ==================== I18N TRANSLATIONS (EN & AR) ====================
const translations = {
  en: {
    app_title: 'Scratch Card Inventory',
    app_subtitle: 'Real-Time Safe Management & Mobile Card Request Portal',
    username: 'Username',
    password: 'Password',
    login_button: 'Sign In (Login)',
    tab_dashboard: 'Dashboard & Stock',
    tab_requests: 'Card Requests',
    tab_transactions: 'Transactions',
    tab_reports: 'Audit & Reports',
    tab_users: 'User Roles',
    requester_welcome: 'Request Mobile / Internet Scratch Cards',
    requester_desc: 'Submit your card request for activity or office use. It will be sent to Yahia for approval and Alind for issuance.',
    btn_new_request: '+ New Card Request',
    my_requests_title: 'My Card Requests & Status',
    btn_refresh: 'Refresh',
    kpi_total_cards: 'Total Cards in Safe',
    kpi_card_types: 'Active Types',
    kpi_face_value: 'Face Value',
    kpi_face_sub: 'Official Selling Worth',
    kpi_pending_req: 'Pending Requests',
    kpi_pending_sub: 'Awaiting Yahia',
    kpi_low_stock: 'Low Stock Items',
    kpi_low_sub: 'Requires Reorder',
    inventory_table_title: 'Safe Inventory Overview',
    btn_dashboard_excel: 'Excel / CSV',
    btn_stock_in: '+ Stock In',
    btn_new_card: '+ New Card',
    search_inventory_ph: 'Search card provider, value...',
    filter_all_providers: 'All Providers',
    filter_all_status: 'All Status',
    filter_low_stock: 'Low Stock',
    filter_in_stock: 'In Stock',
    th_provider: 'Provider',
    th_denomination: 'Denomination',
    th_category: 'Category',
    th_available_stock: 'Available',
    th_min_alert: 'Min Alert',
    th_expiry_date: 'Expiry Date',
    th_total_value: 'Total Value',
    th_actions: 'Actions',
    requests_title: 'Card Requests Workflow',
    requests_subtitle: 'Yahia approves staff requests; Alind dispenses cards and marks as executed.',
    trans_title: 'Complete Safe Activity Log',
    trans_subtitle: 'Full record of all card receipts, issuances, and PIN distributions.',
    audit_title: 'Safe Inventory Audit & Reports',
    audit_subtitle: 'Physical stock reconciliation, opening and closing balance calculation.',
    btn_reconcile_nav: 'Reconciliation',
    btn_print: 'Print',
    btn_excel: 'CSV Export',
    btn_show_audit: 'Calculate',
    user_mgmt_title: 'Staff Accounts & Permissions',
    user_mgmt_sub: 'Alind assigns roles for Staff Requesters, Approvers (Yahia), and Management Viewers.',
    btn_add_user: '+ Add User',
    modal_request_title: 'Submit Scratch Card Request',
    select_card: 'Card Provider & Denomination',
    form_qty: 'Quantity',
    form_dept: 'Department',
    form_reason: 'Purpose / Project / Activity',
    btn_cancel: 'Cancel',
    btn_submit_req: 'Submit Request',
    modal_approval_title: 'Review Card Request',
    btn_reject: 'Reject Request',
    btn_approve: 'Approve Request',
    modal_execute_title: 'Dispense Approved Cards',
    form_pin: 'PIN Numbers (Optional)',
    form_notes: 'Notes / Justification',
    btn_confirm_dispense: 'Deduct & Dispense Cards',
    modal_stock_in_title: 'Stock In New Cards',
    form_cost: 'Unit Cost (IQD)',
    form_supplier: 'Supplier / Vendor',
    form_date: 'Date',
    form_expiry_date: 'Expiry Date',
    btn_record_in: 'Save Stock In',
    modal_new_card_title: 'Add New Scratch Card Type',
    btn_add: 'Create Card',
    modal_new_user_title: 'Register New User Account',
    full_name: 'Full Name',
    profile_username: 'Username',
    user_role: 'Role / Privilege',
    btn_create_acc: 'Create Account',
    reconcile_title: 'Physical Safe Stock Adjustment',
    current_system_count: 'System Count',
    actual_safe_count: 'Actual Safe Count',
    reconcile_reason: 'Justification / Reason',
    btn_save_reconcile: 'Save Adjustment',
    profile_modal_title: 'Account Settings',
    current_password: 'Current Password',
    new_password: 'New Password',
    btn_save_changes: 'Save Changes',
    cards_unit: 'cards',
    alert_banner_title: 'Low Stock Alert in Safe!'
  },
  ar: {
    app_title: 'نظام إدارة بطاقات الخزنة',
    app_subtitle: 'نظام الخزنة الفوري وبوابة طلب البطاقات لمنظمة AVSI',
    username: 'اسم المستخدم',
    password: 'كلمة المرور',
    login_button: 'تسجيل الدخول',
    tab_dashboard: 'لوحة التحكم والمخزون',
    tab_requests: 'طلبات البطاقات',
    tab_transactions: 'سجل الحركات',
    tab_reports: 'الجرد والتقارير',
    tab_users: 'صلاحيات المستخدمين',
    requester_welcome: 'طلب بطاقات شحن (موبايل / إنترنت)',
    requester_desc: 'قدم طلبك للنشاط أو العمل المكتبي. يتم مراجعته والموافقة عليه من قبل يحيى، ثم صرفه من قبل ألند.',
    btn_new_request: '+ طلب بطاقات جديد',
    my_requests_title: 'سجل وحالة طلباتي السابقة',
    btn_refresh: 'تحديث',
    kpi_total_cards: 'إجمالي البطاقات بالخزنة',
    kpi_card_types: 'فئات مفعلة',
    kpi_face_value: 'القيمة الاسمية',
    kpi_face_sub: 'إجمالي قيمة الرصيد',
    kpi_pending_req: 'طلبات معلقة',
    kpi_pending_sub: 'بانتظار موافقة يحيى',
    kpi_low_stock: 'بطاقات منخفضة',
    kpi_low_sub: 'تحتاج إلى تزويد',
    inventory_table_title: 'مخزون بطاقات الخزنة الحالية',
    btn_dashboard_excel: 'تصدير (Excel)',
    btn_stock_in: '+ استلام بطاقات',
    btn_new_card: '+ فئة جديدة',
    search_inventory_ph: 'بحث عن شركة، فئة...',
    filter_all_providers: 'كافة الشركات',
    filter_all_status: 'كافة الحالات',
    filter_low_stock: 'منخفض',
    filter_in_stock: 'متوفر',
    th_provider: 'الشركة',
    th_denomination: 'الفئة',
    th_category: 'النوع',
    th_available_stock: 'المتوفر',
    th_min_alert: 'حد التنبيه',
    th_expiry_date: 'انتهاء الصلاحية',
    th_total_value: 'إجمالي القيمة',
    th_actions: 'إجراءات',
    requests_title: 'إدارة دورة طلبات البطاقات',
    requests_subtitle: 'يحيى يعتمد طلبات الكادر؛ وألند يقوم بصرف البطاقات وخصمها من الخزنة.',
    trans_title: 'السجل الشامل لحركات الخزنة',
    trans_subtitle: 'تسجيل كامل لكافة الاستلامات والإصدارات وأرقام البطاقات.',
    audit_title: 'جرد الخزنة والمطابقة الرسمية',
    audit_subtitle: 'التسوية اليدوية للخزنة واحتساب الرصيد الافتتاحي والختامي.',
    btn_reconcile_nav: 'تسوية الجرد اليدوي',
    btn_print: 'طباعة (Print)',
    btn_excel: 'تصدير (CSV)',
    btn_show_audit: 'عرض الجرد',
    user_mgmt_title: 'حسابات وصلاحيات الموظفين',
    user_mgmt_sub: 'يقوم ألند بإنشاء وتحديد صلاحيات طالبي البطاقات والمشرفين والمدراء.',
    btn_add_user: '+ إضافة مستخدم',
    modal_request_title: 'تقديم طلب بطاقات كشط',
    select_card: 'الشركة وفئة البطاقة',
    form_qty: 'الكمية المطلوبة',
    form_dept: 'القسم',
    form_reason: 'النشاط / المشروع / السبب',
    btn_cancel: 'إلغاء',
    btn_submit_req: 'إرسال الطلب',
    modal_approval_title: 'مراجعة واعتماد الطلب (يحيى)',
    btn_reject: 'رفض الطلب',
    btn_approve: 'الموافقة على الطلب',
    modal_execute_title: 'صرف البطاقات المعتمدة (ألند)',
    form_pin: 'أرقام الـ PIN أو التسلسل (اختياري)',
    form_notes: 'ملاحظات الصرف',
    btn_confirm_dispense: 'تأكيد الصرف والخصم من الخزنة',
    modal_stock_in_title: 'استلام بطاقات جديدة للخزنة',
    form_cost: 'سعر الشراء (IQD)',
    form_supplier: 'المورد / الوكيل',
    form_date: 'التاريخ',
    form_expiry_date: 'تاريخ انتهاء الصلاحية',
    btn_record_in: 'حفظ الاستلام',
    modal_new_card_title: 'إضافة فئة بطاقة جديدة',
    btn_add: 'حفظ الفئة',
    modal_new_user_title: 'تسجيل حساب مستخدم جديد',
    full_name: 'الاسم الكامل',
    profile_username: 'اسم المستخدم',
    user_role: 'الدور والصلاحية',
    btn_create_acc: 'إنشاء الحساب',
    reconcile_title: 'تسوية رصيد الخزنة الفعلي',
    current_system_count: 'الكمية بالنظام',
    actual_safe_count: 'الكمية الفعلية بالخزنة',
    reconcile_reason: 'سبب التسوية الرسمي',
    btn_save_reconcile: 'حفظ التسوية',
    profile_modal_title: 'إعدادات الحساب',
    current_password: 'كلمة المرور الحالية',
    new_password: 'كلمة المرور الجديدة',
    btn_save_changes: 'حفظ التعديلات',
    cards_unit: 'بطاقة',
    alert_banner_title: 'تنبيه: اقتراب نفاد بعض البطاقات في الخزنة!'
  }
};

// Cryptographic Password Hashing (SHA-256)
async function hashPassword(str) {
  if (!str) return '';
  const msgUint8 = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function t(key, fallback = '') {
  const dict = translations[currentLang] || translations.en;
  return dict[key] !== undefined ? dict[key] : fallback;
}

// Service worker registration for PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(console.error);
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  applyLanguage(currentLang);

  const today = new Date().toISOString().split('T')[0];
  ['receipt-date', 'report-start-date', 'report-end-date'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = today;
  });

  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  const nextYearStr = nextYear.toISOString().split('T')[0];
  ['receipt-expiry-date', 'new-card-expiry-date'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = nextYearStr;
  });

  const loginForm = document.getElementById('login-form');
  if (loginForm) loginForm.addEventListener('submit', handleLogin);

  const savedUser = localStorage.getItem('avsi_inventory_user');
  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
      showAppView();
    } catch {
      showLoginView();
    }
  } else {
    showLoginView();
  }
});

function refreshIcons() {
  if (window.lucide) window.lucide.createIcons();
}

function changeLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('avsi_inventory_lang', lang);
  applyLanguage(lang);
}

function applyLanguage(lang) {
  currentLang = lang;
  const isRtl = lang === 'ar';
  document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;

  const loginSel = document.getElementById('login-lang-select');
  const appSel = document.getElementById('app-lang-select');
  if (loginSel) loginSel.value = lang;
  if (appSel) appSel.value = lang;

  const dict = translations[lang] || translations.en;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) el.textContent = dict[key];
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key] !== undefined) el.setAttribute('placeholder', dict[key]);
  });

  renderInventoryTable();
  populateCardSelects();
  renderRequestsQueue();
  refreshIcons();
}

// ==================== AUTHENTICATION ====================
async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim().toLowerCase();
  const password = document.getElementById('password').value;
  const errorBox = document.getElementById('login-error');
  const errorText = document.getElementById('login-error-text');

  errorBox.classList.add('hidden');

  try {
    const hashed = await hashPassword(password);
    
    // Check both hashed and fallback for initial migration
    const { data: user, error } = await db
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      throw new Error(currentLang === 'ar' ? 'اسم المستخدم أو كلمة المرور غير صحيحة.' : 'Invalid username or password.');
    }

    const passwordMatches = (user.password_hash === hashed) || (user.password_hash === password);
    if (!passwordMatches) {
      throw new Error(currentLang === 'ar' ? 'اسم المستخدم أو كلمة المرور غير صحيحة.' : 'Invalid username or password.');
    }

    currentUser = {
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      role: user.role, // 'admin', 'approver', 'manager', 'requester'
      department: user.department || 'General'
    };

    localStorage.setItem('avsi_inventory_user', JSON.stringify(currentUser));
    logAudit('LOGIN', `User [${user.username}] signed in.`);

    showAppView();
    showToast(`Welcome ${currentUser.fullName}!`, 'success');
  } catch (err) {
    errorBox.classList.remove('hidden');
    errorText.textContent = err.message;
  }
}

function logout() {
  realtimeChannels.forEach(ch => db.removeChannel(ch));
  realtimeChannels = [];
  currentUser = null;
  localStorage.removeItem('avsi_inventory_user');
  showLoginView();
}

function showLoginView() {
  document.getElementById('login-view').classList.remove('hidden');
  document.getElementById('app-view').classList.add('hidden');
  applyLanguage(currentLang);
  refreshIcons();
}

function showAppView() {
  document.getElementById('login-view').classList.add('hidden');
  document.getElementById('app-view').classList.remove('hidden');

  document.getElementById('user-display-name').textContent = currentUser.fullName;
  document.getElementById('user-avatar').textContent = currentUser.fullName.charAt(0);
  document.getElementById('user-role-label').textContent = currentUser.role.toUpperCase();

  const roleBadgeMap = {
    admin: 'Administrator (Alind)',
    approver: 'Approver (Yahia)',
    manager: 'Management (Overview)',
    requester: 'Staff Requester'
  };
  document.getElementById('user-role-badge').textContent = roleBadgeMap[currentUser.role] || 'AVSI Safe System';

  // Apply Role-Based Layout Permissions
  applyRolePermissions();

  setupRealtime();
  loadDashboardData();
  loadRequestsData();
  applyLanguage(currentLang);
  refreshIcons();
}

function applyRolePermissions() {
  const role = currentUser.role;
  const isRequester = role === 'requester';
  const isAdmin = role === 'admin';
  const isApprover = role === 'approver';
  const isManager = role === 'manager';

  // Requester sees ONLY staff portal
  const requesterPortal = document.getElementById('requester-portal-view');
  const managerNav = document.getElementById('manager-nav');
  const dashboardSec = document.getElementById('tab-content-dashboard');

  if (isRequester) {
    requesterPortal.classList.remove('hidden');
    managerNav.classList.add('hidden');
    dashboardSec.classList.add('hidden');
    loadRequesterHistory();
    return;
  } else {
    requesterPortal.classList.add('hidden');
    managerNav.classList.remove('hidden');
    dashboardSec.classList.remove('hidden');
  }

  // Admin Alind only permissions
  const usersTabBtn = document.getElementById('tab-btn-users');
  if (usersTabBtn) {
    if (isAdmin) usersTabBtn.classList.remove('hidden');
    else usersTabBtn.classList.add('hidden');
  }

  const adminActions = document.getElementById('inventory-admin-actions');
  if (adminActions) {
    if (isAdmin) {
      document.getElementById('btn-admin-stock-in')?.classList.remove('hidden');
      document.getElementById('btn-admin-new-card')?.classList.remove('hidden');
    } else {
      document.getElementById('btn-admin-stock-in')?.classList.add('hidden');
      document.getElementById('btn-admin-new-card')?.classList.add('hidden');
    }
  }

  const reconcileBtn = document.getElementById('btn-open-reconcile');
  if (reconcileBtn) {
    if (isAdmin) reconcileBtn.classList.remove('hidden');
    else reconcileBtn.classList.add('hidden');
  }
}

// ==================== REALTIME SYNC ====================
function setupRealtime() {
  realtimeChannels.forEach(ch => db.removeChannel(ch));
  realtimeChannels = [];

  const mainChannel = db.channel('avsi-inventory-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'card_types' }, () => {
      loadDashboardData();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'card_requests' }, () => {
      loadRequestsData();
      if (currentUser?.role === 'requester') loadRequesterHistory();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'receipts' }, () => {
      loadDashboardData();
      loadTransactions();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'issuances' }, () => {
      loadDashboardData();
      loadTransactions();
    })
    .subscribe();

  realtimeChannels.push(mainChannel);
}

// ==================== DASHBOARD & INVENTORY ====================
async function loadDashboardData() {
  if (currentUser?.role === 'requester') return;

  try {
    const { data: cards, error } = await db
      .from('card_types')
      .select('*')
      .eq('is_active', true)
      .order('provider', { ascending: true })
      .order('denomination', { ascending: true });

    if (error) throw error;

    const today = new Date().toISOString().split('T')[0];

    cardTypes = (cards || []).map(c => {
      let daysToExpiry = null;
      let expiryStatus = 'NONE';
      if (c.expiry_date) {
        const expDate = new Date(c.expiry_date + 'T00:00:00');
        const curDate = new Date(today + 'T00:00:00');
        daysToExpiry = Math.ceil((expDate - curDate) / (1000 * 60 * 60 * 24));
        if (daysToExpiry <= 0) expiryStatus = 'EXPIRED';
        else if (daysToExpiry <= 30) expiryStatus = 'EXPIRING_SOON';
        else expiryStatus = 'VALID';
      }

      return {
        ...c,
        is_low_stock: c.current_stock <= c.min_stock_alert,
        total_face_value: c.current_stock * c.denomination,
        days_to_expiry: daysToExpiry,
        expiry_status: expiryStatus
      };
    });

    let totalCards = 0;
    let totalFaceValue = 0;
    let lowStockCount = 0;
    const lowStockItems = [];

    for (const c of cardTypes) {
      totalCards += c.current_stock;
      totalFaceValue += c.total_face_value;
      if (c.is_low_stock) {
        lowStockCount++;
        lowStockItems.push(`${c.provider} ${c.denomination.toLocaleString()} (${c.current_stock})`);
      }
    }

    // Pending requests count
    const { count: pendingCount } = await db
      .from('card_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PENDING');

    document.getElementById('stat-total-cards').textContent = totalCards.toLocaleString();
    document.getElementById('stat-active-types').textContent = cardTypes.length;
    document.getElementById('stat-face-value').textContent = totalFaceValue.toLocaleString() + ' IQD';
    document.getElementById('stat-pending-requests').textContent = pendingCount || 0;
    document.getElementById('stat-low-stock').textContent = lowStockCount;

    const badge = document.getElementById('pending-requests-count');
    if (badge) {
      if (pendingCount > 0) {
        badge.textContent = pendingCount;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }

    const banner = document.getElementById('low-stock-banner');
    const bannerText = document.getElementById('low-stock-banner-text');
    if (banner && bannerText) {
      if (lowStockCount > 0) {
        banner.classList.remove('hidden');
        bannerText.textContent = lowStockItems.join(', ');
      } else {
        banner.classList.add('hidden');
      }
    }

    renderInventoryTable();
    populateCardSelects();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderInventoryTable() {
  const tbody = document.getElementById('inventory-tbody');
  if (!tbody) return;

  const searchTerm = (document.getElementById('inventory-search')?.value || '').toLowerCase();
  const providerFilter = document.getElementById('filter-provider')?.value || 'all';
  const statusFilter = document.getElementById('filter-stock-status')?.value || 'all';

  const filtered = cardTypes.filter(c => {
    const matchesSearch = c.provider.toLowerCase().includes(searchTerm) || 
                          c.denomination.toString().includes(searchTerm) ||
                          c.category.toLowerCase().includes(searchTerm);
    const matchesProvider = providerFilter === 'all' || c.provider === providerFilter;
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'low' && c.is_low_stock) ||
                          (statusFilter === 'available' && c.current_stock > 0);
    return matchesSearch && matchesProvider && matchesStatus;
  });

  const counterEl = document.getElementById('table-total-count');
  if (counterEl) counterEl.textContent = filtered.length;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-6 text-slate-400">No matching scratch cards found.</td></tr>`;
    return;
  }

  const isAdmin = currentUser?.role === 'admin';

  tbody.innerHTML = filtered.map(card => {
    const stockClass = card.is_low_stock 
      ? 'bg-amber-100 text-amber-800 border border-amber-200' 
      : 'bg-emerald-50 text-emerald-700 border border-emerald-200';

    let actionsHtml = `<span class="text-slate-400 text-[10px]">Read Only</span>`;
    if (isAdmin) {
      actionsHtml = `
        <div class="inline-flex items-center gap-1">
          <button onclick="quickStockIn(${card.id})" title="Stock In" class="p-1 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i>
          </button>
          <button onclick="confirmDeleteCardType(${card.id}, '${card.provider} ${card.denomination}')" title="Delete" class="p-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      `;
    }

    return `
      <tr class="hover:bg-slate-50/80 transition">
        <td class="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full ${card.category === 'Mobile' ? 'bg-sky-500' : 'bg-purple-500'}"></span>
          ${card.provider}
        </td>
        <td class="py-2.5 px-3 font-extrabold text-sky-600">${card.denomination.toLocaleString()} IQD</td>
        <td class="py-2.5 px-3 text-slate-500">${card.category}</td>
        <td class="py-2.5 px-3 text-center">
          <span class="inline-block px-2 py-0.5 rounded-lg text-xs font-bold ${stockClass}">
            ${card.current_stock.toLocaleString()}
          </span>
        </td>
        <td class="py-2.5 px-3 text-center text-slate-400 font-mono">${card.min_stock_alert}</td>
        <td class="py-2.5 px-3 text-center text-slate-600 font-mono text-[11px]">${card.expiry_date || '-'}</td>
        <td class="py-2.5 px-3 font-bold text-slate-800">${card.total_face_value.toLocaleString()} IQD</td>
        <td class="py-2.5 px-3 text-center">${actionsHtml}</td>
      </tr>
    `;
  }).join('');

  refreshIcons();
}

function populateCardSelects() {
  const selects = ['request-card-id', 'receipt-card-id', 'reconcile-card-id'];
  selects.forEach(selId => {
    const el = document.getElementById(selId);
    if (!el) return;
    const curVal = el.value;
    el.innerHTML = cardTypes.map(c => `
      <option value="${c.id}">${c.provider} - ${c.denomination.toLocaleString()} IQD (${c.category}) [Available: ${c.current_stock}]</option>
    `).join('');
    if (curVal) el.value = curVal;
  });
  updateReconcileCurrentStock();
}

function updateReconcileCurrentStock() {
  const sel = document.getElementById('reconcile-card-id');
  const inp = document.getElementById('reconcile-current');
  if (!sel || !inp) return;
  const card = cardTypes.find(c => c.id == sel.value);
  inp.value = card ? card.current_stock : 0;
}

// ==================== REQUESTS WORKFLOW (STAFF, YAHIA, ALIND) ====================
async function handleStaffRequestSubmit(e) {
  e.preventDefault();
  const cardTypeId = parseInt(document.getElementById('request-card-id').value, 10);
  const quantity = parseInt(document.getElementById('request-quantity').value, 10);
  const department = document.getElementById('request-dept').value;
  const reason = document.getElementById('request-reason').value.trim();

  try {
    const { error } = await db.from('card_requests').insert({
      requester_id: currentUser.id,
      requester_name: currentUser.fullName,
      department,
      card_type_id: cardTypeId,
      quantity,
      reason,
      status: 'PENDING'
    });

    if (error) throw error;

    logAudit('CARD_REQUEST_SUBMIT', `Staff [${currentUser.fullName}] requested ${quantity} cards.`);
    closeModal('staff-request-modal');
    showToast('Card request submitted successfully to Yahia for approval!', 'success');
    
    if (currentUser.role === 'requester') {
      loadRequesterHistory();
    } else {
      loadRequestsData();
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function loadRequesterHistory() {
  const tbody = document.getElementById('requester-history-tbody');
  if (!tbody || !currentUser) return;

  try {
    const { data: requests, error } = await db
      .from('card_requests')
      .select('*, card_types(provider, denomination)')
      .eq('requester_id', currentUser.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!requests || requests.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-slate-400">No requests submitted yet. Click + New Card Request above.</td></tr>`;
      return;
    }

    tbody.innerHTML = requests.map(r => {
      let statusBadge = '';
      if (r.status === 'PENDING') statusBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold status-badge-pending">Pending Approval</span>`;
      else if (r.status === 'APPROVED') statusBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold status-badge-approved">Approved (Yahia)</span>`;
      else if (r.status === 'REJECTED') statusBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold status-badge-rejected">Rejected</span>`;
      else if (r.status === 'EXECUTED') statusBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold status-badge-executed">Dispensed (Alind)</span>`;

      return `
        <tr class="hover:bg-slate-50 transition">
          <td class="py-2.5 px-3 font-mono text-[11px] text-slate-500">${new Date(r.created_at).toLocaleDateString()}</td>
          <td class="py-2.5 px-3 font-bold text-slate-900">${r.card_types?.provider} ${r.card_types?.denomination?.toLocaleString()} IQD</td>
          <td class="py-2.5 px-3 text-center font-extrabold text-sky-600">${r.quantity}</td>
          <td class="py-2.5 px-3 text-slate-600">${r.department}</td>
          <td class="py-2.5 px-3 text-slate-700">${r.reason}</td>
          <td class="py-2.5 px-3 text-center">${statusBadge}</td>
          <td class="py-2.5 px-3 text-center text-[11px] text-slate-500 font-mono">${r.executed_by ? `Dispensed by ${r.executed_by}` : '-'}</td>
        </tr>
      `;
    }).join('');

    refreshIcons();
  } catch (err) {
    console.error(err);
  }
}

async function loadRequestsData() {
  if (currentUser?.role === 'requester') return;

  try {
    const { data: requests, error } = await db
      .from('card_requests')
      .select('*, card_types(provider, denomination, current_stock)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    allRequests = requests || [];
    renderRequestsQueue();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderRequestsQueue() {
  const tbody = document.getElementById('requests-queue-tbody');
  if (!tbody) return;

  const filter = document.getElementById('requests-status-filter')?.value || 'all';
  const filtered = allRequests.filter(r => filter === 'all' || r.status === filter);

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-6 text-slate-400">No requests in this queue.</td></tr>`;
    return;
  }

  const role = currentUser?.role;
  const isApprover = role === 'approver'; // Yahia
  const isAdmin = role === 'admin';       // Alind

  tbody.innerHTML = filtered.map(r => {
    let statusBadge = '';
    if (r.status === 'PENDING') statusBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold status-badge-pending">Pending Approval</span>`;
    else if (r.status === 'APPROVED') statusBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold status-badge-approved">Approved</span>`;
    else if (r.status === 'REJECTED') statusBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold status-badge-rejected">Rejected</span>`;
    else if (r.status === 'EXECUTED') statusBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold status-badge-executed">Executed</span>`;

    let actionBtn = `<span class="text-slate-400 text-[10px]">-</span>`;

    // Yahia's action: Approve or Reject
    if (isApprover && r.status === 'PENDING') {
      actionBtn = `
        <button onclick="openApprovalModal(${r.id})" class="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition shadow-sm">
          Review & Approve
        </button>
      `;
    }

    // Alind's action: Execute & Dispense
    if (isAdmin && r.status === 'APPROVED') {
      actionBtn = `
        <button onclick="openExecuteModal(${r.id})" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm flex items-center gap-1 mx-auto">
          <i data-lucide="package-check" class="w-3.5 h-3.5"></i>
          <span>Dispense</span>
        </button>
      `;
    }

    return `
      <tr class="hover:bg-slate-50 transition">
        <td class="py-2.5 px-3 font-mono text-[11px] text-slate-500">${new Date(r.created_at).toLocaleDateString()}</td>
        <td class="py-2.5 px-3 font-bold text-slate-900">${r.requester_name}</td>
        <td class="py-2.5 px-3 text-slate-600">${r.department}</td>
        <td class="py-2.5 px-3 font-semibold text-slate-800">${r.card_types?.provider} ${r.card_types?.denomination?.toLocaleString()} IQD</td>
        <td class="py-2.5 px-3 text-center font-extrabold text-sky-600">${r.quantity}</td>
        <td class="py-2.5 px-3 text-slate-600 text-xs">${r.reason}</td>
        <td class="py-2.5 px-3 text-center">${statusBadge}</td>
        <td class="py-2.5 px-3 text-center">${actionBtn}</td>
      </tr>
    `;
  }).join('');

  refreshIcons();
}

// Approver Actions (Yahia)
function openApprovalModal(requestId) {
  const req = allRequests.find(r => r.id === requestId);
  if (!req) return;

  document.getElementById('approval-request-id').value = requestId;
  document.getElementById('approval-comment').value = '';
  document.getElementById('approval-request-summary').innerHTML = `
    <p><strong>Staff:</strong> ${req.requester_name} (${req.department})</p>
    <p><strong>Card:</strong> ${req.card_types?.provider} ${req.card_types?.denomination?.toLocaleString()} IQD</p>
    <p><strong>Quantity:</strong> <span class="text-sky-600 font-bold">${req.quantity} cards</span> (Safe Stock: ${req.card_types?.current_stock})</p>
    <p><strong>Reason:</strong> ${req.reason}</p>
  `;

  openModal('approval-modal');
}

async function submitApprovalDecision(decision) {
  const requestId = parseInt(document.getElementById('approval-request-id').value, 10);
  const notes = document.getElementById('approval-comment').value.trim();

  try {
    const { error } = await db.from('card_requests').update({
      status: decision,
      approved_by: currentUser.fullName,
      approved_at: new Date().toISOString(),
      approval_notes: notes
    }).eq('id', requestId);

    if (error) throw error;

    logAudit('REQUEST_REVIEW', `Yahia marked request #${requestId} as ${decision}.`);
    closeModal('approval-modal');
    showToast(`Request has been ${decision}!`, 'success');
    loadRequestsData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Executor Actions (Alind)
function openExecuteModal(requestId) {
  const req = allRequests.find(r => r.id === requestId);
  if (!req) return;

  document.getElementById('execute-request-id').value = requestId;
  document.getElementById('execute-pin-numbers').value = '';
  document.getElementById('execute-notes').value = '';
  document.getElementById('execute-request-summary').innerHTML = `
    <p><strong>Recipient:</strong> ${req.requester_name} (${req.department})</p>
    <p><strong>Card:</strong> ${req.card_types?.provider} ${req.card_types?.denomination?.toLocaleString()} IQD</p>
    <p><strong>Quantity to Dispense:</strong> <span class="text-emerald-600 font-bold">${req.quantity} cards</span></p>
    <p><strong>Available in Safe:</strong> ${req.card_types?.current_stock} cards</p>
  `;

  openModal('execute-modal');
}

async function submitExecution() {
  const requestId = parseInt(document.getElementById('execute-request-id').value, 10);
  const pinNumbers = document.getElementById('execute-pin-numbers').value.trim();
  const notes = document.getElementById('execute-notes').value.trim();

  try {
    const req = allRequests.find(r => r.id === requestId);
    if (!req) throw new Error('Request not found');

    const card = cardTypes.find(c => c.id === req.card_type_id);
    if (card && card.current_stock < req.quantity) {
      throw new Error(`Insufficient stock in safe! Available: ${card.current_stock}, Requested: ${req.quantity}`);
    }

    // 1. Insert issuance record
    const today = new Date().toISOString().split('T')[0];
    await db.from('issuances').insert({
      card_type_id: req.card_type_id,
      request_id: req.id,
      quantity: req.quantity,
      requester_name: req.requester_name,
      department: req.department,
      reason: req.reason,
      date_issued: today,
      pin_numbers: pinNumbers || null,
      issued_by: currentUser.fullName,
      notes: notes || null
    });

    // 2. Deduct safe stock
    await db.from('card_types').update({
      current_stock: card.current_stock - req.quantity
    }).eq('id', req.card_type_id);

    // 3. Mark request as EXECUTED
    await db.from('card_requests').update({
      status: 'EXECUTED',
      executed_by: currentUser.fullName,
      executed_at: new Date().toISOString(),
      pin_numbers: pinNumbers || null,
      execution_notes: notes || null
    }).eq('id', requestId);

    logAudit('REQUEST_EXECUTED', `Alind dispensed ${req.quantity} cards for [${req.requester_name}].`);
    closeModal('execute-modal');
    showToast(`Cards dispensed and stock deducted successfully!`, 'success');
    loadRequestsData();
    loadDashboardData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ==================== INVENTORY ACTIONS (ALIND ADMIN) ====================
async function handleStockReceipt(e) {
  e.preventDefault();
  const cardTypeId = parseInt(document.getElementById('receipt-card-id').value, 10);
  const quantity = parseInt(document.getElementById('receipt-quantity').value, 10);
  const unitCost = parseFloat(document.getElementById('receipt-unit-cost').value) || 0;
  const supplier = document.getElementById('receipt-supplier').value.trim();
  const dateReceived = document.getElementById('receipt-date').value;
  const expiryDate = document.getElementById('receipt-expiry-date').value;
  const pinNumbers = document.getElementById('receipt-pin-numbers').value.trim();
  const notes = document.getElementById('receipt-notes').value.trim();

  try {
    const card = cardTypes.find(c => c.id === cardTypeId);
    const totalVal = quantity * unitCost;

    await db.from('receipts').insert({
      card_type_id: cardTypeId,
      quantity,
      unit_cost: unitCost,
      total_value: totalVal,
      supplier,
      date_received: dateReceived,
      expiry_date: expiryDate || null,
      pin_numbers: pinNumbers || null,
      received_by: currentUser.fullName,
      notes
    });

    const updates = { current_stock: card.current_stock + quantity, unit_cost: unitCost };
    if (expiryDate) updates.expiry_date = expiryDate;
    if (pinNumbers) updates.pin_number = pinNumbers;

    await db.from('card_types').update(updates).eq('id', cardTypeId);

    logAudit('STOCK_IN', `Stocked in ${quantity} cards of [${card.provider} ${card.denomination}].`);
    closeModal('receipt-modal');
    showToast(`+${quantity} cards added to safe stock!`, 'success');
    loadDashboardData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleAddNewCardType(e) {
  e.preventDefault();
  const provider = document.getElementById('new-card-provider').value.trim();
  const denomination = parseInt(document.getElementById('new-card-denom').value, 10);
  const category = document.getElementById('new-card-category').value;
  const minStockAlert = parseInt(document.getElementById('new-card-alert').value, 10) || 10;
  const unitCost = parseFloat(document.getElementById('new-card-cost').value) || 0;
  const expiryDate = document.getElementById('new-card-expiry-date').value || null;
  const pin = document.getElementById('new-card-pin').value.trim() || null;

  try {
    const { error } = await db.from('card_types').insert({
      provider,
      denomination,
      category,
      min_stock_alert: minStockAlert,
      current_stock: 0,
      unit_cost: unitCost,
      expiry_date: expiryDate,
      pin_number: pin
    });

    if (error) throw error;

    logAudit('NEW_CARD_TYPE', `Added card type [${provider} ${denomination}].`);
    closeModal('new-card-modal');
    showToast('New card type registered successfully!', 'success');
    loadDashboardData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function confirmDeleteCardType(id, name) {
  if (!confirm(`Are you sure you want to remove card type [${name}]?`)) return;

  try {
    await db.from('card_types').update({ is_active: false, current_stock: 0 }).eq('id', id);
    logAudit('CARD_DELETED', `Deleted card type [${name}].`);
    showToast('Card type deactivated.', 'success');
    loadDashboardData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function quickStockIn(id) {
  openModal('receipt-modal');
  const sel = document.getElementById('receipt-card-id');
  if (sel) sel.value = id;
}

// Reconciliation
async function handleReconciliation(e) {
  e.preventDefault();
  const cardTypeId = parseInt(document.getElementById('reconcile-card-id').value, 10);
  const actualStock = parseInt(document.getElementById('reconcile-actual').value, 10);
  const reason = document.getElementById('reconcile-reason').value.trim();

  try {
    const card = cardTypes.find(c => c.id === cardTypeId);
    const diff = actualStock - card.current_stock;

    await db.from('stock_adjustments').insert({
      card_type_id: cardTypeId,
      previous_stock: card.current_stock,
      new_stock: actualStock,
      difference: diff,
      reason,
      adjusted_by: currentUser.fullName
    });

    await db.from('card_types').update({ current_stock: actualStock }).eq('id', cardTypeId);

    logAudit('STOCK_RECONCILE', `Reconciled [${card.provider} ${card.denomination}] to ${actualStock}. Reason: ${reason}`);
    closeModal('reconcile-modal');
    showToast('Physical stock reconciliation saved!', 'success');
    loadDashboardData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ==================== USER MANAGEMENT (ALIND ADMIN) ====================
async function loadUsersData() {
  if (currentUser?.role !== 'admin') return;
  const tbody = document.getElementById('users-tbody');
  if (!tbody) return;

  try {
    const { data: users, error } = await db.from('users').select('*').order('id', { ascending: true });
    if (error) throw error;

    tbody.innerHTML = (users || []).map(u => `
      <tr class="hover:bg-slate-50 transition">
        <td class="py-2.5 px-3 font-bold text-slate-900">${u.full_name}</td>
        <td class="py-2.5 px-3 font-mono text-xs text-slate-600">${u.username}</td>
        <td class="py-2.5 px-3 text-slate-700">${u.department || '-'}</td>
        <td class="py-2.5 px-3 text-center">
          <span class="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${
            u.role === 'admin' ? 'bg-sky-100 text-sky-800' :
            u.role === 'approver' ? 'bg-indigo-100 text-indigo-800' :
            u.role === 'manager' ? 'bg-emerald-100 text-emerald-800' :
            'bg-slate-100 text-slate-700'
          }">${u.role}</span>
        </td>
        <td class="py-2.5 px-3 text-center">
          <span class="inline-block w-2 h-2 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-rose-500'}"></span>
        </td>
        <td class="py-2.5 px-3 text-center text-xs">
          ${u.id === currentUser.id ? '<span class="text-slate-400">Current</span>' : `
            <button onclick="toggleUserStatus(${u.id}, ${!u.is_active})" class="text-sky-600 hover:underline">
              ${u.is_active ? 'Deactivate' : 'Activate'}
            </button>
          `}
        </td>
      </tr>
    `).join('');

    refreshIcons();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleCreateUser(e) {
  e.preventDefault();
  const fullName = document.getElementById('new-user-fullname').value.trim();
  const username = document.getElementById('new-user-username').value.trim().toLowerCase();
  const password = document.getElementById('new-user-password').value;
  const role = document.getElementById('new-user-role').value;
  const department = document.getElementById('new-user-dept').value;

  try {
    const passwordHash = await hashPassword(password);
    const { error } = await db.from('users').insert({
      full_name: fullName,
      username,
      password_hash: passwordHash,
      role,
      department
    });

    if (error) throw error;

    logAudit('CREATE_USER', `Admin created user [${username}] with role [${role}].`);
    closeModal('new-user-modal');
    showToast(`User account created for ${fullName}!`, 'success');
    loadUsersData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function toggleUserStatus(userId, activate) {
  try {
    await db.from('users').update({ is_active: activate }).eq('id', userId);
    showToast('User status updated.', 'success');
    loadUsersData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// User Profile Editing
async function handleUpdateProfile(e) {
  e.preventDefault();
  const fullName = document.getElementById('profile-full-name').value.trim();
  const oldPassword = document.getElementById('profile-old-pass').value;
  const newPassword = document.getElementById('profile-new-pass').value;

  try {
    const oldHashed = await hashPassword(oldPassword);
    const { data: user } = await db.from('users').select('*').eq('id', currentUser.id).single();

    if (user.password_hash !== oldHashed && user.password_hash !== oldPassword) {
      throw new Error('Current password does not match.');
    }

    const updates = { full_name: fullName };
    if (newPassword && newPassword.trim()) {
      updates.password_hash = await hashPassword(newPassword.trim());
    }

    await db.from('users').update(updates).eq('id', currentUser.id);

    currentUser.fullName = fullName;
    localStorage.setItem('avsi_inventory_user', JSON.stringify(currentUser));
    document.getElementById('user-display-name').textContent = fullName;
    document.getElementById('user-avatar').textContent = fullName.charAt(0);

    closeModal('profile-modal');
    showToast('Profile updated successfully!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ==================== TRANSACTIONS & AUDIT LOGS ====================
async function loadTransactions() {
  if (currentUser?.role === 'requester') return;
  const tbody = document.getElementById('transactions-tbody');
  if (!tbody) return;

  const typeFilter = document.getElementById('trans-filter-type')?.value || 'all';

  try {
    const [recRes, issRes] = await Promise.all([
      db.from('receipts').select('*, card_types(provider, denomination)').order('created_at', { ascending: false }).limit(50),
      db.from('issuances').select('*, card_types(provider, denomination)').order('created_at', { ascending: false }).limit(50)
    ]);

    let list = [];
    if (typeFilter !== 'issuance' && recRes.data) {
      recRes.data.forEach(r => list.push({
        type: 'STOCK_IN',
        card: `${r.card_types?.provider} ${r.card_types?.denomination?.toLocaleString()}`,
        qty: r.quantity,
        party: r.supplier || 'Official Vendor',
        detail: r.notes || '-',
        pin: r.pin_numbers || '-',
        handler: r.received_by,
        date: r.date_received
      }));
    }

    if (typeFilter !== 'receipt' && issRes.data) {
      issRes.data.forEach(i => list.push({
        type: 'DISPENSED',
        card: `${i.card_types?.provider} ${i.card_types?.denomination?.toLocaleString()}`,
        qty: i.quantity,
        party: i.requester_name,
        detail: `${i.department || ''} - ${i.reason}`,
        pin: i.pin_numbers || '-',
        handler: i.issued_by,
        date: i.date_issued
      }));
    }

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center py-6 text-slate-400">No transactions recorded.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(item => `
      <tr class="hover:bg-slate-50 transition">
        <td class="py-2.5 px-3">
          <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${item.type === 'STOCK_IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'}">
            ${item.type === 'STOCK_IN' ? 'Stock In' : 'Dispensed'}
          </span>
        </td>
        <td class="py-2.5 px-3 font-bold text-slate-900">${item.card}</td>
        <td class="py-2.5 px-3 text-center font-bold text-sky-600">${item.qty}</td>
        <td class="py-2.5 px-3 text-slate-800">${item.party}</td>
        <td class="py-2.5 px-3 text-slate-500">${item.detail}</td>
        <td class="py-2.5 px-3 font-mono text-xs text-slate-600">${item.pin}</td>
        <td class="py-2.5 px-3 text-slate-700">${item.handler}</td>
        <td class="py-2.5 px-3 font-mono text-[11px] text-slate-400">${item.date}</td>
      </tr>
    `).join('');

    refreshIcons();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Reports Generation
async function generateReport(showNotice = false) {
  const start = document.getElementById('report-start-date')?.value || '2000-01-01';
  const end = document.getElementById('report-end-date')?.value || '2099-12-31';

  try {
    const [recRes, issRes] = await Promise.all([
      db.from('receipts').select('*').gte('date_received', start).lte('date_received', end),
      db.from('issuances').select('*').gte('date_issued', start).lte('date_issued', end)
    ]);

    currentReportData = cardTypes.map(c => {
      const cardRecs = (recRes.data || []).filter(r => r.card_type_id === c.id);
      const cardIsss = (issRes.data || []).filter(i => i.card_type_id === c.id);

      const received = cardRecs.reduce((s, r) => s + r.quantity, 0);
      const issued = cardIsss.reduce((s, i) => s + i.quantity, 0);
      const closing = c.current_stock;
      const opening = Math.max(0, closing + issued - received);

      return {
        cardName: `${c.provider} ${c.denomination.toLocaleString()} IQD`,
        denom: c.denomination,
        opening,
        received,
        issued,
        closing,
        totalVal: closing * c.denomination
      };
    });

    renderReportTableUI();
    if (showNotice) showToast('Report calculations complete.', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderReportTableUI() {
  const tbody = document.getElementById('report-tbody');
  const tfoot = document.getElementById('report-tfoot');
  if (!tbody) return;

  let totalOpen = 0, totalRec = 0, totalIss = 0, totalClose = 0, grandVal = 0;

  tbody.innerHTML = currentReportData.map(r => {
    totalOpen += r.opening;
    totalRec += r.received;
    totalIss += r.issued;
    totalClose += r.closing;
    grandVal += r.totalVal;

    return `
      <tr class="hover:bg-slate-50 transition">
        <td class="py-2.5 px-3 font-bold text-slate-800">${r.cardName}</td>
        <td class="py-2.5 px-3 text-slate-500">${r.denom.toLocaleString()} IQD</td>
        <td class="py-2.5 px-3 text-center font-bold text-slate-700">${r.opening}</td>
        <td class="py-2.5 px-3 text-center font-bold text-emerald-600">+${r.received}</td>
        <td class="py-2.5 px-3 text-center font-bold text-rose-600">-${r.issued}</td>
        <td class="py-2.5 px-3 text-center font-bold text-sky-700 bg-sky-50/50">${r.closing}</td>
        <td class="py-2.5 px-3 text-right rtl:text-left font-bold text-slate-900">${r.totalVal.toLocaleString()} IQD</td>
      </tr>
    `;
  }).join('');

  if (tfoot) {
    tfoot.innerHTML = `
      <tr>
        <td colspan="2" class="py-2.5 px-3 text-slate-900 font-extrabold">Total:</td>
        <td class="py-2.5 px-3 text-center font-bold text-slate-800">${totalOpen}</td>
        <td class="py-2.5 px-3 text-center font-bold text-emerald-700">+${totalRec}</td>
        <td class="py-2.5 px-3 text-center font-bold text-rose-700">-${totalIss}</td>
        <td class="py-2.5 px-3 text-center font-bold text-sky-900 bg-sky-100/70">${totalClose}</td>
        <td class="py-2.5 px-3 text-right rtl:text-left font-extrabold text-slate-900">${grandVal.toLocaleString()} IQD</td>
      </tr>
    `;
  }
}

function setAuditPreset(preset) {
  const today = new Date();
  const startEl = document.getElementById('report-start-date');
  const endEl = document.getElementById('report-end-date');

  endEl.value = today.toISOString().split('T')[0];

  if (preset === 'today') {
    startEl.value = today.toISOString().split('T')[0];
  } else if (preset === 'week') {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    startEl.value = d.toISOString().split('T')[0];
  } else if (preset === 'month') {
    const d = new Date();
    d.setDate(1);
    startEl.value = d.toISOString().split('T')[0];
  } else if (preset === 'year') {
    const d = new Date(today.getFullYear(), 0, 1);
    startEl.value = d.toISOString().split('T')[0];
  }

  generateReport(true);
}

// Exports
function exportDashboardToExcel() {
  const rows = [
    ['Provider', 'Denomination (IQD)', 'Category', 'Available Stock', 'Min Alert', 'Expiry Date', 'Total Value (IQD)']
  ];

  cardTypes.forEach(c => {
    rows.push([
      c.provider,
      c.denomination,
      c.category,
      c.current_stock,
      c.min_stock_alert,
      c.expiry_date || '',
      c.total_face_value
    ]);
  });

  if (window.XLSX) {
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'AVSI_Inventory');
    XLSX.writeFile(wb, `avsi_scratch_cards_${new Date().toISOString().split('T')[0]}.xlsx`);
  }
}

function exportReportToCSV() {
  if (currentReportData.length === 0) return;
  const rows = [['Card Type', 'Denomination', 'Opening', 'Received (+)', 'Issued (-)', 'Closing', 'Total Value (IQD)']];
  currentReportData.forEach(r => rows.push([r.cardName, r.denom, r.opening, r.received, r.issued, r.closing, r.totalVal]));
  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
  const link = document.createElement('a');
  link.setAttribute('href', encodeURI(csvContent));
  link.setAttribute('download', `avsi_audit_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function logAudit(action, description) {
  if (!db) return;
  db.from('audit_logs').insert({
    username: currentUser ? currentUser.username : 'system',
    action,
    description
  }).then(() => {});
}

// Tabs & Navigation
function switchTab(tabId) {
  document.querySelectorAll('section[id^="tab-content-"]').forEach(s => s.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.remove('active', 'border-sky-600', 'text-sky-600');
    b.classList.add('border-transparent', 'text-slate-600');
  });

  const targetSection = document.getElementById(`tab-content-${tabId}`);
  const targetBtn = document.getElementById(`tab-btn-${tabId}`);

  if (targetSection) targetSection.classList.remove('hidden');
  if (targetBtn) {
    targetBtn.classList.add('active', 'border-sky-600', 'text-sky-600');
    targetBtn.classList.remove('border-transparent', 'text-slate-600');
  }

  if (tabId === 'requests') loadRequestsData();
  else if (tabId === 'transactions') loadTransactions();
  else if (tabId === 'reports') generateReport();
  else if (tabId === 'users') loadUsersData();

  refreshIcons();
}

function openModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) {
    m.classList.remove('hidden');
    if (modalId === 'profile-modal' && currentUser) {
      document.getElementById('profile-full-name').value = currentUser.fullName || '';
      document.getElementById('profile-old-pass').value = '';
      document.getElementById('profile-new-pass').value = '';
    }
    refreshIcons();
  }
}

function closeModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.add('hidden');
}

function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bg = type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-rose-600' : 'bg-slate-900';
  toast.className = `${bg} text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold flex items-center gap-2 transform transition-all duration-300 pointer-events-auto`;
  toast.innerHTML = `<span>${msg}</span>`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
