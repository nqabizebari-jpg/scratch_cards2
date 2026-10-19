// app-supabase.js - Supabase-backed Real-time PWA for Safe Card Inventory
// Runs 100% on client-side (no Node.js server required), works on GitHub Pages & mobile PWA!

const SUPABASE_URL = 'https://cgteaimxnwggxgcgzotn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_RaVlF6tbox5dBFjdM4-Aqg_mG5HdQDF';

const { createClient } = window.supabase || {};
const db = createClient ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Global State
let currentUser = null;
let currentLang = localStorage.getItem('safe_inventory_lang') || 'ku';
let cardTypes = [];
let realtimeChannel = null;
let currentReportData = [];

const translations = {
  ku: {
    app_title: 'عەمبارا کارتێن خەزینەیێ',
    app_subtitle: 'تۆمارکرن و چاڤدێریکردنا کارتێن مۆبایل و ئینتەرنێتێ د خەزینەیێ دا ب شێوەیەکێ دەمەکی (Real-Time)',
    username: 'ناڤێ بکارئینەری (Username)',
    password: 'تێپەڕەوشە (Password)',
    login_button: 'چوونەژوورێ (Login)',
    quick_login_hint: 'کلیک بکە بۆ چوونەژوورێ یا بلەز:',
    user_1_btn: 'بکارئینەرێ 1 (User 1)',
    user_2_btn: 'بکارئینەرێ 2 (User 2)',
    tab_dashboard: 'داشبۆرد و عەمبار',
    tab_transactions: 'مێژوویا لڤینان',
    tab_reports: 'جەرد و راپۆرت',
    tab_audit: 'سەرپەرشتی و وردبینی',
    tab_share: 'بەستنا تۆرێ (Share)',
    edit_profile: 'گۆهۆڕینا هەژمارێ',
    alert_banner_title: 'ئاگادارییا کێمبوونا کارتان د خەزینەیێ دا!',
    btn_stock_in: '+ وەرگرتنا کارتان',
    btn_issue_card: 'دەرخستنا کارتان',
    btn_new_card: 'جۆرێ نوێ',
    kpi_total_cards: 'کۆیێ گشتیێ کارتێن خەزینەیێ',
    kpi_card_types: 'جۆرێن بەردەست',
    kpi_face_value: 'بهایێ کارتان (Face Value)',
    kpi_face_sub: 'بهایێ فەرمی یێ فرۆتنێ',
    kpi_today_flow: 'لڤینێن ئەڤرۆ',
    kpi_today_sub: 'هاتن و دەرچوونا فەرمی',
    in_label: 'هاتن',
    out_label: 'دەرچوون',
    kpi_low_stock: 'کارتێن کێم',
    kpi_low_sub: 'پێدڤی ب زێدەکرنێ نە',
    inventory_table_title: 'لیستا کارتێن خەزینەیێ (Safe Inventory)',
    th_provider: 'کۆمپانیا و جۆر',
    th_denomination: 'بهایێ کارتی',
    th_category: 'پۆلێن',
    th_available_stock: 'ژمارا بەردەست',
    th_min_alert: 'راددێ ئاگاداریێ',
    th_total_value: 'کۆیێ بها',
    th_actions: 'کردارێن بلەز',
    trans_title: 'مێژوویا تەمام یا لڤینێن خەزینەیێ',
    trans_subtitle: 'تۆمارا هەمی وەرگرتن و دەرخستنان دگەل ناڤێ کەسێ بەرپرس و بەرواری',
    th_trans_type: 'جۆرێ لڤینێ',
    th_card: 'کارت و بها',
    th_qty: 'ژمارە',
    th_requester: 'داواکەر / دابینکەر',
    th_reason: 'هوکار / تێبینی',
    th_handler: 'بەرپرسێ جێبەجێکار',
    th_date: 'بەروار و دەمژمێر',
    audit_title: 'جەردا خەزینەیێ و راپۆرتێن دەوری',
    audit_subtitle: 'پشکنینا دەستپێکێ (Opening)، هاتین (Received)، دەرچووین (Issued) و ماین (Closing) بۆ جەردا سالانە، هەیڤانە یان هەفتیانە',
    btn_print: 'چاپکرن (Print)',
    btn_excel: 'داگرتن (Excel / CSV)',
    btn_reconcile_nav: 'راستڤەکرن / جەردا دەستی',
    quick_audit_label: 'جەردا بلەز:',
    audit_today: '📅 جەردا ئەڤرۆ (Daily)',
    audit_week: '📆 جەردا ڤێ هەفتیێ (Weekly)',
    audit_month: '📊 جەردا ڤێ هەیڤێ (Monthly)',
    audit_year: '🏛️ جەردا ئەڤ ساڵە (Annual)',
    from_date: 'ژ:',
    to_date: 'تا:',
    btn_show_audit: 'پیشاندان',
    th_opening: 'هەژمارا دەستپێکێ (Opening)',
    th_received: 'هاتین (Received +)',
    th_issued: 'دەرچووین (Issued -)',
    th_closing: 'جەردا دووماهیێ (Closing)',
    th_total_val: 'کۆیێ بهایێ ماین (IQD)',
    reconcile_title: 'راستڤەکرنا خەزینەیێ (Reconciliation)',
    reconcile_sub: 'ل دەمێ جەردا دەستی، ئەگەر جیاوازی هەبیت، دشێی ب شێوەیەکێ فەرمی ژمارەیان راستڤە بکەی.',
    select_card: 'هەڵبژاردنا کارتی',
    current_system_count: 'هەژمارا سیستەمی',
    actual_safe_count: 'هەژمارا راستی د خەزینەیێ دا',
    reconcile_reason: 'ئەگەرێ فەرمی یێ راستڤەکرنێ',
    btn_save_reconcile: 'تۆمارکرنا راستڤەکرنێ',
    audit_log_title: 'تۆمارا پشکنین و وردبینیێ (Audit Trail)',
    audit_log_sub: 'هەمی چوونەژووربوون، زێدەکرن، دەرخستن و گوهۆڕین دگەل ناسنامەیێ ل ڤێرە د پاراستینە.',
    btn_refresh: 'نوێکرنەوە',
    share_title: 'بەستنا دەمەکی د ناڤبەرا هەردوو کەسان دا (Share Point)',
    share_desc: 'لاپتوپا هەڤالێ تە پێدڤی ب هیچ زمانەکێ پرۆگرامینگی و دانانێ (Installation) نینە! تنێ با براوزەرێ خۆ (Chrome یان Edge) ڤەکەت.',
    share_link_label: 'لینکا ڤەکرنێ بۆ لاپتوپا هەڤالێ تە:',
    btn_copy: 'کۆپیکرن',
    share_wifi_note: '* تنێ بەسە هەردوو کۆمپیوتەر ل سەر هەمان هێلا ئینتەرنێتێ یان Wi-Fi بن. پێدڤی ب هیچ بەرنامەیەکێ دی ناکەت.',
    acc_1_title: 'ئەژمارا ئێکێ (بکارئینەر 1)',
    acc_2_title: 'ئەژمارا دووێ (بکارئینەر 2)',
    profile_modal_title: 'گۆهۆڕینا پێزانینێن ئەکاونتێ تە',
    full_name: 'ناڤێ تە یێ دیار (Display Name)',
    profile_username: 'ناڤێ بکارئینەری یێ نوێ (Username)',
    current_password: 'تێپەڕەوشا کەڤن (Current Password)',
    new_password: 'تێپەڕەوشا نوێ (New Password - ئەگەر دڤێت بگۆڕی)',
    btn_cancel: 'پاشگەزبوون',
    btn_save_changes: 'پاراستنا گۆهۆڕینان',
    modal_stock_in_title: 'وەرگرتنا کارتێن نوێ بۆ خەزینەیێ (Stock In)',
    form_qty: 'ژمارا کارتان (Quantity)',
    form_cost: 'بهایێ کڕینێ (IQD)',
    form_supplier: 'دابینکەر (Supplier)',
    form_date: 'بەروارێ وەرگرتنێ',
    form_notes: 'تێبینی',
    btn_record_in: 'تۆمارکرنا وەرگرتنێ',
    modal_issue_title: 'دەرخستنا کارتان ژ خەزینەیێ (Issue Scratch Card)',
    form_issue_qty: 'ژمارا دەرخستنێ (Quantity)',
    form_issue_date: 'بەروار و دەمژمێر (Date & Time)',
    form_requester: 'ناڤێ کەسێ وەرگر د ناڤ رێکخراوێ دا (Recipient in Organization)',
    form_dept: 'بەش یان پرۆژە د ناڤ رێکخراوێ دا (Department / Project)',
    form_reason: 'مەبەستا بکارئینانێ (بۆ چ کار یان چالاکی هاتیە برن؟)',
    btn_record_out: 'تۆمار و کێمکرنا کارتان',
    modal_new_card_title: 'زێدەکرنا جۆرەکێ نوێ یێ کارتی',
    btn_add: 'زێدەکرن',

    // Extra dynamic keys
    filter_all_providers: 'هەمی کۆمپانیا (All)',
    filter_all_status: 'هەمی رەوش (All Status)',
    filter_low_stock: 'کارتێن کێم (Low Stock)',
    filter_in_stock: 'بەردەست (In Stock)',
    filter_all_trans: 'هەمی لڤین (All)',
    filter_receipts_only: 'تنێ وەرگرتن (In)',
    filter_issuances_only: 'تنێ دەرخستن (Out)',
    search_inventory_ph: 'لێگەڕیان ل جۆرێ کارتی...',
    search_trans_ph: 'لێگەڕیان ب ناڤێ وەرگر، کارت، هوکار...',
    cards_unit: 'کارت',
    types_unit: 'جۆرێن بەردەست',
    mobile_label: 'مۆبایل',
    internet_label: 'ئینتەرنێت',
    supplier_default: 'دابینکەرێ فەرمی',
    total_label: 'کۆیێ گشتی (Total):',
    available_prefix: 'بەردەست: ',
    no_cards_found: 'هیچ کارتەک نەهاتە دیتن ب ڤان تایبەتمەندیان.',
    no_trans_found: 'هیچ لڤینەک تۆمار نەکریە.',
    action_receipt_title: 'وەرگرتنا ڤی کارتی',
    action_issue_title: 'دەرخستنا ڤی کارتی',
    action_delete_title: 'ژێبرنا ڤی جۆری',
    action_delete_trans_title: 'ژێبرنا ڤێ تۆمارێ',
    report_calculating_hint: 'جارێ یا حساباتا جەردا خەزینەیێ دکەت (دەستپێک، هاتین، دەرچووین و ماین)...',
    expiry_banner_title: 'ئاگادارییا ب سەرڤەچوونا کارتان د خەزینەیێ دا (Expiry Alert)!',
    btn_view_expiring: 'پیشاندان',
    btn_dashboard_excel: 'داگرتنا عەمبارێ (Excel / CSV)',
    th_expiry_date: 'مێژوویا ب سەرڤەچوونێ',
    form_expiry_date: 'مێژوویا ب سەرڤەچوونێ (Expiry Date)',
    modal_edit_expiry_title: 'گۆهۆڕینا مێژوویا ب سەرڤەچوونێ',
    edit_expiry_hint: 'کلیک بکە بۆ گۆهۆڕینا مێژوویا ب سەرڤەچوونێ',
    filter_expiring_soon: 'نێزیکی ب سەرڤەچوونێ (Expiring Soon)',
    filter_expired: 'ب سەرڤەچوویە (Expired)',
    status_expired: 'ب سەرڤەچوویە',
    status_expiring_soon: 'نێزیکی ب سەرڤەچوونێ',
    status_valid: 'ساریکری و چالاک',
    days_unit: 'روژ ماین'
  },
  ar: {
    app_title: 'نظام إدارة بطاقات الخزنة',
    app_subtitle: 'تسجيل ومراقبة بطاقات شحن الموبايل والإنترنت داخل الخزنة لحظياً (Real-Time)',
    username: 'اسم المستخدم (Username)',
    password: 'كلمة المرور (Password)',
    login_button: 'تسجيل الدخول (Login)',
    quick_login_hint: 'اضغط للدخول السريع:',
    user_1_btn: 'المستخدم الأول (User 1)',
    user_2_btn: 'المستخدم الثاني (User 2)',
    tab_dashboard: 'لوحة التحكم والمخزون',
    tab_transactions: 'سجل الحركات',
    tab_reports: 'الجرد والتقارير',
    tab_audit: 'الرقابة وسجل التدقيق',
    tab_share: 'مشاركة الشبكة (Share)',
    edit_profile: 'تعديل الحساب',
    alert_banner_title: 'تنبيه: اقتراب نفاد بعض البطاقات في الخزنة!',
    btn_stock_in: '+ استلام بطاقات جديدة',
    btn_issue_card: 'صرف بطاقات',
    btn_new_card: 'فئة جديدة',
    kpi_total_cards: 'إجمالي البطاقات بالخزنة',
    kpi_card_types: 'فئات متاحة',
    kpi_face_value: 'القيمة الاسمية (Face Value)',
    kpi_face_sub: 'قيمة الرصيد الرسمية',
    kpi_today_flow: 'حركات اليوم',
    kpi_today_sub: 'وارد ومنصرف رسمي',
    in_label: 'وارد',
    out_label: 'منصرف',
    kpi_low_stock: 'بطاقات منخفضة',
    kpi_low_sub: 'تحتاج إلى تزويد',
    inventory_table_title: 'قائمة بطاقات الخزنة (Safe Inventory)',
    th_provider: 'الشركة والفئة',
    th_denomination: 'قيمة الفئة',
    th_category: 'النوع',
    th_available_stock: 'الكمية المتوفرة',
    th_min_alert: 'حد التنبيه',
    th_total_value: 'إجمالي القيمة',
    th_actions: 'إجراءات سريعة',
    trans_title: 'السجل الشامل لحركات الخزنة',
    trans_subtitle: 'تسجيل كامل لكافة الاستلامات والإصدارات مع اسم المسؤول والتاريخ',
    th_trans_type: 'نوع الحركة',
    th_card: 'البطاقة والقيمة',
    th_qty: 'الكمية',
    th_requester: 'الطالب / المورد',
    th_reason: 'السبب / الملاحظات',
    th_handler: 'المسؤول المنفذ',
    th_date: 'التاريخ والوقت',
    audit_title: 'جرد الخزنة والتقارير الدورية',
    audit_subtitle: 'فحص الرصيد الافتتاحي، الوارد، المنصرف والرصيد الختامي للجرد السنوي، الشهري أو الأسبوعي',
    btn_print: 'طباعة (Print)',
    btn_excel: 'تصدير (Excel / CSV)',
    btn_reconcile_nav: 'تسوية الخزينة يدوياً',
    quick_audit_label: 'جرد سريع:',
    audit_today: '📅 جرد اليوم (Daily)',
    audit_week: '📆 جرد الأسبوع (Weekly)',
    audit_month: '📊 جرد الشهر (Monthly)',
    audit_year: '🏛️ جرد السنة (Annual)',
    from_date: 'من:',
    to_date: 'إلى:',
    btn_show_audit: 'عرض الجرد',
    th_opening: 'الرصيد الافتتاحي (Opening)',
    th_received: 'الوارد (Received +)',
    th_issued: 'المنصرف (Issued -)',
    th_closing: 'الرصيد الختامي (Closing)',
    th_total_val: 'إجمالي القيمة (IQD)',
    reconcile_title: 'تسوية رصيد الخزنة (Reconciliation)',
    reconcile_sub: 'عند إجراء الجرد الفعلي اليدوي، يمكن تصحيح وتسوية أي فروقات رسمياً.',
    select_card: 'اختر البطاقة',
    current_system_count: 'الكمية بالنظام',
    actual_safe_count: 'الكمية الفعلية بالخزنة',
    reconcile_reason: 'سبب التسوية الرسمي',
    btn_save_reconcile: 'حفظ التسوية',
    audit_log_title: 'سجل التدقيق والأمان (Audit Trail)',
    audit_log_sub: 'كافة عمليات الدخول، الصرف، الاستلام والتسويات محفوظة بالكامل مع الهوية.',
    btn_refresh: 'تحديث',
    share_title: 'المشاركة الفورية بين الطرفين (Share Point)',
    share_desc: 'كمبيوتر زميلك لا يحتاج لتثبيت أي لغات برمجة إطلاقاً! فقط يفتح المتصفح (Chrome أو Edge).',
    share_link_label: 'رابط الفتح لجهاز زميلك:',
    btn_copy: 'نسخ الرابط',
    share_wifi_note: '* يكفي أن يكون الجهازان متصلين بنفس شبكة الـ Wi-Fi أو الراوتر.',
    acc_1_title: 'الحساب الأول (المستخدم 1)',
    acc_2_title: 'الحساب الثاني (المستخدم 2)',
    profile_modal_title: 'تعديل بيانات حسابك',
    full_name: 'الاسم الظاهر (Display Name)',
    profile_username: 'اسم المستخدم الجديد (Username)',
    current_password: 'كلمة المرور الحالية (Current Password)',
    new_password: 'كلمة المرور الجديدة (New Password - اختياري)',
    btn_cancel: 'إلغاء',
    btn_save_changes: 'حفظ التعديلات',
    modal_stock_in_title: 'استلام بطاقات جديدة للخزنة (Stock In)',
    form_qty: 'كمية البطاقات (Quantity)',
    form_cost: 'سعر الشراء للبطاقة (IQD)',
    form_supplier: 'المورد (Supplier)',
    form_date: 'تاريخ الاستلام',
    form_notes: 'ملاحظات',
    btn_record_in: 'تأكيد الاستلام',
    modal_issue_title: 'صرف بطاقات من الخزنة (Issue Scratch Card)',
    form_issue_qty: 'الكمية المنصرفة (Quantity)',
    form_issue_date: 'التاريخ والوقت (Date & Time)',
    form_requester: 'اسم المستلم داخل المنظمة (Recipient in Organization)',
    form_dept: 'القسم أو المشروع داخل المنظمة (Department / Project)',
    form_reason: 'الغرض من الاستخدام (لأي نشاط أو مهمة تم الصرف؟)',
    btn_record_out: 'تأكيد وخصم البطاقات',
    modal_new_card_title: 'إضافة فئة بطاقة جديدة',
    btn_add: 'إضافة',

    // Extra dynamic keys
    filter_all_providers: 'كافة الشركات (All)',
    filter_all_status: 'كافة الحالات (All)',
    filter_low_stock: 'الرصيد المنخفض (Low Stock)',
    filter_in_stock: 'المتوفر (In Stock)',
    filter_all_trans: 'كافة الحركات (All)',
    filter_receipts_only: 'الوارد فقط (In)',
    filter_issuances_only: 'المنصرف فقط (Out)',
    search_inventory_ph: 'بحث عن فئة بطاقة...',
    search_trans_ph: 'بحث باسم المستلم، البطاقة، السبب...',
    cards_unit: 'بطاقة',
    types_unit: 'فئات متاحة',
    mobile_label: 'موبايل',
    internet_label: 'إنترنت',
    supplier_default: 'المورد الرسمي',
    total_label: 'الإجمالي الكلي (Total):',
    available_prefix: 'المتوفر: ',
    no_cards_found: 'لم يتم العثور على أي بطاقات.',
    no_trans_found: 'لا توجد حركات مسجلة.',
    action_receipt_title: 'استلام لهذه الفئة',
    action_issue_title: 'صرف من هذه الفئة',
    action_delete_title: 'حذف هذه الفئة',
    action_delete_trans_title: 'حذف هذه الحركة',
    report_calculating_hint: 'جاري احتساب ومطابقة بيانات الجرد (الافتتاحي، الوارد، المنصرف، والختامي)...',
    expiry_banner_title: 'تنبيه: اقتراب انتهاء صلاحية بعض البطاقات في الخزنة (Expiry Alert)!',
    btn_view_expiring: 'عرض البطاقات',
    btn_dashboard_excel: 'تصدير المخزون (Excel / CSV)',
    th_expiry_date: 'تاريخ انتهاء الصلاحية',
    form_expiry_date: 'تاريخ انتهاء الصلاحية (Expiry Date)',
    modal_edit_expiry_title: 'تعديل تاريخ انتهاء الصلاحية',
    edit_expiry_hint: 'اضغط لتعديل تاريخ انتهاء الصلاحية',
    filter_expiring_soon: 'يقترب من الانتهاء (Expiring Soon)',
    filter_expired: 'منتهي الصلاحية (Expired)',
    status_expired: 'منتهي الصلاحية',
    status_expiring_soon: 'يقترب من الانتهاء',
    status_valid: 'ساري المفعول',
    days_unit: 'يوم متبقي'
  },
  en: {
    app_title: 'Safe Card Inventory System',
    app_subtitle: 'Manage and monitor mobile and internet scratch cards inside the safe in real time.',
    username: 'Username',
    password: 'Password',
    login_button: 'Sign In',
    quick_login_hint: 'Click for fast login:',
    user_1_btn: 'User 1',
    user_2_btn: 'User 2',
    tab_dashboard: 'Dashboard & Stock',
    tab_transactions: 'Transactions',
    tab_reports: 'Audit & Reports',
    tab_audit: 'Audit Trail',
    tab_share: 'Network Share',
    edit_profile: 'Account Settings',
    alert_banner_title: 'Low Stock Alert inside Safe!',
    btn_stock_in: '+ Stock In (Receive)',
    btn_issue_card: '- Issue Cards',
    btn_new_card: '+ New Card Type',
    kpi_total_cards: 'Total Cards in Safe',
    kpi_card_types: 'Active Types',
    kpi_face_value: 'Total Face Value',
    kpi_face_sub: 'Official retail value',
    kpi_today_flow: "Today's Flow",
    kpi_today_sub: 'Official in/out movements',
    in_label: 'In',
    out_label: 'Out',
    kpi_low_stock: 'Low Stock Cards',
    kpi_low_sub: 'Requires replenishment',
    inventory_table_title: 'Safe Scratch Card Inventory',
    th_provider: 'Provider & Type',
    th_denomination: 'Denomination',
    th_category: 'Category',
    th_available_stock: 'Available in Safe',
    th_min_alert: 'Min Alert',
    th_total_value: 'Total Value',
    th_actions: 'Quick Actions',
    trans_title: 'Complete Safe Transaction History',
    trans_subtitle: 'Full record of all receipts and issuances with responsible person & timestamp',
    th_trans_type: 'Type',
    th_card: 'Card & Denom',
    th_qty: 'Quantity',
    th_requester: 'Recipient / Supplier',
    th_reason: 'Purpose / Notes',
    th_handler: 'Handled By',
    th_date: 'Date & Time',
    audit_title: 'Safe Inventory Audit & Periodic Reports',
    audit_subtitle: 'Opening balance, receipts (+), issuances (-), and closing balance for Annual, Monthly or Weekly audits',
    btn_print: 'Print Report',
    btn_excel: 'Export (Excel / CSV)',
    btn_reconcile_nav: 'Physical Safe Reconciliation',
    quick_audit_label: 'Quick Audit:',
    audit_today: '📅 Daily Audit',
    audit_week: '📆 Weekly Audit',
    audit_month: '📊 Monthly Audit',
    audit_year: '🏛️ Annual Audit',
    from_date: 'From:',
    to_date: 'To:',
    btn_show_audit: 'Generate',
    th_opening: 'Opening Stock',
    th_received: 'Received (+)',
    th_issued: 'Issued (-)',
    th_closing: 'Closing Stock',
    th_total_val: 'Total Value (IQD)',
    reconcile_title: 'Safe Reconciliation',
    reconcile_sub: 'When performing physical stock audits, reconcile differences with mandatory justification.',
    select_card: 'Select Card',
    current_system_count: 'System Count',
    actual_safe_count: 'Physical Count in Safe',
    reconcile_reason: 'Official Reason',
    btn_save_reconcile: 'Save Reconciliation',
    audit_log_title: 'Security & Audit Trail',
    audit_log_sub: 'All logins, receipts, issuances, and profile changes are tracked with IP & identity.',
    btn_refresh: 'Refresh',
    share_title: 'Real-time Sharing Between Two Persons',
    share_desc: "Your friend's laptop does NOT require any programming languages installed! Just open Chrome or Edge.",
    share_link_label: "Open link on your friend's laptop:",
    btn_copy: 'Copy Link',
    share_wifi_note: '* Both devices only need to be connected to the same local Wi-Fi or router.',
    acc_1_title: 'Account 1 (User 1)',
    acc_2_title: 'Account 2 (User 2)',
    profile_modal_title: 'Account & Password Settings',
    full_name: 'Display Name',
    profile_username: 'New Username',
    current_password: 'Current Password',
    new_password: 'New Password (Optional)',
    btn_cancel: 'Cancel',
    btn_save_changes: 'Save Changes',
    modal_stock_in_title: 'Record Stock In (Safe Receipt)',
    form_qty: 'Quantity of Cards',
    form_cost: 'Unit Cost (IQD)',
    form_supplier: 'Supplier / Distributor',
    form_date: 'Date Received',
    form_notes: 'Notes',
    btn_record_in: 'Save Stock In',
    modal_issue_title: 'Issue Scratch Cards from Safe',
    form_issue_qty: 'Quantity to Issue',
    form_issue_date: 'Date & Time Issued',
    form_requester: 'Recipient Name in Organization',
    form_dept: 'Department / Project in Organization',
    form_reason: 'Purpose of Use (Activity / Reason)',
    btn_record_out: 'Confirm & Deduct',
    modal_new_card_title: 'Add New Card Type',
    btn_add: 'Add Card Type',

    // Extra dynamic keys
    filter_all_providers: 'All Providers',
    filter_all_status: 'All Status',
    filter_low_stock: 'Low Stock Only',
    filter_in_stock: 'In Stock',
    filter_all_trans: 'All Movements',
    filter_receipts_only: 'Receipts Only (In)',
    filter_issuances_only: 'Issuances Only (Out)',
    search_inventory_ph: 'Search card types...',
    search_trans_ph: 'Search by recipient, card, reason...',
    cards_unit: 'cards',
    types_unit: 'Active Types',
    mobile_label: 'Mobile',
    internet_label: 'Internet',
    supplier_default: 'Official Supplier',
    total_label: 'Grand Total:',
    available_prefix: 'Available: ',
    no_cards_found: 'No cards found matching criteria.',
    no_trans_found: 'No transactions found.',
    action_receipt_title: 'Stock In',
    action_issue_title: 'Issue Card',
    action_delete_title: 'Delete Card Type',
    action_delete_trans_title: 'Delete Transaction',
    report_calculating_hint: 'Calculating safe inventory audit (Opening, Received, Issued, Closing)...',
    expiry_banner_title: 'Notice: Some cards in safe are expiring soon or expired!',
    btn_view_expiring: 'View Cards',
    btn_dashboard_excel: 'Export Inventory (Excel / CSV)',
    th_expiry_date: 'Expiry Date',
    form_expiry_date: 'Expiry Date',
    modal_edit_expiry_title: 'Edit Card Expiry Date',
    edit_expiry_hint: 'Click to edit expiry date',
    filter_expiring_soon: 'Expiring Soon',
    filter_expired: 'Expired',
    status_expired: 'Expired',
    status_expiring_soon: 'Expiring Soon',
    status_valid: 'Valid',
    days_unit: 'days left'
  }
};


