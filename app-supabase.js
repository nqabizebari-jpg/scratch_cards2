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
let soundNotificationEnabled = localStorage.getItem('avsi_sound_enabled') !== 'false'; // default ON
let audioCtx = null;

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
    tab_activity: 'Activity Log',
    tab_users: 'User Roles',
    requester_welcome: 'Request Mobile / Internet Scratch Cards',
    requester_desc: 'Submit your card request for activity or office use. It will be sent for approval and issuance.',
    btn_new_request: '+ New Card Request',
    my_requests_title: 'My Card Requests & Status',
    btn_refresh: 'Refresh',
    kpi_total_cards: 'Total Cards in Safe',
    kpi_card_types: 'Active Types',
    kpi_face_value: 'Face Value',
    kpi_face_sub: 'Official Selling Worth',
    kpi_pending_req: 'Pending Requests',
    kpi_pending_sub: 'Awaiting Approval',
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
    requests_subtitle: 'Approver reviews staff requests; Authorized custodian dispenses cards and marks as executed.',
    trans_title: 'Complete Safe Activity Log',
    trans_subtitle: 'Full record of all card receipts, issuances, and PIN distributions.',
    audit_title: 'Safe Inventory Audit & Reports',
    audit_subtitle: 'Physical stock reconciliation, opening and closing balance calculation.',
    btn_reconcile_nav: 'Reconciliation',
    btn_print: 'Print',
    btn_excel: 'CSV Export',
    btn_show_audit: 'Calculate',
    user_mgmt_title: 'Staff Accounts & Permissions',
    user_mgmt_sub: 'Manage staff accounts and permissions for Staff Requesters and Management Viewers.',
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
    alert_banner_title: 'Low Stock Alert in Safe!',
    th_date_time: 'Date & Time',
    th_card_val: 'Card & Value',
    th_qty: 'Qty',
    th_reason_activity: 'Reason / Activity',
    th_approval_status: 'Approval Status',
    th_dispense_status: 'Dispensation Status',
    th_pin_code: 'Card PIN / Code',
    th_requester_staff: 'Requester Staff',
    th_card_requested: 'Card Requested',
    th_reason_project: 'Reason / Project',
    th_status: 'Status',
    th_type: 'Type',
    th_card_denom: 'Card & Denom',
    th_recipient_supplier: 'Recipient / Supplier',
    th_dept_reason: 'Department / Reason',
    th_pin_numbers: 'PIN Numbers',
    th_handled_by: 'Handled By',
    th_user: 'User',
    th_description: 'Description',
    filter_req_all: 'All Requests',
    filter_req_pending: 'Pending Only (Needs Action)',
    filter_req_approved: 'Approved (Ready to Dispense)',
    filter_req_executed: 'Executed',
    filter_req_rejected: 'Rejected',
    filter_trans_all: 'All Types',
    filter_trans_receipt: 'Stock In (Receipts)',
    filter_trans_issuance: 'Stock Out (Issuances)',
    status_pending: 'Pending Approval',
    status_approved: 'Approved',
    status_rejected: 'Rejected',
    status_dispensed: 'Dispensed',
    btn_review_approve: 'Review & Approve',
    btn_dispense: 'Dispense',
    read_only: 'Read Only',
    btn_telegram_backup: 'Telegram Backup',
    tg_modal_title: 'Telegram Bot Cloud Backup',
    btn_send_backup: 'Send Backup to Telegram',
    btn_clear_data: 'Clear',
    notification_sound_on: 'Sound ON',
    notification_sound_off: 'Sound Muted',
    notify_new_request_title: 'New Card Request Submitted',
    notify_new_request_body: 'A staff member has submitted a new card request needing review.',
    notify_approved_title: 'Request Approved - Ready to Dispense',
    notify_approved_body: 'A card request was approved and is waiting for cards to be dispensed.',
    notify_executed_title: 'Cards Dispensed & Ready',
    notify_executed_body: 'Your card request has been fulfilled. Check your portal for details/PIN.'
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
    tab_activity: 'سجل النشاطات والأمان',
    tab_users: 'صلاحيات المستخدمين',
    requester_welcome: 'طلب بطاقات شحن (موبايل / إنترنت)',
    requester_desc: 'قدم طلبك للنشاط أو العمل المكتبي ليتم مراجعته واعتماده ثم صرفه من الخزنة.',
    btn_new_request: '+ طلب بطاقات جديد',
    my_requests_title: 'سجل وحالة طلباتي السابقة',
    btn_refresh: 'تحديث',
    kpi_total_cards: 'إجمالي البطاقات بالخزنة',
    kpi_card_types: 'فئات مفعلة',
    kpi_face_value: 'القيمة الاسمية',
    kpi_face_sub: 'إجمالي قيمة الرصيد',
    kpi_pending_req: 'طلبات معلقة',
    kpi_pending_sub: 'بانتظار الموافقة',
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
    requests_subtitle: 'يقوم مسؤول الموافقة بمراجعة طلبات الكادر؛ ويقوم أمين الصندوق بصرف البطاقات وخصمها من الخزنة.',
    trans_title: 'السجل الشامل لحركات الخزنة',
    trans_subtitle: 'تسجيل كامل لكافة الاستلامات والإصدارات وأرقام البطاقات.',
    audit_title: 'جرد الخزنة والمطابقة الرسمية',
    audit_subtitle: 'التسوية اليدوية للخزنة واحتساب الرصيد الافتتاحي والختامي.',
    btn_reconcile_nav: 'تسوية الجرد اليدوي',
    btn_print: 'طباعة (Print)',
    btn_excel: 'تصدير (CSV)',
    btn_show_audit: 'عرض الجرد',
    user_mgmt_title: 'حسابات وصلاحيات الموظفين',
    user_mgmt_sub: 'إدارة وتحديد صلاحيات طالبي البطاقات والمشرفين.',
    btn_add_user: '+ إضافة مستخدم',
    modal_request_title: 'تقديم طلب بطاقات كشط',
    select_card: 'الشركة وفئة البطاقة',
    form_qty: 'الكمية المطلوبة',
    form_dept: 'القسم',
    form_reason: 'النشاط / المشروع / السبب',
    btn_cancel: 'إلغاء',
    btn_submit_req: 'إرسال الطلب',
    modal_approval_title: 'مراجعة واعتماد الطلب',
    btn_reject: 'رفض الطلب',
    btn_approve: 'الموافقة على الطلب',
    modal_execute_title: 'صرف وتفريغ البطاقات المعتمدة',
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
    alert_banner_title: 'تنبيه: اقتراب نفاد بعض البطاقات في الخزنة!',
    th_date_time: 'التاريخ والوقت',
    th_card_val: 'فئة وقيمة البطاقة',
    th_qty: 'الكمية',
    th_reason_activity: 'النشاط / السبب',
    th_approval_status: 'حالة الموافقة',
    th_dispense_status: 'حالة الصرف',
    th_pin_code: 'كود / PIN البطاقة',
    th_requester_staff: 'الموظف مقدم الطلب',
    th_card_requested: 'البطاقة المطلوبة',
    th_reason_project: 'النشاط / المشروع',
    th_status: 'الحالة',
    th_type: 'نوع الحركة',
    th_card_denom: 'الشركة والفئة',
    th_recipient_supplier: 'المستلم / المورد',
    th_dept_reason: 'القسم / السبب',
    th_pin_numbers: 'أرقام الـ PIN',
    th_handled_by: 'تمت بواسطة',
    th_user: 'المستخدم',
    th_description: 'تفاصيل النشاط',
    filter_req_all: 'كافة الطلبات',
    filter_req_pending: 'المعلقة فقط (تحتاج إجراء)',
    filter_req_approved: 'المعتمدة (جاهزة للصرف)',
    filter_req_executed: 'المصروفة',
    filter_req_rejected: 'المرفوضة',
    filter_trans_all: 'كافة الحركات',
    filter_trans_receipt: 'استلام رصيد (إيداع)',
    filter_trans_issuance: 'صرف رصيد (سحب)',
    status_pending: 'قيد الموافقة',
    status_approved: 'معتمد',
    status_rejected: 'مرفوض',
    status_dispensed: 'تم الصرف',
    btn_review_approve: 'مراجعة واعتماد',
    btn_dispense: 'صرف البطاقات',
    read_only: 'عرض فقط',
    btn_telegram_backup: 'نسخ احتياطي (تلغرام)',
    tg_modal_title: 'النسخ الاحتياطي السحابي (بوت تلغرام)',
    btn_send_backup: 'إرسال النسخة لتلغرام',
    btn_clear_data: 'مسح',
    notification_sound_on: 'الصوت مفعّل',
    notification_sound_off: 'الصوت مكتوم',
    notify_new_request_title: 'طلب بطاقات جديد',
    notify_new_request_body: 'قام أحد الموظفين بتقديم طلب بطاقات جديد يحتاج المراجعة والاعتماد.',
    notify_approved_title: 'تم اعتماد الطلب - جاهز للصرف',
    notify_approved_body: 'تمت الموافقة على طلب بطاقات وهو بانتظار الصرف الفعلي والتسليم.',
    notify_executed_title: 'تم صرف البطاقات وتسليمها',
    notify_executed_body: 'تم تنفيذ طلب البطاقات الخاص بك وصرفه بنجاح. يمكنك الاطلاع على أرقام الـ PIN.'
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

