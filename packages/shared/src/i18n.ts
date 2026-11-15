import type { Locale } from './constants';

/**
 * UI strings extracted verbatim from the original template so the web and mobile
 * apps keep the exact same wording in all three languages.
 */
export interface Messages {
  h1: string;
  hp: string;
  cta: string;
  ch: string;
  q: string;
  all: string;
  g1: string;
  g2: string;
  g3: string;
  g4: string;
  g5: string;
  g6: string;
  s1: string;
  s2: string;
  s3: string;
  add: string;
  open: string;
  cart: string;
  tot: string;
  co: string;
  nm: string;
  ph: string;
  ct: string;
  ad: string;
  coupon: string;
  ok: string;
  thx: string;
  thx2: string;
  none: string;
  emp: string;
  cl: string;
  bs: string;
  off: string;
  ft: string;
  tip: string;
  orderSummary: string;
  qty: string;
  loading: string;
  error: string;
  retry: string;
  back: string;
  next: string;
  featured: string;
  catalogue: string;
  home: string;
  login: string;
  logout: string;
  email: string;
  password: string;
  admin: string;
  orders: string;
  bookTitle: string;
  bookLevel: string;
  bookPrice: string;
  bookDescription: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  create: string;
}

const en: Messages = {
  h1: 'Step into a <em>library</em> that wants to be read.',
  hp: 'Hover the shelves, pull a book out, open it and turn the pages.',
  cta: 'Browse the shelves',
  ch: 'The catalogue',
  q: 'Search books…',
  all: 'All levels',
  g1: 'Primary',
  g2: 'Primary',
  g3: 'Preparatory',
  g4: 'Preparatory',
  g5: 'Secondary',
  g6: 'Exam prep',
  s1: 'Featured',
  s2: 'Price: low to high',
  s3: 'Price: high to low',
  add: 'Add to cart',
  open: 'Open',
  cart: 'Cart',
  tot: 'Total',
  co: 'Checkout',
  nm: 'Full name',
  ph: 'Phone',
  ct: 'City',
  ad: 'Address',
  coupon: 'Promo code',
  ok: 'Place order',
  thx: 'Thank you! Order',
  thx2: 'Your order has been recorded.',
  none: 'No books match.',
  emp: 'Your cart is empty.',
  cl: 'Close',
  bs: 'Best sellers & offers',
  off: 'Offer',
  ft: 'Educational books, beautifully shelved.',
  tip: 'Click to browse this level',
  orderSummary: 'Order summary',
  qty: 'Qty',
  loading: 'Loading…',
  error: 'Something went wrong.',
  retry: 'Retry',
  back: 'Back',
  next: 'Next',
  featured: 'Featured',
  catalogue: 'Catalogue',
  home: 'Home',
  login: 'Sign in',
  logout: 'Sign out',
  email: 'Email',
  password: 'Password',
  admin: 'Admin',
  orders: 'Orders',
  bookTitle: 'Title',
  bookLevel: 'Level',
  bookPrice: 'Price',
  bookDescription: 'Description',
  save: 'Save',
  cancel: 'Cancel',
  delete: 'Delete',
  edit: 'Edit',
  create: 'Create',
};

const fr: Messages = {
  h1: 'Entrez dans une <em>bibliothèque</em> qui donne envie de lire.',
  hp: 'Survolez les étagères, sortez un livre, ouvrez-le et tournez les pages.',
  cta: 'Parcourir les étagères',
  ch: 'Le catalogue',
  q: 'Rechercher…',
  all: 'Tous niveaux',
  g1: 'Primaire',
  g2: 'Primaire',
  g3: 'Préparatoire',
  g4: 'Préparatoire',
  g5: 'Secondaire',
  g6: 'Examens',
  s1: 'En vedette',
  s2: 'Prix croissant',
  s3: 'Prix décroissant',
  add: 'Ajouter',
  open: 'Ouvrir',
  cart: 'Panier',
  tot: 'Total',
  co: 'Commander',
  nm: 'Nom complet',
  ph: 'Téléphone',
  ct: 'Ville',
  ad: 'Adresse',
  coupon: 'Code promo',
  ok: 'Valider la commande',
  thx: 'Merci ! Commande',
  thx2: 'Votre commande a été enregistrée.',
  none: 'Aucun livre.',
  emp: 'Panier vide.',
  cl: 'Fermer',
  bs: 'Meilleures ventes & offres',
  off: 'Offre',
  ft: 'Des livres scolaires joliment rangés.',
  tip: 'Cliquez pour voir ce niveau',
  orderSummary: 'Récapitulatif',
  qty: 'Qté',
  loading: 'Chargement…',
  error: 'Une erreur est survenue.',
  retry: 'Réessayer',
  back: 'Retour',
  next: 'Suivant',
  featured: 'En vedette',
  catalogue: 'Catalogue',
  home: 'Accueil',
  login: 'Connexion',
  logout: 'Déconnexion',
  email: 'E-mail',
  password: 'Mot de passe',
  admin: 'Administration',
  orders: 'Commandes',
  bookTitle: 'Titre',
  bookLevel: 'Niveau',
  bookPrice: 'Prix',
  bookDescription: 'Description',
  save: 'Enregistrer',
  cancel: 'Annuler',
  delete: 'Supprimer',
  edit: 'Modifier',
  create: 'Créer',
};