// Translation helper
function t(key, fallback = '') {
  const dict = translations[currentLang] || translations.ku;
  return dict[key] !== undefined ? dict[key] : fallback;
}

// Register PWA Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(console.error);
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  applyLanguage(currentLang);

  const today = new Date().toISOString().split('T')[0];
  ['receipt-date', 'issuance-date', 'report-start-date', 'report-end-date'].forEach(id => {
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

  const savedUser = localStorage.getItem('safe_inventory_user');
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
  localStorage.setItem('safe_inventory_lang', lang);
  applyLanguage(lang);
}

function applyLanguage(lang) {
  currentLang = lang;
  const isRtl = lang === 'ku' || lang === 'ar';
  document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;

  const loginSel = document.getElementById('login-lang-select');
  const appSel = document.getElementById('app-lang-select');
  if (loginSel) loginSel.value = lang;
  if (appSel) appSel.value = lang;

  const dict = translations[lang] || translations.ku;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) el.textContent = dict[key];
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key] !== undefined) el.setAttribute('placeholder', dict[key]);
  });

  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (dict[key] !== undefined) el.setAttribute('title', dict[key]);
  });

  renderInventoryTable();
  populateCardSelects();
  if (currentReportData.length > 0) renderReportTableUI();
  refreshIcons();
}

