import React, { createContext, useContext, useState, ReactNode } from "react";

export type Language = "ru" | "kbd" | "en" | "krc";

export interface TranslationDictionary {
  [key: string]: string;
}

const translations: Record<Language, TranslationDictionary> = {
  ru: {
    // Simulator
    "simulator.title": "Режим симулятора:",
    "simulator.subtitle": "выберите роль для тестирования",
    "simulator.guest": "Гость",
    "simulator.partner": "Предприниматель",
    "simulator.moderator": "Модератор",

    // Header Links
    "nav.catalog": "Каталог",
    "nav.afisha": "Афиша",
    "nav.announcements": "Объявления",
    "nav.forEntrepreneurs": "Для предпринимателей",
    "nav.about": "О проекте",
    "nav.login": "Войти",
    "nav.myCabinet": "Мой кабинет",
    "nav.publish": "Разместить проект",
    "nav.cabinet": "Для предпринимателей",
    "nav.partnership": "Войти",

    // Brand
    "brand.slogan": "Северный Кавказ",

    // Hero
    "hero.title": "SiGup — информационная площадка о черкесских товарах и услугах",
    "hero.subtitle": "Находите предпринимателей, товары, услуги и события черкесского сообщества по всему миру.",
    "hero.btn.catalog": "Перейти в каталог",
    "hero.btn.publish": "Разместить свой проект",

    // Search
    "search.placeholder": "Что вы ищете? Например: сыр, одежда, мастерская...",
    "search.location": "Везде",
    "search.btn": "Найти",
    "location.label": "Регион",
    "location.all": "Везде",

    // Categories
    "cat.Products": "Продукты",
    "cat.Handwork": "Ручная работа",
    "cat.Books": "Книги",
    "cat.Perfume": "Парфюмерия",
    "cat.Services": "Услуги",
    "cat.Culture": "Культура",
    "cat.Salt": "Соль и традиции",
    "cat.Apparel": "Одежда",
    "cat.Others": "Другое",

    // Sections
    "section.catalog.title": "Популярные проекты каталога",
    "section.catalog.subtitle": "Лучшие предприниматели и мастера черкесского сообщества.",
    "section.afisha.title": "Афиша",
    "section.afisha.subtitle": "Мероприятия и события черкесского сообщества.",
    "section.announcements.title": "Объявления",
    "section.announcements.subtitle": "Актуальные объявления и предложения.",
    "section.viewAll": "Смотреть все",

    // Cards
    "card.rating": "рейтинг",
    "card.contact": "Связаться",
    "card.details": "Подробнее",
    "card.back": "Назад",
    "card.city": "Город",
    "card.delivery": "Доставка",
    "card.price": "Цены",
    "card.shareText": "Поделиться",
    "card.author": "Автор",
    "card.benefits": "Преимущества",
    "card.no_additives": "Без добавок",
    "card.tradition": "Традиционные рецепты",
    "card.hand_origin": "Ручная работа",
    "card.local_farm": "Местное производство",

    // Detail page
    "detail.aboutMaster": "О проекте",
    "detail.traditionalProducts": "Товары",
    "detail.reviews": "Отзывы",
    "detail.viewContact": "Контакты",
    "detail.verified": "Проверенный проект",
    "detail.tab.about": "О проекте",
    "detail.tab.products": "Товары",
    "detail.tab.delivery": "Доставка",
    "detail.tab.contacts": "Контакты",

    // Cabinet
    "cabinet.welcome": "Личный кабинет",
    "cabinet.greeting": "Здравствуйте, Аскер Хакунов",
    "cabinet.sub": "Здесь вы можете управлять своими проектами и следить за их статусом.",
    "cabinet.totalCards": "Всего карточек",
    "cabinet.published": "Опубликовано",
    "cabinet.onCheck": "На проверке",
    "cabinet.drafts": "Требуют доработки",
    "cabinet.myBrands": "Мои карточки",
    "cabinet.addBrand": "Создать новую карточку",
    "cabinet.notifications": "Уведомления модерации",
    "cabinet.security": "Настройки аккаунта",
    "cabinet.completness": "Заполненность профиля",
    "cabinet.nav.overview": "Обзор",
    "cabinet.nav.cards": "Мои карточки",
    "cabinet.nav.create": "Создать карточку",
    "cabinet.nav.drafts": "Черновики",
    "cabinet.nav.pending": "На проверке",
    "cabinet.nav.published": "Опубликованные",
    "cabinet.nav.rejected": "Отклонённые",
    "cabinet.nav.settings": "Настройки профиля",
    "cabinet.nav.logout": "Выйти",

    // CTA block
    "cta.entrepreneur.title": "Вы предприниматель?",
    "cta.entrepreneur.desc": "Разместите свой проект на SiGup и расскажите о себе сообществу по всему миру.",
    "cta.entrepreneur.step1": "Расскажите о своих товарах и услугах",
    "cta.entrepreneur.step2": "Привлекайте новых клиентов",
    "cta.entrepreneur.step3": "Станьте частью черкесского сообщества",
    "cta.entrepreneur.note": "Проекты публикуются после модерации для обеспечения качества и доверия.",
    "cta.entrepreneur.btn": "Разместить свой проект",

    // Footer
    "footer.desc": "Информационная площадка о черкесских товарах, услугах, предпринимателях и событиях по всему миру.",
    "footer.nav.title": "Навигация",
    "footer.help.title": "Помощь",
    "footer.help.rules": "Правила размещения",
    "footer.help.privacy": "Политика конфиденциальности",
    "footer.help.terms": "Условия использования",
    "footer.help.faq": "Часто задаваемые вопросы",
    "footer.help.contact": "Связаться с нами",
    "footer.contacts.title": "Контакты",
    "footer.copy": "© 2025 SiGup. Все права защищены."
  },

  kbd: {
    // Кабардино-черкесский (адыгэбзэ) язык
    "simulator.title": "Симулятор IуэхущIапIэр:",
    "simulator.subtitle": "тест щIыным папщIэ роль щха",
    "simulator.guest": "ХьэщIэ",
    "simulator.partner": "Хъуэпсэгъуэ",
    "simulator.moderator": "Модератор",

    "nav.catalog": "Каталог",
    "nav.afisha": "Афишэ",
    "nav.announcements": "Хъыбархэр",
    "nav.forEntrepreneurs": "Хъуэпсэгъуэхэм папщIэ",
    "nav.about": "Проектым теухуауэ",
    "nav.login": "Хэхьэн",
    "nav.myCabinet": "Си кабинет",
    "nav.publish": "Проект гъэувын",
    "nav.cabinet": "Хъуэпсэгъуэхэм папщIэ",
    "nav.partnership": "Хэхьэн",

    "brand.slogan": "Шэрджэс хъугъуэфIыгъуэхэр",

    "hero.title": "SiGup — адыгэ хъугъуэфIыгъуэхэмрэ Iуэхутхьэбзэхэмрэ теухуа хъыбарыщIэ IуэхущIапIэ",
    "hero.subtitle": "Хъуэпсэгъуэхэр, хъугъуэфIыгъуэхэр, Iуэхутхьэбзэхэрэ адыгэ зэгухьэныгъэм и зэхыхьэхэр дунейпсом щIыпIэ щIэгъэлъагъу.",
    "hero.btn.catalog": "Каталогым кIуэн",
    "hero.btn.publish": "Сипроект гъэувын",

    "search.placeholder": "Хэт лъыхъур? Псалъэм папщIэ: кхъуей, щыгъын, мастерскэ...",
    "search.location": "Дэнэ деи",
    "search.btn": "Лъыхъун",
    "location.label": "Щыгъуазэ",
    "location.all": "Дэнэ деи",

    "cat.Products": "Шхыныгъуэхэр",
    "cat.Handwork": "Iэпэ IэщIагъэ",
    "cat.Books": "Тхылъхэр",
    "cat.Perfume": "МэракIуэ",
    "cat.Services": "Iуэхутхьэбзэхэр",
    "cat.Culture": "Культурэ",
    "cat.Salt": "Шыгъурэ хабзэрэ",
    "cat.Apparel": "Щыгъынхэр",
    "cat.Others": "НэгъуэщI",

    "section.catalog.title": "Каталогым и проект цIэрыIуэхэр",
    "section.catalog.subtitle": "Адыгэ зэгухьэныгъэм и нэхъыщхьэ хъуэпсэгъуэхэмрэ мастерхэмрэ.",
    "section.afisha.title": "Афишэ",
    "section.afisha.subtitle": "Адыгэ зэгухьэныгъэм и зэхыхьэхэрэ хъыбархэрэ.",
    "section.announcements.title": "Хъыбархэр",
    "section.announcements.subtitle": "Хъыбар гъэщIэгъуэнхэрэ предложениехэрэ.",
    "section.viewAll": "Псори еплъын",

    "card.rating": "рейтинг",
    "card.contact": "Зэпыщэн",
    "card.details": "НэхъыбэIуэу",
    "card.back": "КIуэжын",
    "card.city": "Къалэ",
    "card.delivery": "Доставкэ",
    "card.price": "Уасэхэр",
    "card.shareText": "ГъэщIэн",
    "card.author": "УнафэщI",
    "card.benefits": "ФIагъхэр",
    "card.no_additives": "Хэмылъу",
    "card.tradition": "Хабзэ рецептхэр",
    "card.hand_origin": "Iэпэ лэжьыгъэ",
    "card.local_farm": "Щыгъуазэ хьэлэч",

    "detail.aboutMaster": "Проектым теухуауэ",
    "detail.traditionalProducts": "ХъугъуэфIыгъуэхэр",
    "detail.reviews": "Мащэхэр",
    "detail.viewContact": "Зэпыщэн",
    "detail.verified": "Зэпэщэна проект",
    "detail.tab.about": "Проектым теухуауэ",
    "detail.tab.products": "Хъугъуэфэхэр",
    "detail.tab.delivery": "Доставкэ",
    "detail.tab.contacts": "Зэпыщэн",

    "cabinet.welcome": "СиIуэхущIапIэ",
    "cabinet.greeting": "Сэлам, Аскер Хакунов",
    "cabinet.sub": "Мыбдеж уи проектхэр зэхъуэкIыну хуит ухъунщ.",
    "cabinet.totalCards": "Псори карточкэ",
    "cabinet.published": "Игъэхьэгъуа",
    "cabinet.onCheck": "Зэпэщэн",
    "cabinet.drafts": "ЗэхъуэкIыгъуэ хуей",
    "cabinet.myBrands": "Си карточкэхэр",
    "cabinet.addBrand": "Карточкэ ищIэ",
    "cabinet.notifications": "Модераторым и хъыбархэр",
    "cabinet.security": "ЩIыхуэ гъэтIылъыгъэ",
    "cabinet.completness": "Профилыр зэкъуэт",
    "cabinet.nav.overview": "Зэхэплъэн",
    "cabinet.nav.cards": "Си карточкэхэр",
    "cabinet.nav.create": "Карточкэ ищIэ",
    "cabinet.nav.drafts": "Черновикхэр",
    "cabinet.nav.pending": "Зэпэщэну",
    "cabinet.nav.published": "Игъэхьагъэхэр",
    "cabinet.nav.rejected": "КъэмыщтагъэхэрМ",
    "cabinet.nav.settings": "Профиль гъэтIылъыгъэ",
    "cabinet.nav.logout": "ДэкIын",

    "cta.entrepreneur.title": "Хъуэпсэгъуэ ухъу?",
    "cta.entrepreneur.desc": "Уи проект SiGup-ым деж гъэув, хамэ дунейм и щIыпIэхэм яхуэгъэщIэн.",
    "cta.entrepreneur.step1": "Уи хъугъуэфIыгъуэхэмрэ Iуэхутхьэбзэхэмрэ яхутепсэлъыхь",
    "cta.entrepreneur.step2": "ЩIэу лэжьэгъухэр зэгъэгъуэт",
    "cta.entrepreneur.step3": "Адыгэ зэгухьэныгъэм хэт хъун",
    "cta.entrepreneur.note": "Проектхэр модерацием нэужьщ ягъэхьэр.",
    "cta.entrepreneur.btn": "Сипроект гъэув",

    "footer.desc": "Адыгэ хъугъуэфIыгъуэхэм, Iуэхутхьэбзэхэм, хъуэпсэгъуэхэмрэ зэхыхьэхэмрэ теухуа хъыбарыщIэ IуэхущIапIэ дунейпсом.",
    "footer.nav.title": "Навигацэ",
    "footer.help.title": "ДэIэпыкъун",
    "footer.help.rules": "ТхьэмыщкIагъэ хабзэхэр",
    "footer.help.privacy": "Хъуэпсагъуэ политикэ",
    "footer.help.terms": "Пользование щытыкIэ",
    "footer.help.faq": "Упщэ куэдрэ ятэ",
    "footer.help.contact": "Дэзыпсэлъ",
    "footer.contacts.title": "Зэпыщэн",
    "footer.copy": "© 2025 SiGup. Хуитыныгъэхэр хъумарщ."
  },

  en: {
    "simulator.title": "Role Simulator:",
    "simulator.subtitle": "switch scenario to test the app",
    "simulator.guest": "Guest",
    "simulator.partner": "Entrepreneur",
    "simulator.moderator": "Moderator",

    "nav.catalog": "Catalog",
    "nav.afisha": "Events",
    "nav.announcements": "Bulletin",
    "nav.forEntrepreneurs": "For Entrepreneurs",
    "nav.about": "About",
    "nav.login": "Sign In",
    "nav.myCabinet": "My Cabinet",
    "nav.publish": "Post a Project",
    "nav.cabinet": "For Entrepreneurs",
    "nav.partnership": "Sign In",

    "brand.slogan": "North Caucasus",

    "hero.title": "SiGup — information platform about Circassian goods and services",
    "hero.subtitle": "Find entrepreneurs, goods, services and events of the Circassian community worldwide.",
    "hero.btn.catalog": "Browse Catalog",
    "hero.btn.publish": "Post Your Project",

    "search.placeholder": "What are you looking for? E.g.: cheese, clothing, workshop...",
    "search.location": "Everywhere",
    "search.btn": "Search",
    "location.label": "Region",
    "location.all": "Everywhere",

    "cat.Products": "Products",
    "cat.Handwork": "Handcraft",
    "cat.Books": "Books",
    "cat.Perfume": "Perfumery",
    "cat.Services": "Services",
    "cat.Culture": "Culture",
    "cat.Salt": "Salt & Traditions",
    "cat.Apparel": "Clothing",
    "cat.Others": "Other",

    "section.catalog.title": "Popular Catalog Projects",
    "section.catalog.subtitle": "Top entrepreneurs and masters of the Circassian community.",
    "section.afisha.title": "Events",
    "section.afisha.subtitle": "Events and occasions of the Circassian community.",
    "section.announcements.title": "Bulletin Board",
    "section.announcements.subtitle": "Current announcements and offers.",
    "section.viewAll": "View all",

    "card.rating": "rating",
    "card.contact": "Contact",
    "card.details": "More",
    "card.back": "Back",
    "card.city": "City",
    "card.delivery": "Delivery",
    "card.price": "Prices",
    "card.shareText": "Share",
    "card.author": "Author",
    "card.benefits": "Benefits",
    "card.no_additives": "No additives",
    "card.tradition": "Traditional recipes",
    "card.hand_origin": "Handmade",
    "card.local_farm": "Local production",

    "detail.aboutMaster": "About the Project",
    "detail.traditionalProducts": "Products",
    "detail.reviews": "Reviews",
    "detail.viewContact": "Contacts",
    "detail.verified": "Verified Project",
    "detail.tab.about": "About",
    "detail.tab.products": "Products",
    "detail.tab.delivery": "Delivery",
    "detail.tab.contacts": "Contacts",

    "cabinet.welcome": "Personal Cabinet",
    "cabinet.greeting": "Hello, Asker Khakunov",
    "cabinet.sub": "Here you can manage your projects and track their status.",
    "cabinet.totalCards": "Total Cards",
    "cabinet.published": "Published",
    "cabinet.onCheck": "Under Review",
    "cabinet.drafts": "Need Revision",
    "cabinet.myBrands": "My Cards",
    "cabinet.addBrand": "Create New Card",
    "cabinet.notifications": "Moderation Alerts",
    "cabinet.security": "Account Settings",
    "cabinet.completness": "Profile Completeness",
    "cabinet.nav.overview": "Overview",
    "cabinet.nav.cards": "My Cards",
    "cabinet.nav.create": "Create Card",
    "cabinet.nav.drafts": "Drafts",
    "cabinet.nav.pending": "Under Review",
    "cabinet.nav.published": "Published",
    "cabinet.nav.rejected": "Rejected",
    "cabinet.nav.settings": "Profile Settings",
    "cabinet.nav.logout": "Sign Out",

    "cta.entrepreneur.title": "Are you an entrepreneur?",
    "cta.entrepreneur.desc": "Post your project on SiGup and tell the community around the world about yourself.",
    "cta.entrepreneur.step1": "Tell about your goods and services",
    "cta.entrepreneur.step2": "Attract new clients",
    "cta.entrepreneur.step3": "Become part of the Circassian community",
    "cta.entrepreneur.note": "Projects are published after moderation to ensure quality and trust.",
    "cta.entrepreneur.btn": "Post Your Project",

    "footer.desc": "Information platform about Circassian goods, services, entrepreneurs and events worldwide.",
    "footer.nav.title": "Navigation",
    "footer.help.title": "Help",
    "footer.help.rules": "Posting Rules",
    "footer.help.privacy": "Privacy Policy",
    "footer.help.terms": "Terms of Use",
    "footer.help.faq": "FAQ",
    "footer.help.contact": "Contact Us",
    "footer.contacts.title": "Contacts",
    "footer.copy": "© 2025 SiGup. All rights reserved."
  },

  krc: {
    // Карачаево-балкарский язык
    "simulator.title": "Симулятор режими:",
    "simulator.subtitle": "тест этиу ючюн роль сайлагъыз",
    "simulator.guest": "Кёрюучю",
    "simulator.partner": "Сатыучу",
    "simulator.moderator": "Модератор",

    "nav.catalog": "Каталог",
    "nav.afisha": "Афиша",
    "nav.announcements": "Билдириуле",
    "nav.forEntrepreneurs": "Сатыучулагъа",
    "nav.about": "Проект юсюнден",
    "nav.login": "Кириу",
    "nav.myCabinet": "Меним кабинетим",
    "nav.publish": "Проект орнат",
    "nav.cabinet": "Сатыучулагъа",
    "nav.partnership": "Кириу",

    "brand.slogan": "Шимал Кавказ",

    "hero.title": "SiGup — черкес товарла бла жумушла юсюнден информация майдан",
    "hero.subtitle": "Сатыучуланы, товарланы, жумушланы эм черкес джамагъатны тюбешиулерин дунияны хар жеринде табыгъыз.",
    "hero.btn.catalog": "Каталогга кириу",
    "hero.btn.publish": "Проектими орнат",

    "search.placeholder": "Не излейсиз? Мисал: быщлак, кийим, устахана...",
    "search.location": "Хар жерде",
    "search.btn": "Излеу",
    "location.label": "Регион",
    "location.all": "Хар жерде",

    "cat.Products": "Аш-азыкъ",
    "cat.Handwork": "Эл иш",
    "cat.Books": "Китабла",
    "cat.Perfume": "Ийис суула",
    "cat.Services": "Жумушла",
    "cat.Culture": "Маданият",
    "cat.Salt": "Туз бла адет",
    "cat.Apparel": "Кийимле",
    "cat.Others": "Башха",

    "section.catalog.title": "Каталогну танымлы проектлери",
    "section.catalog.subtitle": "Черкес джамагъатны эм иги сатыучулары бла усталары.",
    "section.afisha.title": "Афиша",
    "section.afisha.subtitle": "Черкес джамагъатны тюбешиулери эм хапарлары.",
    "section.announcements.title": "Билдириуле",
    "section.announcements.subtitle": "Тийишли билдириуле эм теклифле.",
    "section.viewAll": "Барын кёр",

    "card.rating": "рейтинг",
    "card.contact": "Байламлы болуу",
    "card.details": "Кёбюрек",
    "card.back": "Артха",
    "card.city": "Шахар",
    "card.delivery": "Жетдириу",
    "card.price": "Багъалары",
    "card.shareText": "Юлеш",
    "card.author": "Тамада",
    "card.benefits": "Игилиги",
    "card.no_additives": "Хоша затсыз",
    "card.tradition": "Адет рецептле",
    "card.hand_origin": "Эл иш",
    "card.local_farm": "Жер иш",

    "detail.aboutMaster": "Проект юсюнден",
    "detail.traditionalProducts": "Товарла",
    "detail.reviews": "Сынамла",
    "detail.viewContact": "Байламлы болуу",
    "detail.verified": "Тексерилген проект",
    "detail.tab.about": "Юсюнден",
    "detail.tab.products": "Товарла",
    "detail.tab.delivery": "Жетдириу",
    "detail.tab.contacts": "Байламлы болуу",

    "cabinet.welcome": "Жеке кабинет",
    "cabinet.greeting": "Саламат бол, Аскер Хакунов",
    "cabinet.sub": "Мында проектлеринги тюзете аласа.",
    "cabinet.totalCards": "Битеу карточкала",
    "cabinet.published": "Жарыкъландырылгъан",
    "cabinet.onCheck": "Тексерилиуде",
    "cabinet.drafts": "Тюзетиу керек",
    "cabinet.myBrands": "Меним карточкаларым",
    "cabinet.addBrand": "Жангы карточка ишле",
    "cabinet.notifications": "Модератор хапарлары",
    "cabinet.security": "Аккаунт параметрлери",
    "cabinet.completness": "Профиль толтурулгъанлыгъы",
    "cabinet.nav.overview": "Кёзден кечириу",
    "cabinet.nav.cards": "Меним карточкаларым",
    "cabinet.nav.create": "Карточка ишле",
    "cabinet.nav.drafts": "Черновикла",
    "cabinet.nav.pending": "Тексерилиуде",
    "cabinet.nav.published": "Жарыкъландырылгъанла",
    "cabinet.nav.rejected": "Кабыл этилмегенле",
    "cabinet.nav.settings": "Профиль параметрлери",
    "cabinet.nav.logout": "Чыкъ",

    "cta.entrepreneur.title": "Сиз сатыучумусуз?",
    "cta.entrepreneur.desc": "Проектигизни SiGup-да орнатыгъыз эм дунияны хар жеринде джамагъатха айтыгъыз.",
    "cta.entrepreneur.step1": "Товарларыгъыз бла жумушларыгъыз юсюнден айтыгъыз",
    "cta.entrepreneur.step2": "Жангы мюштерилени тартыгъыз",
    "cta.entrepreneur.step3": "Черкес джамагъатны бир хесеги болугъуз",
    "cta.entrepreneur.note": "Проектле модерациядан сора жарыкъландырыладыла.",
    "cta.entrepreneur.btn": "Проектими орнат",

    "footer.desc": "Черкес товарла, жумушла, сатыучула эм тюбешиуле юсюнден дунияны хар жеринде информация майдан.",
    "footer.nav.title": "Навигация",
    "footer.help.title": "Болушлукъ",
    "footer.help.rules": "Орнатыу ережелери",
    "footer.help.privacy": "Жашырынлыкъ политикасы",
    "footer.help.terms": "Хайырланыу шартлары",
    "footer.help.faq": "Кёп берилген соруула",
    "footer.help.contact": "Бизге жазыгъыз",
    "footer.contacts.title": "Байламлы болуу",
    "footer.copy": "© 2025 SiGup. Битеу хакълары сакъланады."
  }
};

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("sigup_lang");
    return (saved === "ru" || saved === "kbd" || saved === "en" || saved === "krc") ? saved as Language : "ru";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("sigup_lang", lang);
  };

  const t = (key: string): string => {
    const translationSet = translations[language] || translations["ru"];
    if (key in translationSet) return translationSet[key];
    if (key in translations["ru"]) return translations["ru"][key];
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
}