const ar: Messages = {
  h1: 'ادخل <em>مكتبة</em> تدعوك إلى القراءة.',
  hp: 'مرّر الفأرة على الرفوف، اسحب كتابًا، افتحه وقلّب صفحاته.',
  cta: 'تصفّح الرفوف',
  ch: 'الكتالوج',
  q: 'ابحث عن كتاب…',
  all: 'كل المستويات',
  g1: 'ابتدائي',
  g2: 'ابتدائي',
  g3: 'إعدادي',
  g4: 'إعدادي',
  g5: 'ثانوي',
  g6: 'تحضير الامتحانات',
  s1: 'المميّزة',
  s2: 'السعر: من الأقل',
  s3: 'السعر: من الأعلى',
  add: 'أضف إلى السلة',
  open: 'افتح',
  cart: 'السلة',
  tot: 'المجموع',
  co: 'إتمام الطلب',
  nm: 'الاسم الكامل',
  ph: 'الهاتف',
  ct: 'المدينة',
  ad: 'العنوان',
  coupon: 'رمز الخصم',
  ok: 'تأكيد الطلب',
  thx: 'شكرًا! الطلب',
  thx2: 'تم تسجيل طلبك.',
  none: 'لا توجد كتب.',
  emp: 'السلة فارغة.',
  cl: 'إغلاق',
  bs: 'الأكثر مبيعًا والعروض',
  off: 'عرض',
  ft: 'كتب تعليمية مرتّبة بأناقة.',
  tip: 'انقر لعرض هذا المستوى',
  orderSummary: 'ملخّص الطلب',
  qty: 'الكمية',
  loading: 'جارٍ التحميل…',
  error: 'حدث خطأ ما.',
  retry: 'إعادة المحاولة',
  back: 'رجوع',
  next: 'التالي',
  featured: 'المميّزة',
  catalogue: 'الكتالوج',
  home: 'الرئيسية',
  login: 'تسجيل الدخول',
  logout: 'تسجيل الخروج',
  email: 'البريد الإلكتروني',
  password: 'كلمة المرور',
  admin: 'الإدارة',
  orders: 'الطلبات',
  bookTitle: 'العنوان',
  bookLevel: 'المستوى',
  bookPrice: 'السعر',
  bookDescription: 'الوصف',
  save: 'حفظ',
  cancel: 'إلغاء',
  delete: 'حذف',
  edit: 'تعديل',
  create: 'إنشاء',
};

export const MESSAGES: Record<Locale, Messages> = { en, fr, ar };

/** Prefix used by the template when rendering a level label, e.g. "Primary grade 1". */
export const LEVEL_PREFIX: Record<Locale, string> = {
  en: 'Primary grade ',
  fr: 'Primaire – année ',
  ar: 'الابتدائي – السنة ',
};

/**
 * The template renders every level as `PREFIX + digit` (e.g. "Primary grade 1"),
 * even on the filter dropdown, so we reproduce that here exactly.
 */
export function levelLabel(level: string, locale: Locale): string {
  const match = /^g(\d)$/.exec(level);
  if (match) return `${LEVEL_PREFIX[locale]}${match[1]}`;
  const key = level as keyof Messages;
  return key in MESSAGES[locale] ? MESSAGES[locale][key] : level;
}
