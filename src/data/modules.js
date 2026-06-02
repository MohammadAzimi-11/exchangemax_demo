import {
  Activity,
  Archive,
  Bell,
  BookOpen,
  Building2,
  Calculator,
  ClipboardList,
  Coins,
  ContactRound,
  DatabaseBackup,
  FileBarChart,
  Gauge,
  LockKeyhole,
  Scale,
  Settings,
  ShieldCheck,
  UsersRound,
} from 'lucide-react'

export const languages = [
  { key: 'en', shortLabel: 'EN', label: { en: 'English', fa: 'انگلیسی' } },
  { key: 'fa', shortLabel: 'فا', label: { en: 'Persian', fa: 'فارسی' } },
]

export const themes = [
  { key: 'light', label: { en: 'Light', fa: 'روشن' } },
  { key: 'dusk', label: { en: 'Dusk', fa: 'میانه' } },
  { key: 'dark', label: { en: 'Dark', fa: 'تاریک' } },
]

export const modules = [
  {
    key: 'dashboard',
    title: { en: 'Dashboard', fa: 'داشبورد' },
    path: '/',
    route: '/dashboard',
    groupKey: 'overview',
    icon: Gauge,
    status: { en: 'Ready', fa: 'آماده' },
    accent: 'blue',
    metric: { en: 'Overview', fa: 'نمای کلی' },
    description: {
      en: 'Single operational surface for the offline exchange office.',
      fa: 'نمای اصلی برای مدیریت صرافی آفلاین و دسکتاپ.',
    },
  },
  {
    key: 'identity',
    title: { en: 'Users & Roles', fa: 'کاربران و نقش‌ها' },
    path: '/identity',
    route: '/api/identity',
    groupKey: 'setup',
    icon: ShieldCheck,
    status: { en: 'Ready', fa: 'آماده' },
    accent: 'gold',
    metric: { en: 'Access', fa: 'دسترسی' },
    description: {
      en: 'Staff users, roles, permissions, sessions, and currency restrictions.',
      fa: 'کاربران کارمند، نقش‌ها، صلاحیت‌ها، نشست‌ها و محدودیت ارزها.',
    },
  },
  {
    key: 'customers',
    title: { en: 'Customers', fa: 'مشتریان' },
    path: '/customers',
    route: '/api/customers',
    groupKey: 'setup',
    icon: UsersRound,
    status: { en: 'Ready', fa: 'آماده' },
    accent: 'teal',
    metric: { en: 'KYC', fa: 'احراز هویت' },
    description: {
      en: 'Individual, corporate, VIP, agent, and institutional profiles.',
      fa: 'پروفایل اشخاص، شرکت‌ها، مشتریان VIP، نمایندگان و نهادها.',
    },
  },
  {
    key: 'ledger',
    title: { en: 'Ledger', fa: 'ژورنال و دفترکل' },
    path: '/ledger',
    route: '/api/ledger',
    groupKey: 'accounting',
    icon: BookOpen,
    status: { en: 'Ready', fa: 'آماده' },
    accent: 'blue',
    metric: { en: 'Journal', fa: 'ژورنال' },
    description: {
      en: 'Immutable journal rows, account statements, and cash statements.',
      fa: 'سطرهای ژورنال غیرقابل تغییر، صورت‌حساب و گزارش صندوق.',
    },
  },
  {
    key: 'reports',
    title: { en: 'Reports', fa: 'گزارش‌ها' },
    path: '/reports',
    route: '/api/reports',
    groupKey: 'accounting',
    icon: FileBarChart,
    status: { en: 'Ready', fa: 'آماده' },
    accent: 'green',
    metric: { en: 'Exports', fa: 'خروجی‌ها' },
    description: {
      en: 'Placeholder for future reporting tools.',
      fa: 'گزارش‌های مالی، عملیاتی، حواله و کنترول قانونی.',
    },
  },
  {
    key: 'notifications',
    title: { en: 'Notifications', fa: 'اطلاعیه‌ها' },
    path: '/notifications',
    route: '/api/notifications',
    groupKey: 'administration',
    icon: Bell,
    status: { en: 'Ready', fa: 'آماده' },
    accent: 'gold',
    metric: { en: 'Inbox', fa: 'صندوق پیام' },
    description: {
      en: 'Staff alerts, backup reminders, and login events.',
      fa: 'هشدارهای کارمندان برای تایید، احراز هویت، نسخه پشتیبان، حواله و ورود.',
    },
  },
  {
    key: 'audit',
    title: { en: 'Audit Log', fa: 'گزارش تغییرات' },
    path: '/audit',
    route: '/api/audit',
    groupKey: 'administration',
    icon: LockKeyhole,
    status: { en: 'Ready', fa: 'آماده' },
    accent: 'red',
    metric: { en: 'Immutable', fa: 'غیرقابل تغییر' },
    description: {
      en: 'Read-only action trail with before and after snapshots.',
      fa: 'ردیابی فقط‌خواندنی با وضعیت قبل و بعد هر عمل.',
    },
  },
  {
    key: 'backup',
    title: { en: 'Backup', fa: 'نسخه پشتیبان' },
    path: '/backup',
    route: '/api/backup',
    groupKey: 'administration',
    icon: DatabaseBackup,
    status: { en: 'Ready', fa: 'آماده' },
    accent: 'teal',
    metric: { en: 'AES-256', fa: 'رمزنگاری' },
    description: {
      en: 'Encrypted local backups, history, checksum, and health alerts.',
      fa: 'نسخه پشتیبان محلی و رمزنگاری‌شده، تاریخچه، چک‌سم و هشدار سلامت.',
    },
  },
  {
    key: 'settings',
    title: { en: 'Settings', fa: 'تنظیمات' },
    path: '/settings',
    route: '/api/settings',
    groupKey: 'administration',
    icon: Settings,
    status: { en: 'Ready', fa: 'آماده' },
    accent: 'blue',
    metric: { en: 'Policy', fa: 'سیاست ها' },
    description: {
      en: 'Company profile, system, fee, printer, backup, and notification settings.',
      fa: 'تنظیمات شرکت، سیستم، فیس، چاپگر، نسخه پشتیبان و اطلاعیه‌ها.',
    },
  },
]