// Authentication
async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const errorBox = document.getElementById('login-error');
  const errorText = document.getElementById('login-error-text');

  errorBox.classList.add('hidden');

  try {
    const { data: user, error } = await db
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (error || !user) {
      throw new Error(currentLang === 'ar' ? 'اسم المستخدم أو كلمة المرور غير صحيحة.' : 'ناڤێ بکارئینەری یان تێپەڕەوشە یا شاشە.');
    }

    currentUser = {
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      role: user.role
    };

    localStorage.setItem('safe_inventory_user', JSON.stringify(currentUser));
    logAudit('LOGIN', `بکارئینەر [${user.username}] چووە ژوورێ.`);

    showAppView();
    showToast(`Welcome ${currentUser.fullName}!`, 'success');
  } catch (err) {
    errorBox.classList.remove('hidden');
    errorText.textContent = err.message;
  }
}

function fillCredentials(user, pass) {
  document.getElementById('username').value = user;
  document.getElementById('password').value = pass;
  document.getElementById('login-btn').focus();
}

function logout() {
  if (realtimeChannel) {
    db.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }
  currentUser = null;
  localStorage.removeItem('safe_inventory_user');
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

  setupRealtime();
  loadDashboardData();
  applyLanguage(currentLang);
  refreshIcons();
}

