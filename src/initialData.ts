import { Project, ProjectCategory, ProjectStatus, EventItem, AnnouncementItem } from "./types";

export const initialProjects: Project[] = [
  {
    id: "uzdyh-cheese",
    name: "Сырная мастерская «Уздых»",
    category: ProjectCategory.Products,
    shortDescription: "Натуральные адыгейские сыры по традиционным рецептам. Только молоко, соль и время.",
    fullDescription: "Сырная мастерская «Уздых» — это семейное дело, где бережно хранят традиции сыроделия Адыгеи. Мы производим натуральные сыры из свежего коровьего молока, без консервантов и растительных жиров.\n\nНаши сыры созревают естественным образом, сохраняя насыщенный вкус, нежную текстуру и пользу настоящего продукта. Мы уверены, что простые и честные продукты делают жизнь вкуснее и здоровее. Поддерживая нас, вы поддерживаете локальное производство и традиции предков.",
    photos: [
      "https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&q=80&w=800", // main Adygei white cheese
      "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&q=80&w=800", // cheese tray
      "https://images.unsplash.com/photo-1559561853-08451507cbe7?auto=format&fit=crop&q=80&w=800", // making cheese / white curds
      "https://images.unsplash.com/photo-1631379578550-7038263db699?auto=format&fit=crop&q=80&w=800", // cutting cheese
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800"  // products display
    ],
    country: "Россия",
    city: "Майкоп",
    address: "Республика Адыгея, г. Майкоп, ул. Шовгенова, 35",
    rating: 5.0,
    instagram: "@uedyzh_cheese",
    phone: "+7 (928) 123-45-67",
    whatsapp: "+79281234567",
    telegram: "uedyzh_cheese",
    website: "uedyzh-cheese.ru",
    priceInfo: "Цены уточняйте у продавца",
    deliveryInfo: "Доставляем по Майкопу и Адыгее. В другие регионы — по договорённости.",
    status: ProjectStatus.Published,
    authorId: "asker-khakunov",
    authorName: "Аскер Хакунов",
    isFeatured: true,
    updatedAt: "25 мая 2025",
    products: [
      {
        id: "prod-1",
        name: "Адыгейский сыр",
        price: "по запросу",
        description: "Классический мягкий сыр из свежего молока.",
        image: "https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&q=80&w=400"
      },
      {
        id: "prod-2",
        name: "Копченый сыр",
        price: "по запросу",
        description: "Нежный сыр с лёгким дымным ароматом.",
        image: "https://images.unsplash.com/photo-1631379578550-7038263db699?auto=format&fit=crop&q=80&w=400"
      },
      {
        id: "prod-3",
        name: "Сырные наборы",
        price: "уточняйте",
        description: "Подборки сыров для вашего стола или в подарок.",
        image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&q=80&w=400"
      },
      {
        id: "prod-4",
        name: "Домашнее масло",
        price: "уточняйте",
        description: "Натуральное сливочное масло из свежих сливок.",
        image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&q=80&w=400"
      }
    ]
  },
  {
    id: "tkhazem-ceramics",
    name: "Керамика «Тхьэм и Дзыхь»",
    category: ProjectCategory.Handwork,
    shortDescription: "Авторская керамика с древнечеркесскими орнаментами и философией.",
    fullDescription: "Мастерская этнической керамики. Название переводится как 'Доверенное Богу'. Мы создаем уникальную и долговечную глиняную посуду, гравируем её аутентичными кавказскими узорами, каждый из которых имеет своё глубокое сакральное значение.\n\nКаждое изделие лепится вручную, проходит несколько обжигов и покрывается качественной пищевой глазурью или обрабатывается молочным обжигом по старинной технологии.",
    photos: [
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800", // gorgeous dark carved pottery / mug
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800"
    ],
    country: "Россия",
    city: "Нальчик",
    address: "Республика Кабардино-Балкария, г. Нальчик, ул. Ленина, 12",
    rating: 4.9,
    instagram: "@tkha_ceramics",
    phone: "+7 (905) 555-44-33",
    whatsapp: "+79055554433",
    telegram: "tkha_ceramics",
    status: ProjectStatus.Published,
    authorId: "temir-kardan",
    authorName: "Темир Карданов",
    isFeatured: true,
    updatedAt: "20 мая 2025",
    products: [
      {
        id: "cer-1",
        name: "Глиняная пиала с узором",
        price: "1 200 ₽",
        description: "Ручная лепка, традиционный черкесский орнамент.",
        image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=400"
      }
    ]
  },
  {
    id: "psype-books",
    name: "Издательство «Псыпэ»",
    category: ProjectCategory.Books,
    shortDescription: "Книги об истории, культуре, языке и выдающихся личностях адыгов.",
    fullDescription: "Издательский проект «Псыпэ» занимается популяризацией черкесской литературы, архивных материалов, словарей и научно-популярных книг о Кавказе. Мы переиздаем редкие труды и открываем современных авторов, пишущих на адыгейском, кабардинском и русском языках.",
    photos: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800", // leather or stylized aesthetic book
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800"
    ],
    country: "Россия",
    city: "Москва",
    address: "г. Москва, ул. Арбат, 22",
    rating: 4.8,
    instagram: "@psype_books",
    phone: "+7 (495) 777-66-55",
    whatsapp: "+74957776655",
    website: "psype-books.ru",
    status: ProjectStatus.Published,
    authorId: "marat-shagirov",
    authorName: "Марат Шагиров",
    isFeatured: true,
    updatedAt: "18 мая 2025"
  },
  {
    id: "zephyr-parfum",
    name: "ZEPHYR Parfum",
    category: ProjectCategory.Perfume,
    shortDescription: "Нишевая парфюмерия с вдохновением горного Кавказа и черкесских трав.",
    fullDescription: "Парфюмерный бренд ZEPHYR создает неповторимые селективные ароматы. В основе наших композиций лежат эфирные масла кавказского чабреца, горной полыни, хвои, дикого мёда и чистейших ледниковых нот.\n\nАромат, который переносит в самое сердце гор утренней прохлады.",
    photos: [
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800", // rich niche perfume bottle
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800"
    ],
    country: "Турция",
    city: "Стамбул",
    address: "Istanbul, Besiktas, Barbaros Blv., 74",
    rating: 4.9,
    instagram: "@zephyr_parfum",
    phone: "+90 (532) 000-11-22",
    whatsapp: "905320001122",
    status: ProjectStatus.Published,
    authorId: "milana-tkhago",
    authorName: "Милана Тхаго",
    isFeatured: true,
    updatedAt: "24 июня 2025"
  },
  {
    id: "digital-apsny",
    name: "Digital Apsny",
    category: ProjectCategory.Services,
    shortDescription: "Веб-разработка, дизайн, брендинг и продвижение вашего бизнеса.",
    fullDescription: "Профессиональная команда разработчиков и дизайнеров. Мы помогаем предпринимателям Кавказа и диаспоры выходить в онлайн: разрабатываем сайты, настраиваем рекламу, проектируем логотипы, бережно интегрируя национальные мотивы в современный digital-дизайн.",
    photos: [
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800", // coder screen, elegant laptop
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800"
    ],
    country: "Россия",
    city: "Краснодар",
    address: "г. Краснодар, ул. Красная, 110",
    rating: 5.0,
    instagram: "@digital_apsny",
    phone: "+7 (918) 444-55-66",
    telegram: "digital_apsny",
    status: ProjectStatus.Published,
    authorId: "inall-shamba",
    authorName: "Инал Шамба",
    isFeatured: true,
    updatedAt: "22 июня 2025"
  },
  // Additional projects demonstrating roles and statuses
  {
    id: "gorniy-med",
    name: "Пасека «Горный мёд»",
    category: ProjectCategory.Products,
    shortDescription: "Дикий альпийский мёд, перга и продукты пчеловодства из заповедной зоны.",
    fullDescription: "Пасека расположена на высоте 1800 метров над уровнем моря, вдали от трасс и производств. Пчёлы собирают нектар с реликтовых кавказских медоносов.",
    photos: ["https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800"],
    country: "Россия",
    city: "Майкопский район",
    status: ProjectStatus.Published,
    authorId: "asker-khakunov",
    authorName: "Аскер Хакунов",
    updatedAt: "19 мая 2025"
  },
  {
    id: "adyghe-tea",
    name: "Травяные чаи «Адыгэ»",
    category: ProjectCategory.Products,
    shortDescription: "Сборные горные чаи ручной сушки. Чабрец, мята, шиповник.",
    fullDescription: "Ароматные и оздоравливающие купажи, собранные вручную жительницами предгорных селений Адыгеи.",
    photos: ["https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=800"],
    country: "Россия",
    city: "Каменномостский",
    status: ProjectStatus.Published,
    authorId: "milana-tkhago",
    authorName: "Милана Тхаго",
    updatedAt: "17 мая 2025"
  },
  {
    id: "ethno-tour",
    name: "Этно-тур по Черекскому ущелью",
    category: ProjectCategory.Services,
    shortDescription: "Конные прогулки и исторические экскурсии к родовым башням.",
    fullDescription: "Полноценный тур выходного дня: древние башни Безинги, Голубые озёра, Черкские ущелья, верховая езда и традиционный ужин у костра.\n\nПрогулки проводятся опытными гидами, знающими историю каждого камня.",
    photos: ["https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800"],
    country: "Россия",
    city: "Кабардино-Балкарская Республика",
    status: ProjectStatus.Pending,
    adminComment: "",
    authorId: "asker-khakunov",
    authorName: "Аскер Хакунов",
    updatedAt: "19 мая 2025"
  },
  {
    id: "wood-carving",
    name: "Резные изделия «Древо жизни»",
    category: ProjectCategory.Handwork,
    shortDescription: "Эксклюзивные панно, столики-анэ и сувениры из кавказского дуба.",
    fullDescription: "Ручная резьба по благородному дереву. Изготовление традиционных праздничных столиков анэ, шкатулок с узорами.",
    photos: ["https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=800"],
    country: "Россия",
    city: "Владикавказ, РСО-Алания",
    status: ProjectStatus.Pending,
    authorId: "boris-tokov",
    authorName: "Борис Токов",
    updatedAt: "24 июня 2025"
  },
  {
    id: "festival-cheese",
    name: "Фестиваль адыгского сыра",
    category: ProjectCategory.Products,
    shortDescription: "Праздничный выездной маркет сыров, мастер-классы.",
    fullDescription: "Маркетинговая карточка со списком участников-производителей. Позволяет заказать традиционные соленые и копченые сыры напрямую.",
    photos: ["https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&q=80&w=800"],
    country: "Россия",
    city: "Майкоп, Республика Адыгея",
    status: ProjectStatus.Published,
    authorId: "asker-khakunov",
    authorName: "Аскер Хакунов",
    updatedAt: "25 мая 2025"
  }
];

