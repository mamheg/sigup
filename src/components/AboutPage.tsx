import { Landmark, Award, ShieldCheck, Heart, Sparkles, MoveLeft } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../LanguageContext";
import { paths } from "../lib/paths";
import { staggerContainer, staggerItem } from "../lib/motion";

interface AboutPageProps {
  onBack: () => void;
}

export default function AboutPage({ onBack }: AboutPageProps) {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const values = [
    {
      icon: Landmark,
      title:
        language === "kbd" ? "Хабзэ тхъумэн" : language === "en" ? "Heritage Accuracy" : "Историческая точность",
      text:
        language === "en"
          ? "Preserving deep heirloom geometries, ancient culinary secrets, and physical handcrafted methods."
          : language === "kbd"
          ? "Адыгэ орнаментхэмрэ, рецептхэмрэ, IэщIагъэ бэракъыр дэ тхъумэжыр."
          : "Сохраняем подлинные орнаменты, старинные кулинарные рецепты и ручные методы обработки кожи и металлов.",
    },
    {
      icon: Award,
      title:
        language === "kbd" ? "Шыпкъагъэ уасэ" : language === "en" ? "Curated Quality" : "Отобранное качество",
      text:
        language === "en"
          ? "Every single project is hand-vetted by our heritage curators, completely avoiding automated chaos."
          : language === "kbd"
          ? "Карточкэ псори дэ тхьэв проверяйт тщIы, автоматическэ роботхэм хэмылъу."
          : "Каждый проект в каталоге проходит человеческую, а не автоматическую модерацию, исключая рыночный хаос.",
    },
    {
      icon: ShieldCheck,
      title:
        language === "kbd" ? "Уасэншэ зэпыщIын" : language === "en" ? "Peer Trust" : "Прямое доверие",
      text:
        language === "en"
          ? "Zero platform commissions. Connect directly with makers via Telegram and WhatsApp."
          : language === "kbd"
          ? "Процентхэр хэмылъ. Фыхуитщ мастерхэм зэрыфхъуэну Telegram е WhatsApp-кIэ."
          : "Никаких комиссий и посредников. Гости связываются с авторами напрямую в WhatsApp и Telegram.",
    },
    {
      icon: Heart,
      title:
        language === "kbd" ? "ЗэпыщIыныныгъэ" : language === "en" ? "Global Unity" : "Связь поколений",
      text:
        language === "en"
          ? "Connecting homeland creators with diaspora communities in Turkey, Jordan, Europe, and the Middle East."
          : language === "kbd"
          ? "Тыркуе, Шамием, Иорданием, Германием щыпсэу ди соотечественникхэр зэщIэгъэувын."
          : "Интегрируем соотечественников из Турции, Сирии, Иордании, ОАЭ, Германии и других уголков мира.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <title>О проекте — SiGup</title>
      <meta
        name="description"
        content="SiGup — цифровое сердце черкесского бизнеса: платформа мастеров, фермеров и хранителей традиций со всего мира."
      />

      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        {/* Hero */}
        <motion.header variants={staggerItem} className="text-center mb-12 sm:mb-14">
          <div className="inline-flex w-14 h-14 rounded-lg bg-brand-muted border border-line items-center justify-center mb-5 shadow-sm">
            <Sparkles className="w-6 h-6 text-gold" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-brand tracking-tight text-balance leading-tight">
            {language === "kbd" ? "SiGup проектым теухуауэ" : language === "en" ? "About SiGup" : "О проекте SiGup"}
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-ink-soft leading-relaxed">
            {language === "kbd"
              ? "Адыгэ лъэпкъым и цифровой гур. Дэ тхъумэ ди мастеров, фермеров и кулинаров Кавказ бгыхэм я деж."
              : language === "en"
              ? "The digital heart of Circassian entrepreneurship. We proudly unite traditional masters, family cheese producers, and heirloom keepers under the peace of Caucasian peaks."
              : "Цифровое сердце черкесского бизнеса. Мы бережно объединяем мастеров, фермеров и хранителей традиций под мирной сенью кавказских гор."}
          </p>
        </motion.header>

        {/* Story */}
        <motion.section
          variants={staggerItem}
          className="bg-surface border border-line rounded-lg shadow-card p-6 sm:p-10 flex flex-col gap-8"
        >
          <div className="flex flex-col gap-6 text-ink-soft leading-relaxed">
            <p className="font-serif italic text-xl sm:text-2xl text-brand border-l-2 border-gold pl-4 py-1">
              {language === "kbd"
                ? "ЦIэр SiGup (Сигуп) къытекIащ адыгэ псалъэ лъапIэ «си гум ирихьыр», «си псэм хуэдэ» жиIэным."
                : language === "en"
                ? "The name SiGup (Сигуп) stems from the noble Circassian phrase meaning 'dear to my heart' — reflecting sincerity and devotion."
                : "Название SiGup (Сигуп) восходит к благородному адыгскому слову, означающему «по душе», «мило сердцу»."}
            </p>

            <p>
              {language === "kbd"
                ? "Сигуп платформар тщIащ икIи зэхэткъуащ витринэ хуэдэу мастерхэр, хабзэхэр, унагъо ремеслохэр зэрылъын папщIэ дуней псом щыпсэу адыгэ диаспорам деж."
                : language === "en"
                ? "SiGup acts as a global digital assembly and showcase for Circassian artisans, farmers, traditional costume designers, native book authors, and organic curators."
                : "Платформа Сигуп разработана как единая цифровая палата и витрина для ремесленников, фермеров, авторов редких книг, кавказских парфюмеров и иных предпринимателей черкесской диаспоры по всему миру."}
            </p>
            <p>
              {language === "en"
                ? "Our mission is to help unique family brands reach their supporters directly while keeping Caucasian heritage preserved: legendary smoked cheeses, gold embroidery, leather saddles, and handmade silver daggers."
                : language === "kbd"
                ? "Дэ ди мурадщ унагъо маркэхэмрэ мастерхэмрэ я лъэужьхэр тхъумэну — адыгэ кхъуей, дыщэпс тедзэным, джатэ бэракъхэр, кIэпхъхэмрэ пшынахэмрэ."
                : "Мы стремимся помочь уникальным маркам находить своих ценителей, сохраняя неприкосновенным великое кавказское наследие. Это легендарное черкесское сыроварение, чеканное серебро, искусное шитьё золотыми нитями и резьба по вековому дереву."}
            </p>
          </div>

          {/* Values */}
          <div>
            <h2 className="font-serif text-2xl text-brand tracking-tight mb-5">
              {language === "kbd" ? "Ди лъапIэныгъэхэр" : language === "en" ? "Our Core Values" : "Наши ценности и философия"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {values.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="p-5 rounded-md bg-canvas border border-line flex gap-4 transition-colors duration-200 hover:border-line-strong"
                >
                  <div className="w-10 h-10 rounded-md bg-brand-muted flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">{title}</h3>
                    <p className="mt-1.5 text-sm text-ink-soft leading-relaxed">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Roadmap note */}
          <div className="border-t border-line pt-6 text-sm text-ink-faint leading-relaxed">
            <p>
              {language === "en"
                ? "The project operates as a high-fidelity interactive MVP. The roadmap includes an ethnographic crafts dictionary, booking for mountain eco-tours, and digital escrow safeguards."
                : language === "kbd"
                ? "Проектыр MVP хуэдэу функционирует махуэ къэс. КъэкIуэну уахтэм дэ тщIынущ онлайн-словарь адыгэ IэщIагъэхэмкIэ."
                : "Проект функционирует в режиме интерактивного MVP высокого разрешения. В рамках дорожной карты планируется добавление интерактивного словаря ремёсел, безопасной сделки, а также онлайн-бронирования этно-туров."}
            </p>
          </div>

          {/* Footer / actions */}
          <div className="border-t border-line pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => {
                onBack();
                navigate(paths.catalog);
              }}
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-gold-dark transition-colors uppercase tracking-wider cursor-pointer"
            >
              <MoveLeft className="w-4 h-4 text-gold" />
              <span>
                {language === "en" ? "Return to Catalog" : language === "kbd" ? "Каталогым деж кIуэжын" : "Вернуться в каталог"}
              </span>
            </button>

            <span className="text-xs tracking-widest uppercase text-ink-faint">
              {language === "en" ? "Version 1.2 • Poetry of Sacred Peaks" : language === "kbd" ? "Версие 1.2 • Къурш бгы лъапэ" : "Версия 1.2 • Поэзия горных высот"}
            </span>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}