// User Profile
function populateProfileModal() {
  if (!currentUser) return;
  document.getElementById('profile-full-name').value = currentUser.fullName || '';
  document.getElementById('profile-username').value = currentUser.username || '';
  document.getElementById('profile-old-pass').value = '';
  document.getElementById('profile-new-pass').value = '';
}

async function handleUpdateProfile(e) {
  e.preventDefault();
  const fullName = document.getElementById('profile-full-name').value.trim();
  const newUsername = document.getElementById('profile-username').value.trim();
  const oldPassword = document.getElementById('profile-old-pass').value;
  const newPassword = document.getElementById('profile-new-pass').value;

  try {
    const { data: user } = await db.from('users').select('*').eq('id', currentUser.id).single();
    if (user.password !== oldPassword) {
      throw new Error('وشەیا نهێنی یا کەڤن نەیا دروستە.');
    }

    const updates = { full_name: fullName, username: newUsername };
    if (newPassword && newPassword.trim()) {
      updates.password = newPassword.trim();
    }

    const { error } = await db.from('users').update(updates).eq('id', currentUser.id);
    if (error) throw error;

    currentUser.fullName = fullName;
    currentUser.username = newUsername;
    localStorage.setItem('safe_inventory_user', JSON.stringify(currentUser));

    document.getElementById('user-display-name').textContent = currentUser.fullName;
    document.getElementById('user-avatar').textContent = currentUser.fullName.charAt(0);

    closeModal('profile-modal');
    showToast('پێزانینێن ئەکاونتێ تە هاتنە گۆهۆڕین.', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Real-Time Sync via Supabase
function setupRealtime() {
  if (realtimeChannel) db.removeChannel(realtimeChannel);

  realtimeChannel = db.channel('schema-db-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'card_types' }, () => {
      loadDashboardData();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'receipts' }, () => {
      loadDashboardData();
      const activeTab = document.querySelector('.tab-btn.active')?.id;
      if (activeTab === 'tab-btn-transactions') loadTransactions();
      else if (activeTab === 'tab-btn-reports') generateReport();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'issuances' }, () => {
      loadDashboardData();
      const activeTab = document.querySelector('.tab-btn.active')?.id;
      if (activeTab === 'tab-btn-transactions') loadTransactions();
      else if (activeTab === 'tab-btn-reports') generateReport();
    })
    .subscribe();
}

// Load Dashboard Data
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
        total_asset_value: c.current_stock * c.unit_cost,
        days_to_expiry: daysToExpiry,
        expiry_status: expiryStatus
      };
    });

    // Today's flows
    const { data: todayReceipts } = await db.from('receipts').select('quantity, total_value').eq('date_received', today);
    const { data: todayIssuances } = await db.from('issuances').select('quantity').eq('date_issued', today);

    const todayInQty = (todayReceipts || []).reduce((sum, r) => sum + r.quantity, 0);
    const todayOutQty = (todayIssuances || []).reduce((sum, i) => sum + i.quantity, 0);

    let totalCards = 0;
    let totalFaceValue = 0;
    let lowStockCount = 0;
    const lowStockItems = [];
    let expiringSoonCount = 0;
    let expiredCount = 0;
    const expiringItems = [];

    for (const c of cardTypes) {
      totalCards += c.current_stock;
      totalFaceValue += c.total_face_value;
      if (c.is_low_stock) {
        lowStockCount++;
        lowStockItems.push({
          id: c.id,
          name: `${c.provider} ${c.denomination.toLocaleString()} ${c.currency}`,
          currentStock: c.current_stock,
          minAlert: c.min_stock_alert
        });
      }
      if (c.current_stock > 0 && c.expiry_date) {
        if (c.expiry_status === 'EXPIRED') {
          expiredCount++;
          expiringItems.push({
            id: c.id,
            name: `${c.provider} ${c.denomination.toLocaleString()} ${c.currency}`,
            currentStock: c.current_stock,
            daysLeft: c.days_to_expiry,
            status: 'EXPIRED'
          });
        } else if (c.expiry_status === 'EXPIRING_SOON') {
          expiringSoonCount++;
          expiringItems.push({
            id: c.id,
            name: `${c.provider} ${c.denomination.toLocaleString()} ${c.currency}`,
            currentStock: c.current_stock,
            daysLeft: c.days_to_expiry,
            status: 'EXPIRING_SOON'
          });
        }
      }
    }

    const stats = {
      totalCards,
      totalFaceValue,
      lowStockCount,
      lowStockItems,
      expiringSoonCount,
      expiredCount,
      expiringItems,
      todayInQty,
      todayOutQty,
      activeTypesCount: cardTypes.length
    };

    updateStatsUI(stats);
    renderInventoryTable();
    populateCardSelects();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function updateStatsUI(stats) {
  if (!stats) return;

  document.getElementById('stat-total-cards').textContent = (stats.totalCards || 0).toLocaleString();
  document.getElementById('stat-active-types').textContent = stats.activeTypesCount || 0;
  document.getElementById('stat-face-value').textContent = (stats.totalFaceValue || 0).toLocaleString() + ' IQD';
  document.getElementById('stat-today-in').textContent = (stats.todayInQty || 0).toLocaleString();
  document.getElementById('stat-today-out').textContent = (stats.todayOutQty || 0).toLocaleString();
  document.getElementById('stat-low-stock').textContent = stats.lowStockCount || 0;

  const banner = document.getElementById('low-stock-banner');
  const bannerText = document.getElementById('low-stock-banner-text');
  if (banner && bannerText) {
    if (stats.lowStockCount > 0) {
      banner.classList.remove('hidden');
      const itemNames = (stats.lowStockItems || []).map(i => `${i.name} (${t('available_prefix')}${i.currentStock} ${t('cards_unit')})`).join('، ');
      bannerText.textContent = itemNames;
    } else {
      banner.classList.add('hidden');
    }
  }

  const expiryBanner = document.getElementById('expiry-alert-banner');
  const expiryBannerText = document.getElementById('expiry-banner-text');
  if (expiryBanner && expiryBannerText) {
    const totalExpiring = (stats.expiringSoonCount || 0) + (stats.expiredCount || 0);
    if (totalExpiring > 0) {
      expiryBanner.classList.remove('hidden');
      const itemsList = (stats.expiringItems || []).map(i => {
        const daysText = i.status === 'EXPIRED' ? `[${t('status_expired')}]` : `[${i.daysLeft} ${t('days_unit')}]`;
        return `${i.name} (${i.currentStock} ${t('cards_unit')}) ${daysText}`;
      }).join('، ');
      expiryBannerText.textContent = itemsList;
    } else {
      expiryBanner.classList.add('hidden');
    }
  }
}