export const initialEvents: EventItem[] = [
  {
    id: "ev-1",
    title: "День черкесской культуры",
    type: "Мероприятие",
    image: "https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?auto=format&fit=crop&q=80&w=800", // mountain sunset / landscape
    dateStr: "25 мая 2025",
    location: "Москва",
    shortDescription: "Концерт, выставка национальных костюмов и традиционные угощения адыгов в столице.",
    status: "Опубликовано",
    isFeatured: true
  },
  {
    id: "ev-2",
    title: "Фестиваль адыгского сыра",
    type: "Мероприятие",
    image: "https://images.unsplash.com/photo-1559561853-08451507cbe7?auto=format&fit=crop&q=80&w=800", // cheese making festival
    dateStr: "7 июня 2025",
    location: "Майкоп",
    shortDescription: "Крупнейшее кулинарное событие региона. Дегустация, кулинарные поединки сыроваров.",
    status: "Опубликовано",
    isFeatured: true
  },
  {
    id: "ev-3",
    title: "Выставка «Наследие гор»",
    type: "Мероприятие",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800", // rider or painting style mountain
    dateStr: "14–15 июня 2025",
    location: "Нальчик",
    shortDescription: "Выставка живописи современных художников Северного Кавказа, посвященная традиционному быту.",
    status: "Опубликовано",
    isFeatured: true
  },
  {
    id: "ev-4",
    title: "Вечер адыгского танца",
    type: "Мероприятие",
    image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=800", // dance festival group / ethnic event vibe
    dateStr: "21 июня 2025",
    location: "Стамбул",
    shortDescription: "Традиционная джегу (танцевальный круг) черкесской диаспоры в историческом центре Стамбула.",
    status: "Опубликовано",
    isFeatured: true
  },
  {
    id: "ev-5",
    title: "Этно-тур по Черкесии",
    type: "Мероприятие",
    image: "https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?auto=format&fit=crop&q=80&w=800", // landscape
    dateStr: "28–29 июня 2025",
    location: "Каменномостский",
    shortDescription: "Посещение водопадов Руфабго, Хаджохской теснины и встреча с мастерами народных промыслов.",
    status: "Опубликовано",
    isFeatured: true
  }
];

export const initialAnnouncements: AnnouncementItem[] = [
  {
    id: "ann-1",
    text: "Ищем мастеров плетения из адыгейской циновки (пIу) для проведения мастер-классов на афише.",
    status: "Опубликовано",
    date: "14 июня 2025"
  },
  {
    id: "ann-2",
    text: "Стартовала регистрация для участников ярмарки черкесских мастеров в Майкопе. Заявки подавать онлайн.",
    status: "Опубликовано",
    date: "10 июня 2025"
  }
];