export const navigationGroups = [
  {
    key: 'overview',
    label: { en: 'Overview', fa: 'نمای کلی' },
    icon: Gauge,
    accent: 'blue',
    description: {
      en: 'Daily command center and system readiness.',
      fa: 'مرکز کاری روزانه و وضعیت آماده‌گی سیستم.',
    },
  },
  {
    key: 'setup',
    label: { en: 'Setup', fa: 'آماده‌سازی' },
    icon: Building2,
    accent: 'green',
    description: {
      en: 'Identity, roles, customers, KYC, and master profile setup.',
      fa: 'تنظیم کاربران، نقش‌ها، مشتریان، KYC و اطلاعات پایه.',
    },
  },
  {
    key: 'accounting',
    label: { en: 'Accounting', fa: 'حسابداری' },
    icon: BookOpen,
    accent: 'teal',
    description: {
      en: 'Journal, ledger, statements, and professional reports.',
      fa: 'ژورنال، دفترکل، صورت‌حساب و گزارش‌های تخصصی.',
    },
  },
  {
    key: 'administration',
    label: { en: 'Administration', fa: 'مدیریت سیستم' },
    icon: Settings,
    accent: 'red',
    description: {
      en: 'Settings, company profile, audit, backup, and staff notifications.',
      fa: 'تنظیمات، اطلاعات شرکت، گزارش تغییرات، نسخه پشتیبان و اطلاعیه‌ها.',
    },
  },
]

export const settingsSections = [
  {
    key: 'company',
    title: { en: 'Company Profile', fa: 'اطلاعات شرکت' },
    route: '/api/company',
    icon: Building2,
    description: {
      en: 'General office identity used on receipts, reports, and system headers.',
      fa: 'مشخصات عمومی دفتر برای رسیدها، گزارش‌ها و عنوان‌های سیستم.',
    },
  },
]

export const companyFields = [
  { key: 'companyName', label: { en: 'Company name', fa: 'نام شرکت' }, type: 'text' },
  { key: 'legalName', label: { en: 'Legal name', fa: 'نام رسمی' }, type: 'text' },
  { key: 'registrationNumber', label: { en: 'Registration number', fa: 'شماره ثبت' }, type: 'text' },
  { key: 'taxId', label: { en: 'Tax ID', fa: 'شناسه مالیاتی' }, type: 'text' },
  { key: 'phone', label: { en: 'Phone', fa: 'شماره تماس' }, type: 'tel' },
  { key: 'email', label: { en: 'Email', fa: 'ایمیل' }, type: 'email' },
  { key: 'defaultCurrency', label: { en: 'Default currency', fa: 'ارز پیش‌فرض' }, type: 'text' },
  { key: 'timezone', label: { en: 'Timezone', fa: 'زون زمانی' }, type: 'text' },
  { key: 'address', label: { en: 'Address', fa: 'آدرس' }, type: 'textarea', wide: true },
  { key: 'receiptFooter', label: { en: 'Receipt footer', fa: 'متن پایین رسید' }, type: 'textarea', wide: true },
]

export const workspaceMetrics = [
  {
    label: { en: 'Demo state', fa: 'وضعیت خزانه' },
    value: { en: 'Online ready', fa: 'افغانی / دالر' },
    trend: { en: 'Static safe', fa: 'متعادل' },
    icon: Gauge,
  },
  {
    label: { en: 'Approvals', fa: 'تاییدی‌ها' },
    value: { en: '0 pending', fa: '۰ در انتظار' },
    trend: { en: 'Clear', fa: 'پاک' },
    icon: ClipboardList,
  },
  {
    label: { en: 'Audit state', fa: 'وضعیت گزارش تغییرات' },
    value: { en: 'Locked', fa: 'قفل' },
    trend: { en: 'Protected', fa: 'محافظت‌شده' },
    icon: Scale,
  },
  {
    label: { en: 'Backup', fa: 'نسخه پشتیبان' },
    value: { en: 'Ready', fa: 'آماده' },
    trend: { en: 'Encrypted', fa: 'رمزنگاری‌شده' },
    icon: Archive,
  },
]

export const activityRows = [
  {
    area: { en: 'Dashboard', fa: 'معاملات' },
    item: { en: 'Live demo overview', fa: 'سرویس ثبت مالی' },
    state: { en: 'Ready', fa: 'آماده' },
    icon: Activity,
  },
  {
    area: { en: 'Setup', fa: 'صندوق نقد' },
    item: { en: 'Users and customer records', fa: 'خزانه اصلی و حرکت نقد' },
    state: { en: 'Prepared', fa: 'بیلانس دقیق' },
    icon: Coins,
  },
  {
    area: { en: 'Customers', fa: 'مشتریان' },
    item: { en: 'KYC and profile structure', fa: 'ساختار KYC و پروفایل' },
    state: { en: 'Prepared', fa: 'آماده' },
    icon: ContactRound,
  },
  {
    area: { en: 'Reports', fa: 'گزارش‌ها' },
    item: { en: 'CSV, PDF, XLSX exports', fa: 'خروجی CSV، PDF و XLSX' },
    state: { en: 'Queued', fa: 'در صف' },
    icon: Calculator,
  },
]