// ==================== NOTIFICATIONS & SOUND CHIME ====================
function initAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

// Play pleasant two-tone chime (880Hz -> 1320Hz or 587Hz -> 880Hz)
function playNotificationChime(toneType = 'chime') {
  if (!soundNotificationEnabled) return;
  try {
    initAudioContext();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';

    if (toneType === 'action_needed') {
      // Approver/Executor chime: bright two-tone (A5 880Hz -> C#6 1108Hz -> E6 1320Hz)
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1108, now + 0.12);
      osc.frequency.setValueAtTime(1320, now + 0.24);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.28, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.7);
    } else {
      // Standard pleasant bell chime (D5 587Hz -> A5 880Hz)
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.setValueAtTime(880, now + 0.15);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    }
  } catch (err) {
    console.warn('Audio chime notice:', err);
  }
}

function updateNotificationUI() {
  const icon = document.getElementById('icon-notification-sound');
  const label = document.getElementById('label-notification-sound');
  const btn = document.getElementById('btn-notification-toggle');
  if (!btn) return;

  const onText = t('notification_sound_on', 'Sound ON');
  const offText = t('notification_sound_off', 'Sound Muted');

  if (soundNotificationEnabled) {
    if (label) label.textContent = onText;
    btn.className = 'flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold transition';
    if (icon) {
      icon.setAttribute('data-lucide', 'bell');
      icon.className = 'w-3.5 h-3.5 text-sky-600';
    }
  } else {
    if (label) label.textContent = offText;
    btn.className = 'flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 border border-slate-200 text-xs font-semibold transition';
    if (icon) {
      icon.setAttribute('data-lucide', 'bell-off');
      icon.className = 'w-3.5 h-3.5 text-slate-400';
    }
  }
  refreshIcons();
}

function toggleNotificationSound() {
  initAudioContext();
  soundNotificationEnabled = !soundNotificationEnabled;
  localStorage.setItem('avsi_sound_enabled', soundNotificationEnabled ? 'true' : 'false');
  updateNotificationUI();

  if (soundNotificationEnabled) {
    playNotificationChime('action_needed');
    showToast(currentLang === 'ar' ? 'تم تفعيل التنبيهات الصوتية بنجاح 🔔' : 'Notification sounds enabled! 🔔', 'success');
    requestSystemNotificationPermission();
  } else {
    showToast(currentLang === 'ar' ? 'تم كتم التنبيهات الصوتية 🔕' : 'Notification sounds muted.', 'info');
  }
}

function requestSystemNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().catch(console.warn);
  }
}

function triggerSystemNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: 'avsi_logo.png',
        badge: 'avsi_logo.png',
        tag: 'avsi-card-request'
      });
    } catch (e) {
      console.warn('System notification error:', e);
    }
  }
}

// Centralized dispatcher for real-time card request events
function handleCardRequestNotification(payload) {
  if (!currentUser) return;
  const newRow = payload.new;
  const oldRow = payload.old;
  const eventType = payload.eventType; // 'INSERT', 'UPDATE'

  const role = currentUser.role; // 'admin', 'approver', 'requester', 'manager'
  const isApprover = role === 'approver';
  const isAdmin = role === 'admin';
  const isRequester = role === 'requester';

  // 1. NEW REQUEST SUBMITTED (Status: PENDING) -> Alert Approver (Yahia) & Admin (Alind)
  if (eventType === 'INSERT' && newRow?.status === 'PENDING') {
    // If the person logged in is the one who just submitted, no need to beep themselves
    if (newRow.requester_id === currentUser.id) return;

    if (isApprover || isAdmin) {
      playNotificationChime('action_needed');
      const title = t('notify_new_request_title', 'New Card Request Submitted');
      const body = `${newRow.requester_name} (${newRow.department || 'Staff'}) requested ${newRow.quantity} card(s).`;

      showToast(`🔔 ${title}: ${body}`, 'info');
      triggerSystemNotification(title, body);
    }
  }

  // 2. REQUEST APPROVED (Status changed from PENDING to APPROVED) -> Alert Executor (Alind Admin)
  if (eventType === 'UPDATE' && newRow?.status === 'APPROVED' && oldRow?.status === 'PENDING') {
    if (isAdmin) {
      playNotificationChime('action_needed');
      const title = t('notify_approved_title', 'Request Approved - Ready to Dispense');
      const body = `Request #${newRow.id} for ${newRow.requester_name} was approved. Ready to dispense.`;

      showToast(`✅ ${title}: ${body}`, 'success');
      triggerSystemNotification(title, body);
    }
  }

  // 3. REQUEST EXECUTED (Status changed to EXECUTED) -> Alert the Requester who submitted it
  if (eventType === 'UPDATE' && newRow?.status === 'EXECUTED' && oldRow?.status !== 'EXECUTED') {
    if (isRequester && newRow.requester_id === currentUser.id) {
      playNotificationChime('chime');
      const title = t('notify_executed_title', 'Cards Dispensed & Ready');
      const body = `Your request for ${newRow.quantity} card(s) was dispensed. Check your portal for PIN codes.`;

      showToast(`🎉 ${title}!`, 'success');
      triggerSystemNotification(title, body);
    }
  }
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

  // Clear any legacy persistent login from localStorage for high security
  localStorage.removeItem('avsi_inventory_user');

  // Check tab/browser active session only (Auto-logout on tab/browser close)
  const savedUser = sessionStorage.getItem('avsi_inventory_user');
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

function formatDateTime(isoString) {
  if (!isoString) return '<span class="text-slate-400 font-mono">-</span>';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return `<span class="font-mono text-xs text-slate-500">${isoString}</span>`;
  const dateStr = d.toLocaleDateString(currentLang === 'ar' ? 'en-CA' : 'en-US');
  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `<div><span class="font-bold text-slate-800 text-xs">${dateStr}</span> <span class="text-[10px] text-slate-400 font-mono block sm:inline sm:ml-1">${timeStr}</span></div>`;
}

function getStatusBadge(status) {
  const dict = translations[currentLang] || translations.en;
  if (status === 'PENDING') return `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold status-badge-pending">${dict.status_pending || 'Pending Approval'}</span>`;
  if (status === 'APPROVED') return `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold status-badge-approved">${dict.status_approved || 'Approved'}</span>`;
  if (status === 'REJECTED') return `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold status-badge-rejected">${dict.status_rejected || 'Rejected'}</span>`;
  if (status === 'EXECUTED') return `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold status-badge-executed">${dict.status_dispensed || 'Dispensed'}</span>`;
  return status;
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

  if (currentUser?.role === 'requester') {
    loadRequesterHistory();
    populateCardSelects();
  } else {
    renderInventoryTable();
    populateCardSelects();
    renderRequestsQueue();
    loadTransactions();
  }
  updateNotificationUI();
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

    if (user.is_active === false) {
      throw new Error(currentLang === 'ar' ? 'تم تعطيل هذا الحساب من قبل الإدارة. يرجى مراجعة المسؤول.' : 'This account has been deactivated. Please contact the administrator.');
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

    sessionStorage.setItem('avsi_inventory_user', JSON.stringify(currentUser));
    localStorage.removeItem('avsi_inventory_user');
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
  sessionStorage.removeItem('avsi_inventory_user');
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
    admin: 'Administrator',
    approver: 'Approver',
    manager: 'Management (Overview)',
    requester: 'Staff Requester'
  };
  document.getElementById('user-role-badge').textContent = roleBadgeMap[currentUser.role] || 'AVSI Safe System';

  // Apply Role-Based Layout Permissions
  applyRolePermissions();

  updateNotificationUI();
  requestSystemNotificationPermission();

  setupRealtime();
  loadDashboardData();
  loadRequestsData();
  applyLanguage(currentLang);
  refreshIcons();
}

function applyRolePermissions() {
  const role = currentUser.role;
  const isRequester = role === 'requester';
  const isAdmin = role === 'admin';     // Alind: execute/dispense + full management
  const isApprover = role === 'approver'; // Yahia: approve/reject + same inventory access as Alind
  const isManager = role === 'manager';   // Read-only overview

  // ── Requester: sees ONLY their own portal ──────────────────────────────────
  const requesterPortal = document.getElementById('requester-portal-view');
  const managerNav = document.getElementById('manager-nav');

  if (isRequester) {
    requesterPortal.classList.remove('hidden');
    managerNav.classList.add('hidden');
    document.querySelectorAll('section[id^="tab-content-"]').forEach(s => s.classList.add('hidden'));
    loadRequesterHistory();
    return;
  }

  // ── All other roles: show full nav, hide requester portal ─────────────────
  requesterPortal.classList.add('hidden');
  managerNav.classList.remove('hidden');
  switchTab('dashboard');

  // ── User Management tab: Alind ONLY ───────────────────────────────────────
  const usersTabBtn = document.getElementById('tab-btn-users');
  if (usersTabBtn) {
    if (isAdmin) usersTabBtn.classList.remove('hidden');
    else usersTabBtn.classList.add('hidden');
  }

  // ── Activity Log: Admin (Alind), Approver (Yahia) and Manager ─────────────
  const activityTabBtn = document.getElementById('tab-btn-activity-log');
  if (activityTabBtn) {
    if (isAdmin || isApprover || isManager) activityTabBtn.classList.remove('hidden');
    else activityTabBtn.classList.add('hidden');
  }

  // ── Stock In & Add New Card: Admin AND Approver (Yahia has same inventory access) ──
  const showInventoryActions = isAdmin || isApprover;
  document.getElementById('btn-admin-stock-in')?.classList.toggle('hidden', !showInventoryActions);
  document.getElementById('btn-admin-new-card')?.classList.toggle('hidden', !showInventoryActions);

  // ── Reconciliation: Admin AND Approver ────────────────────────────────────
  const reconcileBtn = document.getElementById('btn-open-reconcile');
  if (reconcileBtn) reconcileBtn.classList.toggle('hidden', !showInventoryActions);

  // ── Admin-Only Controls: Telegram Cloud Backup, Clear Transactions, Clear Requests ──
  document.getElementById('btn-header-telegram')?.classList.toggle('hidden', !isAdmin);
  document.getElementById('btn-open-backup')?.classList.toggle('hidden', !isAdmin);
  document.getElementById('btn-admin-clear-requests')?.classList.toggle('hidden', !isAdmin);
  document.getElementById('btn-admin-clear-trans')?.classList.toggle('hidden', !isAdmin);

  // ── Delete card button in inventory table: Admin AND Approver ─────────────
  // (applied dynamically inside renderInventoryTable via canManageInventory flag)
  window._canManageInventory = showInventoryActions;
}

// ==================== REALTIME SYNC ====================
function setupRealtime() {
  realtimeChannels.forEach(ch => db.removeChannel(ch));
  realtimeChannels = [];

  const mainChannel = db.channel('avsi-inventory-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'card_types' }, () => {
      loadDashboardData();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'card_requests' }, (payload) => {
      handleCardRequestNotification(payload);
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

    // Always populate selects (so staff requesters have card options in their request modal)
    populateCardSelects();

    // If requester, exit early so we don't calculate or render manager/admin dashboard UI
    if (currentUser?.role === 'requester') return;

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
  // Yahia (approver) has same inventory management rights as Alind, except executing dispensation
  const canManageInventory = currentUser?.role === 'admin' || currentUser?.role === 'approver';

  tbody.innerHTML = filtered.map(card => {
    const stockClass = card.is_low_stock 
      ? 'bg-amber-100 text-amber-800 border border-amber-200' 
      : 'bg-emerald-50 text-emerald-700 border border-emerald-200';

    let actionsHtml = `<span class="text-slate-400 text-[10px]">Read Only</span>`;
    if (canManageInventory) {
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

    if (!cardTypes || cardTypes.length === 0) {
      el.innerHTML = `<option value="">${currentLang === 'ar' ? '-- لا توجد بطاقات متاحة حالياً --' : currentLang === 'ku' ? '-- چ کارت بەردەست نینن --' : '-- No cards available --'}</option>`;
      return;
    }

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

  if (!cardTypeId || isNaN(cardTypeId)) {
    showToast(currentLang === 'ar' ? 'يرجى اختيار نوع البطاقة والفئة المطلوبة.' : currentLang === 'ku' ? 'تکایە جۆرێ کارتی هەڵبژێرە.' : 'Please select a valid card type.', 'warning');
    return;
  }

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
    showToast('Card request submitted successfully for approval!', 'success');
    
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
      const emptyMsg = (translations[currentLang] || translations.en).no_requests_user || 'No requests submitted yet. Click + New Card Request above.';
      tbody.innerHTML = `<tr><td colspan="8" class="text-center py-6 text-slate-400 font-medium">${emptyMsg}</td></tr>`;
      return;
    }

    tbody.innerHTML = requests.map(r => {
      const statusBadge = getStatusBadge(r.status);
      const isExecuted = r.status === 'EXECUTED';
      const dispenseText = isExecuted ? (currentLang === 'ar' ? '✓ تم الصرف' : '✓ Dispensed') : '—';

      // Confidential PIN: visible only to this requester when executed
      let pinDisplay = '<span class="text-slate-400 font-mono text-xs">-</span>';
      if (isExecuted && r.pin_numbers) {
        pinDisplay = `<span class="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono font-bold text-xs select-all shadow-sm tracking-wide">${r.pin_numbers}</span>`;
      }

      return `
        <tr class="hover:bg-slate-50 transition">
          <td class="py-2.5 px-3 font-mono text-[11px] text-slate-600">${formatDateTime(r.created_at)}</td>
          <td class="py-2.5 px-3 font-bold text-slate-900">${r.card_types?.provider} ${r.card_types?.denomination?.toLocaleString()} IQD</td>
          <td class="py-2.5 px-3 text-center font-extrabold text-sky-600">${r.quantity}</td>
          <td class="py-2.5 px-3 text-slate-600">${r.department}</td>
          <td class="py-2.5 px-3 text-slate-700">${r.reason}</td>
          <td class="py-2.5 px-3 text-center">${statusBadge}</td>
          <td class="py-2.5 px-3 text-center text-[11px] font-mono text-slate-500">${dispenseText}</td>
          <td class="py-2.5 px-3 text-center">${pinDisplay}</td>
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
    const emptyMsg = (translations[currentLang] || translations.en).no_requests_queue || 'No requests in this queue.';
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-6 text-slate-400 font-medium">${emptyMsg}</td></tr>`;
    return;
  }

  const role = currentUser?.role;
  // Yahia (approver): reviews and approves/rejects PENDING requests only
  const isApprover = role === 'approver';
  // Alind (admin): executes/dispenses APPROVED requests only
  const isAdmin = role === 'admin';
  const dict = translations[currentLang] || translations.en;

  tbody.innerHTML = filtered.map(r => {
    const statusBadge = getStatusBadge(r.status);
    let actionBtn = `<span class="text-slate-400 text-[10px]">—</span>`;

    // Yahia (approver) action: review PENDING requests
    if (isApprover && r.status === 'PENDING') {
      actionBtn = `
        <button onclick="openApprovalModal(${r.id})" class="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition shadow-sm">
          ${dict.btn_review_approve || 'Review & Approve'}
        </button>
      `;
    }

    // Alind (admin) action: dispense APPROVED requests
    if (isAdmin && r.status === 'APPROVED') {
      actionBtn = `
        <button onclick="openExecuteModal(${r.id})" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm flex items-center gap-1 mx-auto">
          <i data-lucide="package-check" class="w-3.5 h-3.5"></i>
          <span>${dict.btn_dispense || 'Dispense'}</span>
        </button>
      `;
    }

    const deleteBtn = isAdmin ? `
      <button onclick="deleteCardRequest(${r.id})" class="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition" title="Delete Request">
        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
      </button>
    ` : '';

    return `
      <tr class="hover:bg-slate-50 transition">
        <td class="py-2.5 px-3 font-mono text-[11px] text-slate-600">${formatDateTime(r.created_at)}</td>
        <td class="py-2.5 px-3 font-bold text-slate-900">${r.requester_name}</td>
        <td class="py-2.5 px-3 text-slate-600">${r.department}</td>
        <td class="py-2.5 px-3 font-semibold text-slate-800">${r.card_types?.provider} ${r.card_types?.denomination?.toLocaleString()} IQD</td>
        <td class="py-2.5 px-3 text-center font-extrabold text-sky-600">${r.quantity}</td>
        <td class="py-2.5 px-3 text-slate-600 text-xs">${r.reason}</td>
        <td class="py-2.5 px-3 text-center">${statusBadge}</td>
        <td class="py-2.5 px-3 text-center">
          <div class="inline-flex items-center justify-center gap-1.5">
            ${actionBtn}
            ${deleteBtn}
          </div>
        </td>
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

    logAudit('REQUEST_REVIEW', `Approver [${currentUser.fullName}] marked request #${requestId} as ${decision}.`);
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

    logAudit('REQUEST_EXECUTED', `Dispensed ${req.quantity} cards for [${req.requester_name}] by [${currentUser.fullName}].`);
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
    // Check if card type already exists (even if inactive)
    console.log('[AddCardType] Checking for:', { provider, denomination, category });
    const { data: existing, error: checkErr } = await db.from('card_types')
      .select('id, is_active')
      .eq('provider', provider)
      .eq('denomination', denomination)
      .eq('category', category)
      .maybeSingle();
    console.log('[AddCardType] Existing record:', existing, 'Error:', checkErr);

    if (existing) {
      if (!existing.is_active) {
        // Reactivate the old record instead of inserting a duplicate
        const { error: updateErr } = await db.from('card_types').update({
          is_active: true,
          min_stock_alert: minStockAlert,
          unit_cost: unitCost,
          expiry_date: expiryDate,
          pin_number: pin
        }).eq('id', existing.id);
        if (updateErr) throw updateErr;
        logAudit('CARD_TYPE_REACTIVATED', `Reactivated card type [${provider} ${denomination} ${category}].`);
        closeModal('new-card-modal');
        showToast(currentLang === 'ar' ? 'تم إعادة تفعيل الفئة بنجاح!' : currentLang === 'ku' ? 'جۆرێ کارتی دووبارە چالاکبوو!' : 'Card type reactivated successfully!', 'success');
        loadDashboardData();
        return;
      } else {
        // Active duplicate — show friendly error
        showToast(currentLang === 'ar' ? 'هذه الفئة مسجلة مسبقاً بنفس الشركة والقيمة والنوع!' : currentLang === 'ku' ? 'ئەم جۆرە کارتە پێشتر تۆمارکراوە بە هەمان کۆمپانیا، بها، و جۆر!' : 'This card type already exists with the same provider, denomination, and category!', 'error');
        return;
      }
    }

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

    logAudit('NEW_CARD_TYPE', `Added card type [${provider} ${denomination} ${category}].`);
    closeModal('new-card-modal');
    showToast(currentLang === 'ar' ? 'تمت إضافة الفئة بنجاح!' : currentLang === 'ku' ? 'جۆرێ کارتی نوێ زیادکرا!' : 'New card type registered successfully!', 'success');
    loadDashboardData();
  } catch (err) {
    if (err.code === '23505' || err.status === 409 || (err.message && err.message.toLowerCase().includes('duplicate'))) {
      showToast(currentLang === 'ar' ? 'هذه الفئة مسجلة مسبقاً بنفس الشركة والقيمة والنوع!' : currentLang === 'ku' ? 'ئەم جۆرە کارتە پێشتر تۆمارکراوە!' : 'This card type already exists!', 'error');
    } else {
      showToast(err.message, 'error');
    }
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
          ${u.id === currentUser.id ? '<span class="text-slate-400 font-bold">Current (You)</span>' : `
            <div class="inline-flex items-center gap-2">
              <button onclick="toggleUserStatus(${u.id}, ${!u.is_active}, '${u.username}')" class="text-xs font-semibold ${u.is_active ? 'text-amber-600 hover:underline' : 'text-emerald-600 hover:underline'}">
                ${u.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <button onclick="deleteUserAccount(${u.id}, '${u.username}')" class="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline">
                Delete
              </button>
            </div>
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
    if (err.code === '23505' || err.status === 409 || (err.message && err.message.toLowerCase().includes('duplicate'))) {
      showToast(currentLang === 'ar' ? 'اسم المستخدم هذا مسجل مسبقاً، يرجى اختيار اسم آخر!' : 'This username is already taken. Please choose another.', 'error');
    } else {
      showToast(err.message, 'error');
    }
  }
}

async function toggleUserStatus(userId, activate, username) {
  try {
    await db.from('users').update({ is_active: activate }).eq('id', userId);
    logAudit('USER_STATUS_CHANGE', `Admin changed user [${username}] active status to: ${activate}`);
    showToast(`User status updated to ${activate ? 'Active' : 'Inactive'}.`, 'success');
    loadUsersData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteUserAccount(userId, username) {
  if (!confirm(`Are you sure you want to permanently delete user account [${username}]?`)) return;

  try {
    const { error } = await db.from('users').delete().eq('id', userId);
    if (error) throw error;

    logAudit('USER_DELETED', `Admin permanently deleted user account [${username}].`);
    showToast(`User [${username}] deleted.`, 'success');
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
    sessionStorage.setItem('avsi_inventory_user', JSON.stringify(currentUser));
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
        id: r.id,
        type: 'STOCK_IN',
        card: `${r.card_types?.provider} ${r.card_types?.denomination?.toLocaleString()}`,
        qty: r.quantity,
        party: r.supplier || 'Official Vendor',
        detail: r.notes || '-',
        pin: r.pin_numbers || '-',
        handler: r.received_by,
        date: r.created_at || r.date_received
      }));
    }

    if (typeFilter !== 'receipt' && issRes.data) {
      issRes.data.forEach(i => list.push({
        id: i.id,
        type: 'DISPENSED',
        card: `${i.card_types?.provider} ${i.card_types?.denomination?.toLocaleString()}`,
        qty: i.quantity,
        party: i.requester_name,
        detail: `${i.department || ''} - ${i.reason}`,
        pin: i.pin_numbers || '-',
        handler: i.issued_by,
        date: i.created_at || i.date_issued
      }));
    }

    currentTransactionsList = list;

    if (list.length === 0) {
      const emptyMsg = (translations[currentLang] || translations.en).no_transactions || 'No transactions recorded.';
      tbody.innerHTML = `<tr><td colspan="9" class="text-center py-6 text-slate-400 font-medium">${emptyMsg}</td></tr>`;
      return;
    }

    const isAdmin = currentUser?.role === 'admin';

    tbody.innerHTML = list.map(item => `
      <tr class="hover:bg-slate-50 transition">
        <td class="py-2.5 px-3">
          <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${item.type === 'STOCK_IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'}">
            ${item.type === 'STOCK_IN' ? (currentLang === 'ar' ? 'استلام رصيد' : 'Stock In') : (currentLang === 'ar' ? 'صرف بطاقات' : 'Dispensed')}
          </span>
        </td>
        <td class="py-2.5 px-3 font-bold text-slate-900">${item.card}</td>
        <td class="py-2.5 px-3 text-center font-bold text-sky-600">${item.qty}</td>
        <td class="py-2.5 px-3 text-slate-800">${item.party}</td>
        <td class="py-2.5 px-3 text-slate-500">${item.detail}</td>
        <td class="py-2.5 px-3 font-mono text-xs text-slate-600">${item.pin}</td>
        <td class="py-2.5 px-3 text-slate-700">${item.handler}</td>
        <td class="py-2.5 px-3 font-mono text-[11px] text-slate-600">${formatDateTime(item.date)}</td>
        <td class="py-2.5 px-3 text-center">
          ${isAdmin ? `
            <button onclick="deleteSingleTransaction('${item.type}', ${item.id})" class="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition" title="Delete Entry">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          ` : '<span class="text-slate-300 text-[10px]">—</span>'}
        </td>
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

// ==================== EXCEL EXPORTS (AVSI OFFICIAL BRANDING) ====================
function exportDashboardToExcel() {
  const rows = [
    ['AVSI Organization - Scratch Card Inventory System'],
    ['Report:', 'Current Safe Stock Inventory Overview'],
    ['Exported At:', new Date().toLocaleString()],
    ['Total Types:', cardTypes.length],
    [],
    ['Provider', 'Denomination (IQD)', 'Category', 'Available Stock', 'Min Alert', 'Expiry Date', 'Total Value (IQD)']
  ];

  cardTypes.forEach(c => {
    rows.push([
      c.provider,
      c.denomination,
      c.category,
      c.current_stock,
      c.min_stock_alert,
      c.expiry_date || '-',
      c.total_face_value
    ]);
  });

  if (window.XLSX) {
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Safe_Inventory');
    XLSX.writeFile(wb, `AVSI_Safe_Inventory_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Inventory exported to Excel!', 'success');
  }
}

function exportRequestsToExcel() {
  if (!allRequests || allRequests.length === 0) {
    showToast('No requests available to export.', 'info');
    return;
  }
  const rows = [
    ['AVSI Organization - Scratch Card Inventory System'],
    ['Report:', 'Card Requests Workflow & Status Queue'],
    ['Exported At:', new Date().toLocaleString()],
    ['Total Records:', allRequests.length],
    [],
    ['Date & Time', 'Requester Staff', 'Department', 'Card Provider & Value', 'Quantity', 'Purpose / Activity', 'Status', 'Dispensed PINs', 'Approved By', 'Executed By']
  ];

  allRequests.forEach(r => {
    rows.push([
      new Date(r.created_at).toLocaleString(),
      r.requester_name || '-',
      r.department || '-',
      `${r.card_types?.provider || ''} ${r.card_types?.denomination?.toLocaleString() || ''} IQD`,
      r.quantity,
      r.reason || '-',
      r.status,
      r.pin_numbers || '-',
      r.approved_by || '-',
      r.executed_by || '-'
    ]);
  });

  if (window.XLSX) {
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Card_Requests');
    XLSX.writeFile(wb, `AVSI_Card_Requests_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Card requests exported to Excel!', 'success');
  }
}

let currentTransactionsList = [];

function exportTransactionsToExcel() {
  if (!currentTransactionsList || currentTransactionsList.length === 0) {
    showToast('No transactions available to export.', 'info');
    return;
  }
  const rows = [
    ['AVSI Organization - Scratch Card Inventory System'],
    ['Report:', 'Complete Safe Transactions Activity Log (Stock In & Out)'],
    ['Exported At:', new Date().toLocaleString()],
    ['Total Transactions:', currentTransactionsList.length],
    [],
    ['Date & Time', 'Transaction Type', 'Card & Value', 'Quantity', 'Recipient / Supplier', 'Department / Reason', 'PIN Numbers', 'Handled By']
  ];

  currentTransactionsList.forEach(t => {
    rows.push([
      new Date(t.date).toLocaleString(),
      t.type === 'STOCK_IN' ? 'Stock In (Receipt)' : 'Dispensed (Issuance)',
      t.card,
      t.qty,
      t.party,
      t.detail,
      t.pin || '-',
      t.handler || '-'
    ]);
  });

  if (window.XLSX) {
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Safe_Transactions');
    XLSX.writeFile(wb, `AVSI_Safe_Transactions_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Transactions exported to Excel!', 'success');
  }
}

function exportReportToCSV() {
  if (currentReportData.length === 0) return;
  const rows = [
    ['AVSI Organization - Scratch Card Inventory System'],
    ['Report:', 'Periodic Physical Stock Reconciliation & Valuation'],
    ['Exported At:', new Date().toLocaleString()],
    [],
    ['Card Type', 'Denomination', 'Opening', 'Received (+)', 'Issued (-)', 'Closing', 'Total Value (IQD)']
  ];
  currentReportData.forEach(r => rows.push([r.cardName, r.denom, r.opening, r.received, r.issued, r.closing, r.totalVal]));

  if (window.XLSX) {
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Audit_Report');
    XLSX.writeFile(wb, `AVSI_Safe_Audit_${new Date().toISOString().split('T')[0]}.xlsx`);
  } else {
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `AVSI_Safe_Audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// ==================== TRANSACTION & REQUEST DELETION (ADMIN ONLY) ====================
async function deleteCardRequest(requestId) {
  if (!confirm('Are you sure you want to permanently delete this card request?')) return;
  try {
    const { error } = await db.from('card_requests').delete().eq('id', requestId);
    if (error) throw error;
    logAudit('DELETE_REQUEST', `Admin deleted request #${requestId}.`);
    showToast('Request deleted successfully.', 'success');
    loadRequestsData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteSingleTransaction(type, id) {
  if (!confirm('Are you sure you want to permanently delete this transaction record?')) return;
  try {
    const table = type === 'STOCK_IN' ? 'receipts' : 'issuances';
    const { error } = await db.from(table).delete().eq('id', id);
    if (error) throw error;
    logAudit('DELETE_TRANSACTION', `Admin deleted ${type} transaction #${id}.`);
    showToast('Transaction record deleted successfully.', 'success');
    loadTransactions();
    loadDashboardData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function confirmClearTransactions() {
  if (!confirm('CAUTION: Are you sure you want to permanently delete ALL transaction history (Receipts and Issuances)? This will clear all test records.')) return;
  try {
    const [d1, d2] = await Promise.all([
      db.from('receipts').delete().neq('id', 0),
      db.from('issuances').delete().neq('id', 0)
    ]);
    if (d1.error) throw d1.error;
    if (d2.error) throw d2.error;
    logAudit('CLEAR_ALL_TRANSACTIONS', 'Admin cleared all transaction history (receipts and issuances).');
    showToast('All transaction records cleared successfully.', 'success');
    loadTransactions();
    loadDashboardData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function confirmClearRequests() {
  if (!confirm('CAUTION: Are you sure you want to permanently delete ALL card requests? This will clear all test requests.')) return;
  try {
    const { error } = await db.from('card_requests').delete().neq('id', 0);
    if (error) throw error;
    logAudit('CLEAR_ALL_REQUESTS', 'Admin cleared all card requests.');
    showToast('All card requests cleared successfully.', 'success');
    loadRequestsData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ==================== TELEGRAM BOT CLOUD BACKUP ====================
function loadTelegramSettings() {
  const token = localStorage.getItem('avsi_tg_bot_token') || '';
  const chatId = localStorage.getItem('avsi_tg_chat_id') || '';
  const tokenEl = document.getElementById('tg-bot-token');
  const chatEl = document.getElementById('tg-chat-id');
  if (tokenEl) tokenEl.value = token;
  if (chatEl) chatEl.value = chatId;
}

function saveTelegramSettings() {
  const token = document.getElementById('tg-bot-token')?.value.trim();
  const chatId = document.getElementById('tg-chat-id')?.value.trim();
  if (!token || !chatId) {
    showToast('Please enter both Bot Token and Chat ID', 'error');
    return;
  }
  localStorage.setItem('avsi_tg_bot_token', token);
  localStorage.setItem('avsi_tg_chat_id', chatId);
  showToast('Telegram bot credentials saved successfully!', 'success');
}

async function testTelegramBot() {
  const token = document.getElementById('tg-bot-token')?.value.trim() || localStorage.getItem('avsi_tg_bot_token');
  const chatId = document.getElementById('tg-chat-id')?.value.trim() || localStorage.getItem('avsi_tg_chat_id');
  if (!token || !chatId) {
    showToast('Please enter Telegram Bot Token and Chat ID first', 'error');
    return;
  }

  try {
    showToast('Sending test message to Telegram...', 'info');
    const msg = `🔔 *AVSI Scratch Card Inventory*\n✅ Telegram Bot connected successfully!\n🕒 Time: ${new Date().toLocaleString()}\n👤 Admin: ${currentUser?.fullName || 'Alind'}`;
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'Markdown' })
    });
    const data = await res.json();
    if (data.ok) {
      showToast('Telegram ping sent successfully! Check your Telegram chat.', 'success');
    } else {
      throw new Error(data.description || 'Failed to send message');
    }
  } catch (err) {
    showToast(`Telegram Error: ${err.message}`, 'error');
  }
}

async function sendTelegramBackup() {
  const token = document.getElementById('tg-bot-token')?.value.trim() || localStorage.getItem('avsi_tg_bot_token');
  const chatId = document.getElementById('tg-chat-id')?.value.trim() || localStorage.getItem('avsi_tg_chat_id');
  if (!token || !chatId) {
    showToast('Please configure Telegram Bot Token and Chat ID first.', 'error');
    return;
  }

  const btn = document.getElementById('btn-send-tg-backup');
  if (btn) btn.disabled = true;

  try {
    showToast('Compiling safe database backup...', 'info');

    const [cardsRes, reqsRes, recsRes, issRes, logsRes, usersRes] = await Promise.all([
      db.from('card_types').select('*'),
      db.from('card_requests').select('*'),
      db.from('receipts').select('*'),
      db.from('issuances').select('*'),
      db.from('audit_logs').select('*'),
      db.from('users').select('id, full_name, username, role, department, is_active, created_at')
    ]);

    const backupData = {
      system: 'AVSI Scratch Card Safe Inventory System',
      exported_at: new Date().toISOString(),
      exported_by: currentUser?.fullName || 'Admin',
      statistics: {
        total_card_types: cardsRes.data ? cardsRes.data.length : 0,
        total_requests: reqsRes.data ? reqsRes.data.length : 0,
        total_receipts: recsRes.data ? recsRes.data.length : 0,
        total_issuances: issRes.data ? issRes.data.length : 0,
        total_audit_logs: logsRes.data ? logsRes.data.length : 0
      },
      card_types: cardsRes.data || [],
      card_requests: reqsRes.data || [],
      receipts: recsRes.data || [],
      issuances: issRes.data || [],
      audit_logs: logsRes.data || [],
      users: usersRes.data || []
    };

    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const filename = `AVSI_Safe_Backup_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;

    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('caption', `📦 *AVSI Scratch Card Inventory - Full Database Backup*\n📅 Date: ${new Date().toLocaleString()}\n👤 Admin: ${currentUser?.fullName || 'Alind'}\n💳 Cards: ${cardsRes.data?.length || 0} | 📥 Receipts: ${recsRes.data?.length || 0} | 📤 Issuances: ${issRes.data?.length || 0}`);
    formData.append('parse_mode', 'Markdown');
    formData.append('document', blob, filename);

    const res = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (data.ok) {
      logAudit('TELEGRAM_BACKUP', `Admin sent complete database backup to Telegram chat [${chatId}].`);
      showToast('Full safe backup delivered to Telegram successfully!', 'success');
      closeModal('telegram-backup-modal');
    } else {
      throw new Error(data.description || 'Telegram failed to accept document');
    }
  } catch (err) {
    showToast(`Backup Error: ${err.message}`, 'error');
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function downloadLocalBackup() {
  try {
    const [cardsRes, reqsRes, recsRes, issRes, logsRes] = await Promise.all([
      db.from('card_types').select('*'),
      db.from('card_requests').select('*'),
      db.from('receipts').select('*'),
      db.from('issuances').select('*'),
      db.from('audit_logs').select('*')
    ]);

    const backupData = {
      system: 'AVSI Scratch Card Safe Inventory System',
      exported_at: new Date().toISOString(),
      card_types: cardsRes.data || [],
      card_requests: reqsRes.data || [],
      receipts: recsRes.data || [],
      issuances: issRes.data || [],
      audit_logs: logsRes.data || []
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `AVSI_Safe_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Local JSON backup downloaded.', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function logAudit(action, description) {
  if (!db) return;
  db.from('audit_logs').insert({
    username: currentUser ? currentUser.username : 'system',
    action,
    description
  }).then(() => {});
}

// Activity Log Loading
async function loadActivityLog() {
  const tbody = document.getElementById('activity-log-tbody');
  if (!tbody) return;

  try {
    const { data: logs, error } = await db
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(60);

    if (error) throw error;

    if (!logs || logs.length === 0) {
      const emptyMsg = (translations[currentLang] || translations.en).no_logs || 'No activity recorded yet.';
      tbody.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-slate-400 font-medium">${emptyMsg}</td></tr>`;
      return;
    }

    tbody.innerHTML = logs.map(l => `
      <tr class="hover:bg-slate-50 transition">
        <td class="py-2 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">${formatDateTime(l.created_at)}</td>
        <td class="py-2 px-3 font-bold text-slate-800">${l.username || 'System'}</td>
        <td class="py-2 px-3 text-center">
          <span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold font-mono uppercase bg-slate-100 text-slate-700">${l.action}</span>
        </td>
        <td class="py-2 px-3 text-slate-600 text-xs">${l.description}</td>
      </tr>
    `).join('');
  } catch (err) {
    showToast(err.message, 'error');
  }
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
  else if (tabId === 'activity-log') loadActivityLog();
  else if (tabId === 'users') loadUsersData();

  refreshIcons();
}

function openModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) {
    m.classList.remove('hidden');
    if (modalId === 'staff-request-modal') {
      if (!cardTypes || cardTypes.length === 0) {
        loadDashboardData();
      } else {
        populateCardSelects();
      }
    }
    if (modalId === 'profile-modal' && currentUser) {
      document.getElementById('profile-full-name').value = currentUser.fullName || '';
      document.getElementById('profile-old-pass').value = '';
      document.getElementById('profile-new-pass').value = '';
    }
    if (modalId === 'telegram-backup-modal') {
      loadTelegramSettings();
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