function filterByExpiry() {
  const filterSelect = document.getElementById('filter-stock-status');
  if (filterSelect) {
    filterSelect.value = 'expiring';
    renderInventoryTable();
  }
  const tableTitle = document.querySelector('[data-i18n="inventory_table_title"]');
  if (tableTitle) tableTitle.scrollIntoView({ behavior: 'smooth' });
}

// Render Table
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
                          (statusFilter === 'available' && c.current_stock > 0) ||
                          (statusFilter === 'expiring' && (c.expiry_status === 'EXPIRING_SOON' || c.expiry_status === 'EXPIRED')) ||
                          (statusFilter === 'expired' && c.expiry_status === 'EXPIRED');
    return matchesSearch && matchesProvider && matchesStatus;
  });

  const counterEl = document.getElementById('table-total-count');
  if (counterEl) counterEl.textContent = filtered.length;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-8 text-slate-400">
          <i data-lucide="inbox" class="w-8 h-8 mx-auto mb-2 text-slate-300"></i>
          ${t('no_cards_found')}
        </td>
      </tr>
    `;
    refreshIcons();
    return;
  }

  tbody.innerHTML = filtered.map(card => {
    const stockClass = card.is_low_stock 
      ? 'bg-amber-100 text-amber-800 border border-amber-200' 
      : 'bg-emerald-50 text-emerald-700 border border-emerald-200';

    let expiryBadge = '<span class="text-slate-400">-</span>';
    if (card.expiry_date) {
      if (card.expiry_status === 'EXPIRED') {
        expiryBadge = `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">⚠️ ${card.expiry_date} (${t('status_expired')})</span>`;
      } else if (card.expiry_status === 'EXPIRING_SOON') {
        expiryBadge = `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">⏰ ${card.expiry_date} (${card.days_to_expiry} ${t('days_unit')})</span>`;
      } else {
        expiryBadge = `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">${card.expiry_date}</span>`;
      }
    }

    return `
      <tr class="hover:bg-slate-50/70 transition">
        <td class="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full ${card.category === 'Mobile' ? 'bg-blue-500' : 'bg-purple-500'}"></span>
          ${card.provider}
        </td>
        <td class="py-3 px-4 font-bold text-blue-600">${card.denomination.toLocaleString()} IQD</td>
        <td class="py-3 px-4 text-slate-500">${card.category === 'Mobile' ? t('mobile_label') : t('internet_label')}</td>
        <td class="py-3 px-4 text-center">
          <span class="inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${stockClass}">
            ${card.current_stock.toLocaleString()}
          </span>
        </td>
        <td class="py-3 px-4 text-center text-slate-400">${card.min_stock_alert}</td>
        <td class="py-3 px-4 text-center cursor-pointer hover:underline" onclick="openEditExpiryModal(${card.id}, '${card.provider} ${card.denomination.toLocaleString()}', '${card.expiry_date || ''}')" title="${t('edit_expiry_hint')}">
          ${expiryBadge}
        </td>
        <td class="py-3 px-4 font-bold text-slate-800">${card.total_face_value.toLocaleString()} IQD</td>
        <td class="py-3 px-4 text-center">
          <div class="inline-flex items-center gap-1">
            <button onclick="quickStockIn(${card.id})" title="${t('action_receipt_title')}" class="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition">
              <i data-lucide="plus" class="w-4 h-4"></i>
            </button>
            <button onclick="quickIssue(${card.id})" title="${t('action_issue_title')}" class="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
              <i data-lucide="send" class="w-4 h-4"></i>
            </button>
            <button onclick="confirmDeleteCardType(${card.id}, '${card.provider} ${card.denomination.toLocaleString()}')" title="${t('action_delete_title')}" class="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  refreshIcons();
}

function populateCardSelects() {
  const selects = ['receipt-card-id', 'issuance-card-id', 'reconcile-card-id'];
  selects.forEach(selId => {
    const el = document.getElementById(selId);
    if (!el) return;
    const curVal = el.value;
    el.innerHTML = cardTypes.map(c => `
      <option value="${c.id}">${c.provider} - ${c.denomination.toLocaleString()} IQD (${t('available_prefix')}${c.current_stock})</option>
    `).join('');
    if (curVal) el.value = curVal;
  });
  updateIssuanceAvailableStock();
  updateReconcileCurrentStock();
}

function updateIssuanceAvailableStock() {
  const sel = document.getElementById('issuance-card-id');
  const span = document.getElementById('issuance-available-stock');
  if (!sel || !span) return;
  const card = cardTypes.find(c => c.id == sel.value);
  span.textContent = card ? `${t('available_prefix')}${card.current_stock} ${t('cards_unit')}` : '';
}

function updateReconcileCurrentStock() {
  const sel = document.getElementById('reconcile-card-id');
  const inp = document.getElementById('reconcile-current');
  if (!sel || !inp) return;
  const card = cardTypes.find(c => c.id == sel.value);
  inp.value = card ? card.current_stock : 0;
}

// Stock In (Receipt)
async function handleStockReceipt(e) {
  e.preventDefault();
  const cardTypeId = parseInt(document.getElementById('receipt-card-id').value, 10);
  const quantity = parseInt(document.getElementById('receipt-quantity').value, 10);
  const unitCost = parseFloat(document.getElementById('receipt-unit-cost').value) || 0;
  const supplier = document.getElementById('receipt-supplier').value.trim();
  const dateReceived = document.getElementById('receipt-date').value;
  const expiryDate = document.getElementById('receipt-expiry-date').value;
  const notes = document.getElementById('receipt-notes').value.trim();

  try {
    const card = cardTypes.find(c => c.id === cardTypeId);
    const totalVal = quantity * unitCost;

    // 1. Insert receipt
    await db.from('receipts').insert({
      card_type_id: cardTypeId,
      quantity,
      unit_cost: unitCost,
      total_value: totalVal,
      supplier,
      date_received: dateReceived,
      expiry_date: expiryDate || null,
      received_by: currentUser.fullName,
      notes
    });

    // 2. Update stock & expiry
    const updates = { current_stock: card.current_stock + quantity, unit_cost: unitCost };
    if (expiryDate) updates.expiry_date = expiryDate;

    await db.from('card_types').update(updates).eq('id', cardTypeId);

    logAudit('STOCK_RECEIPT', `وەرگرتنا ${quantity} کارتان ژ جۆرێ [${card.provider} ${card.denomination.toLocaleString()}] ژ لایێ ${currentUser.fullName}.`);

    closeModal('receipt-modal');
    showToast(`+${quantity} کارت ب سەرکەفتی هاتنە وەرگرتن.`, 'success');
    loadDashboardData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Stock Out (Issuance)
async function handleStockIssuance(e) {
  e.preventDefault();
  const cardTypeId = parseInt(document.getElementById('issuance-card-id').value, 10);
  const quantity = parseInt(document.getElementById('issuance-quantity').value, 10);
  const requesterName = document.getElementById('issuance-requester').value.trim();
  const department = document.getElementById('issuance-dept').value.trim();
  const reason = document.getElementById('issuance-reason').value.trim();
  const dateIssued = document.getElementById('issuance-date').value;
  const notes = document.getElementById('issuance-notes').value.trim();

  try {
    const card = cardTypes.find(c => c.id === cardTypeId);
    if (card.current_stock < quantity) {
      throw new Error(`بڕێ بەردەست بەس نینە! بەردەست: ${card.current_stock}`);
    }

    // 1. Insert issuance
    await db.from('issuances').insert({
      card_type_id: cardTypeId,
      quantity,
      requester_name: requesterName,
      department,
      reason,
      date_issued: dateIssued,
      issued_by: currentUser.fullName,
      notes
    });

    // 2. Deduct stock
    await db.from('card_types').update({
      current_stock: card.current_stock - quantity
    }).eq('id', cardTypeId);

    logAudit('STOCK_ISSUANCE', `دەرخستنا ${quantity} کارتان بۆ [${requesterName}] ژ لایێ ${currentUser.fullName}.`);

    closeModal('issuance-modal');
    showToast(`-${quantity} کارت هاتنە دەرخستن بۆ ${requesterName}.`, 'success');
    loadDashboardData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Add New Card Type
async function handleAddNewCardType(e) {
  e.preventDefault();
  const provider = document.getElementById('new-card-provider').value.trim();
  const denomination = parseInt(document.getElementById('new-card-denom').value, 10);
  const category = document.getElementById('new-card-category').value;
  const minStockAlert = parseInt(document.getElementById('new-card-alert').value, 10) || 10;
  const unitCost = parseFloat(document.getElementById('new-card-cost').value) || 0;
  const expiryDate = document.getElementById('new-card-expiry-date').value || null;

  try {
    const { error } = await db.from('card_types').insert({
      provider,
      denomination,
      category,
      min_stock_alert: minStockAlert,
      current_stock: 0,
      unit_cost: unitCost,
      expiry_date: expiryDate
    });
    if (error) throw error;

    logAudit('CARD_TYPE_ADDED', `جۆرەکێ نوێ زێدە کر [${provider} ${denomination.toLocaleString()}].`);
    closeModal('new-card-modal');
    showToast('جۆرێ نوێ ب سەرکەفتی هاتە زێدەکرن.', 'success');
    loadDashboardData();
  } catch (err) {
    showToast(err.message, 'error');
  }
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

    logAudit('STOCK_ADJUSTMENT', `راستڤەکرنا عەمبارێ بۆ [${card.provider} ${card.denomination.toLocaleString()}]: ${actualStock}. هوکار: ${reason}.`);

    showToast('راستڤەکرن ب سەرکەفتی هاتە تۆمارکرن.', 'success');
    loadDashboardData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Edit Expiry Date
function openEditExpiryModal(id, name, date) {
  document.getElementById('edit-expiry-card-id').value = id;
  document.getElementById('edit-expiry-card-name').textContent = name;
  document.getElementById('edit-expiry-input').value = date || '';
  openModal('edit-expiry-modal');
}

async function handleSaveCardExpiry(e) {
  e.preventDefault();
  const cardId = parseInt(document.getElementById('edit-expiry-card-id').value, 10);
  const expiryDate = document.getElementById('edit-expiry-input').value;

  try {
    await db.from('card_types').update({ expiry_date: expiryDate }).eq('id', cardId);
    closeModal('edit-expiry-modal');
    showToast('مێژوویا ب سەرڤەچوونێ هاتە نوێکرن.', 'success');
    loadDashboardData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Delete Card Type
async function confirmDeleteCardType(id, name) {
  if (!confirm(`ئەرێ تو پشتڕاستی دڤێت جۆرێ [${name}] ژێ ببەی؟`)) return;

  try {
    await db.from('card_types').update({ is_active: false, current_stock: 0 }).eq('id', id);
    logAudit('CARD_TYPE_DELETED', `جۆرێ کارتی [${name}] هاتە ژێبرن.`);
    showToast('جۆرێ کارتی هاتە ژێبرن.', 'success');
    loadDashboardData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Quick Actions
function quickStockIn(id) {
  openModal('receipt-modal');
  const sel = document.getElementById('receipt-card-id');
  if (sel) sel.value = id;
}

function quickIssue(id) {
  openModal('issuance-modal');
  const sel = document.getElementById('issuance-card-id');
  if (sel) {
    sel.value = id;
    updateIssuanceAvailableStock();
  }
}

// Transactions Tab
async function loadTransactions() {
  const tbody = document.getElementById('transactions-tbody');
  if (!tbody) return;

  const search = (document.getElementById('trans-search')?.value || '').toLowerCase();
  const typeFilter = document.getElementById('trans-filter-type')?.value || 'all';

  try {
    const [recRes, issRes] = await Promise.all([
      db.from('receipts').select('*, card_types(provider, denomination)').order('created_at', { ascending: false }),
      db.from('issuances').select('*, card_types(provider, denomination)').order('created_at', { ascending: false })
    ]);

    let list = [];
    if (typeFilter !== 'issuance' && recRes.data) {
      recRes.data.forEach(r => list.push({
        id: r.id,
        type: 'RECEIPT',
        card: `${r.card_types?.provider} ${r.card_types?.denomination?.toLocaleString()}`,
        qty: r.quantity,
        party: r.supplier || '-',
        reason: r.notes || '-',
        handler: r.received_by,
        date: r.date_received
      }));
    }

    if (typeFilter !== 'receipt' && issRes.data) {
      issRes.data.forEach(i => list.push({
        id: i.id,
        type: 'ISSUANCE',
        card: `${i.card_types?.provider} ${i.card_types?.denomination?.toLocaleString()}`,
        qty: i.quantity,
        party: `${i.requester_name} (${i.department || ''})`,
        reason: i.reason,
        handler: i.issued_by,
        date: i.date_issued
      }));
    }

    list = list.filter(item => 
      item.card.toLowerCase().includes(search) ||
      item.party.toLowerCase().includes(search) ||
      item.reason.toLowerCase().includes(search)
    );

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-slate-400">${t('no_trans_found')}</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(item => `
      <tr class="hover:bg-slate-50/70 transition">
        <td class="py-3 px-4">
          <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${item.type === 'RECEIPT' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
            ${item.type === 'RECEIPT' ? t('in_label') : t('out_label')}
          </span>
        </td>
        <td class="py-3 px-4 font-bold text-slate-900">${item.card}</td>
        <td class="py-3 px-4 text-center font-bold">${item.qty}</td>
        <td class="py-3 px-4 text-slate-700">${item.party}</td>
        <td class="py-3 px-4 text-slate-500">${item.reason}</td>
        <td class="py-3 px-4 text-slate-600">${item.handler}</td>
        <td class="py-3 px-4 text-slate-400 font-mono text-[11px]">${item.date}</td>
        <td class="py-3 px-4 text-center">
          <button onclick="deleteTransaction('${item.type}', ${item.id})" class="p-1 text-slate-400 hover:text-rose-600 transition" title="${t('action_delete_trans_title')}">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </td>
      </tr>
    `).join('');

    refreshIcons();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteTransaction(type, id) {
  if (!confirm('ئەرێ تو پشتڕاستی دڤێت ڤێ تۆمارێ ژێ ببەی؟')) return;

  try {
    const table = type === 'RECEIPT' ? 'receipts' : 'issuances';
    await db.from(table).delete().eq('id', id);
    showToast('تۆمار هاتە ژێبرن.', 'success');
    loadTransactions();
    loadDashboardData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Reports & Audit Generation
async function generateReport(showLoader = false) {
  const start = document.getElementById('report-start-date')?.value || '2000-01-01';
  const end = document.getElementById('report-end-date')?.value || '2099-12-31';
  const loader = document.getElementById('report-loading-container');
  const bar = document.getElementById('report-progress-bar');
  const percent = document.getElementById('report-loading-percent');

  if (showLoader && loader) {
    loader.classList.remove('hidden');
    bar.style.width = '30%';
    percent.textContent = '30%';
  }

  try {
    const [recRes, issRes] = await Promise.all([
      db.from('receipts').select('*').gte('date_received', start).lte('date_received', end),
      db.from('issuances').select('*').gte('date_issued', start).lte('date_issued', end)
    ]);

    if (showLoader && bar) {
      bar.style.width = '70%';
      percent.textContent = '70%';
    }

    currentReportData = cardTypes.map(c => {
      const cardRecs = (recRes.data || []).filter(r => r.card_type_id === c.id);
      const cardIsss = (issRes.data || []).filter(i => i.card_type_id === c.id);

      const received = cardRecs.reduce((s, r) => s + r.quantity, 0);
      const issued = cardIsss.reduce((s, i) => s + i.quantity, 0);
      const closing = c.current_stock;
      const opening = Math.max(0, closing + issued - received);

      return {
        cardName: `${c.provider} ${c.denomination.toLocaleString()}`,
        denom: c.denomination,
        opening,
        received,
        issued,
        closing,
        totalVal: closing * c.denomination
      };
    });

    renderReportTableUI();

    if (showLoader && loader) {
      bar.style.width = '100%';
      percent.textContent = '100%';
      setTimeout(() => loader.classList.add('hidden'), 400);
    }
  } catch (err) {
    showToast(err.message, 'error');
    if (loader) loader.classList.add('hidden');
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
        <td class="py-3 px-4 font-bold text-slate-800">${r.cardName}</td>
        <td class="py-3 px-4 text-slate-500">${r.denom.toLocaleString()} IQD</td>
        <td class="py-3 px-4 text-center font-bold text-slate-700">${r.opening}</td>
        <td class="py-3 px-4 text-center font-bold text-emerald-600">+${r.received}</td>
        <td class="py-3 px-4 text-center font-bold text-rose-600">-${r.issued}</td>
        <td class="py-3 px-4 text-center font-bold text-blue-700 bg-blue-50/50">${r.closing}</td>
        <td class="py-3 px-4 text-left font-bold text-slate-900">${r.totalVal.toLocaleString()} IQD</td>
      </tr>
    `;
  }).join('');

  if (tfoot) {
    tfoot.innerHTML = `
      <tr>
        <td colspan="2" class="py-3 px-4 text-slate-900 font-bold">${t('total_label')}</td>
        <td class="py-3 px-4 text-center font-bold text-slate-800">${totalOpen}</td>
        <td class="py-3 px-4 text-center font-bold text-emerald-700">+${totalRec}</td>
        <td class="py-3 px-4 text-center font-bold text-rose-700">-${totalIss}</td>
        <td class="py-3 px-4 text-center font-bold text-blue-900 bg-blue-100/70">${totalClose}</td>
        <td class="py-3 px-4 text-left font-bold text-slate-900">${grandVal.toLocaleString()} IQD</td>
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

// Excel Export
function exportDashboardToExcel() {
  const rows = [
    ['Company / Provider', 'Denomination (IQD)', 'Category', 'Available Stock', 'Min Alert', 'Expiry Date', 'Total Value (IQD)']
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
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
    XLSX.writeFile(wb, `safe_inventory_${new Date().toISOString().split('T')[0]}.xlsx`);
  } else {
    // CSV fallback
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'safe_inventory.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

function exportReportToCSV() {
  if (currentReportData.length === 0) return;
  const rows = [
    ['Card Type', 'Denomination', 'Opening', 'Received (+)', 'Issued (-)', 'Closing', 'Total Value (IQD)']
  ];

  currentReportData.forEach(r => {
    rows.push([r.cardName, r.denom, r.opening, r.received, r.issued, r.closing, r.totalVal]);
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
  const link = document.createElement('a');
  link.setAttribute('href', encodeURI(csvContent));
  link.setAttribute('download', `audit_report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Audit Logs
async function loadAuditLogs() {
  const container = document.getElementById('audit-logs-container');
  if (!container) return;

  try {
    const { data: logs } = await db.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50);

    container.innerHTML = (logs || []).map(l => `
      <div class="p-3 text-xs flex items-start justify-between">
        <div>
          <span class="font-bold text-slate-800">${l.action}</span>: 
          <span class="text-slate-600">${l.description}</span>
        </div>
        <span class="text-[10px] text-slate-400 font-mono">${new Date(l.created_at).toLocaleTimeString()}</span>
      </div>
    `).join('');
  } catch (err) {
    console.error(err);
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

// UI Tabs & Modals
function switchTab(tabId) {
  document.querySelectorAll('section[id^="tab-content-"]').forEach(s => s.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.remove('active', 'border-blue-600', 'text-blue-600');
    b.classList.add('border-transparent', 'text-slate-600');
  });

  const targetSection = document.getElementById(`tab-content-${tabId}`);
  const targetBtn = document.getElementById(`tab-btn-${tabId}`);

  if (targetSection) targetSection.classList.remove('hidden');
  if (targetBtn) {
    targetBtn.classList.add('active', 'border-blue-600', 'text-blue-600');
    targetBtn.classList.remove('border-transparent', 'text-slate-600');
  }

  if (tabId === 'transactions') loadTransactions();
  else if (tabId === 'reports') generateReport();
  else if (tabId === 'audit') loadAuditLogs();

  refreshIcons();
}

function openModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) {
    m.classList.remove('hidden');
    if (modalId === 'profile-modal') populateProfileModal();
    refreshIcons();
  }
}

function closeModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.add('hidden');
}

function autoCalculateReceiptExpiry() {
  const recDate = document.getElementById('receipt-date')?.value;
  const expDateEl = document.getElementById('receipt-expiry-date');
  if (recDate && expDateEl && !expDateEl.value) {
    const d = new Date(recDate);
    d.setFullYear(d.getFullYear() + 1);
    expDateEl.value = d.toISOString().split('T')[0];
  }
}

function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bg = type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-rose-600' : 'bg-slate-900';
  toast.className = `${bg} text-white px-4 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 transform transition-all duration-300 pointer-events-auto`;
  toast.innerHTML = `<span>${msg}</span>`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
