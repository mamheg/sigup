export const categories = [
  { id: '1', name: 'Продукты', icon: 'Milk' },
  { id: '2', name: 'Ручная работа', icon: 'Scissors' },
  { id: '3', name: 'Книги', icon: 'BookOpen' },
  { id: '4', name: 'Парфюмерия', icon: 'FlaskConical' },
  { id: '5', name: 'Услуги', icon: 'Handshake' },
  { id: '6', name: 'Культура', icon: 'Music' },
];

export const projects = [
  {
    id: '1',
    title: 'Сырная мастерская «Уэдыж»',
    category: 'Продукты',
    description: 'Натуральные адыгейские сыры по традиционным рецептам. Только молоко, соль и время.',
    location: 'Майкоп, Россия',
    image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1621213458641-78d1f8553d10?auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1559561853-08451507cbe7?auto=format&fit=crop&q=80',
    ],
    status: 'Опубликовано',
    verified: true,
    contact: {
      phone: '+7 (928) 123-45-01',
      instagram: '@uedyzh_cheese',
      whatsapp: 'wa.me/79281234501',
      telegram: 't.me/uedyzh'
    }
  },
  {
    id: '2',
    title: 'Керамика «Тхьэм и Дзыхь»',
    category: 'Ручная работа',
    description: 'Авторская керамика с черкесскими орнаментами.',
    location: 'Нальчик, Россия',
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80',
    status: 'Опубликовано'
  },
  {
    id: '3',
    title: 'Издательство «Пщыпэ»',
    category: 'Книги',
    description: 'Книги об истории, культуре и языке адыгов.',
    location: 'Москва, Россия',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80',
    status: 'На проверке'
  },
  {
    id: '4',
    title: 'ZEPHYR Parfum',
    category: 'Парфюмерия',
    description: 'Нишевая парфюмерия с вдохновением Кавказа.',
    location: 'Стамбул, Турция',
    image: 'https://images.unsplash.com/photo-1594034181977-98782ee91937?auto=format&fit=crop&q=80',
    status: 'Требует доработки'
  },
  {
    id: '5',
    title: 'Digital Apsny',
    category: 'Услуги',
    description: 'Веб-разработка и продвижение для вашего бизнеса.',
    location: 'Краснодар, Россия',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80',
    status: 'Опубликовано'
  },
  {
    id: '6',
    title: 'Фольклорный ансамбль «Ошхамахо»',
    category: 'Культура',
    description: 'Традиционные танцы и песни, организация выступлений.',
    location: 'Майкоп, Россия',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80',
    status: 'Опубликовано'
  }
];

export const events = [
  {
    id: '1',
    title: 'День черкесской культуры',
    date: '25 мая 2025',
    location: 'Москва',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80',
  },
  {
    id: '2',
    title: 'Фестиваль адыгского сыра',
    date: '7 июня 2025',
    location: 'Майкоп',
    image: 'https://images.unsplash.com/photo-1582236829748-0be6554b5dfd?auto=format&fit=crop&q=80',
  },
  {
    id: '3',
    title: 'Выставка «Наследие гор»',
    date: '14-15 июня 2025',
    location: 'Нальчик',
    image: 'https://images.unsplash.com/photo-1518399583193-470295fc74ab?auto=format&fit=crop&q=80',
  },
  {
    id: '4',
    title: 'Вечер адыгского танца',
    date: '21 июня 2025',
    location: 'Стамбул',
    image: 'https://images.unsplash.com/photo-1508215885820-4585e5610e28?auto=format&fit=crop&q=80',
  }
];
