import React from "react";
import { Landmark, Award, ShieldCheck, Heart, Sparkles, MoveLeft } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "../LanguageContext";

interface AboutPageProps {
  onBack: () => void;
}

export default function AboutPage({ onBack }: AboutPageProps) {
  const { language, t } = useLanguage();
  
  // Anim container variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="font-sans text-stone-800 bg-[#FCFBF9] py-16 sm:py-24 relative overflow-hidden"
    >
      {/* Background soft mist shapes */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-[#F0F4EF]/60 blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-12 right-1/4 w-[600px] h-[600px] rounded-full bg-[#eeeae1]/50 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 mt-4">
        {/* Hero title block */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-[#F0F4EF]/80 border border-[#c79e61]/20 items-center justify-center text-[#244D33] mb-5 shadow-sm">
            <Sparkles className="w-6 h-6 text-[#c79e61]" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#244D33] tracking-tight leading-tight">
            {language === "kbd" ? "SiGup проектым теухуауэ" : language === "en" ? "About SiGup Platform" : "О проекте SiGup"}
          </h1>
          <p className="text-[#588B67] text-sm sm:text-base mt-3 max-w-xl mx-auto font-light leading-relaxed">
            {language === "kbd" 
              ? "Адыгэ лъэпкъым и цифровой гур. Дэ тхъумэ ди мастеров, фермеров и кулинаров Кавказ бгыхэм я деж." 
              : language === "en" 
              ? "The digital heart of Circassian entrepreneurship. We proudly unite traditional masters, family cheese producers, and heirloom keepers under the peace of Caucasian peaks." 
              : "Цифровое сердце черкесского бизнеса. Мы бережно объединяем мастеров, фермеров и хранителей традиций под мирной сенью кавказских гор."}
          </p>
        </motion.div>

        {/* Story details panel */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-[32px] border border-[#eeeae1]/75 p-6 sm:p-10 shadow-sm shadow-[#244D33]/3 flex flex-col gap-8 relative overflow-hidden"
        >
          {/* Subtle logo pattern in the card background */}
          <div className="absolute top-5 right-5 w-24 h-24 opacity-3 pointer-events-none select-none">
            <img src="/input_file_0.png" alt="" className="w-full h-full object-contain" />
          </div>

          <div className="flex flex-col gap-6 text-stone-605 font-light text-sm sm:text-base leading-relaxed text-stone-600">
            <p className="font-serif italic text-lg sm:text-xl text-[#244D33] border-l-2 border-[#c79e61] pl-4 py-1">
              {language === "kbd" 
                ? "ЦIэр SiGup (Сигуп) къытекIащ адыгэ псалъэ лъапIэ «си гум ирихьыр», «си псэм хуэдэ» жиIэным." 
                : language === "en" 
                ? "The name SiGup (Сигуп) stems from the noble Circassian phrase meaning 'dear to my heart' or 'soul-matching', reflecting absolute sincerity and devotion." 
                : "Название SiGup (Сигуп) восходит к благородному адыгскому слову, означающему «по душе», «мило сердцу»."}
            </p>
            
            <p>
              {language === "kbd" 
                ? "Сигуп платформар тщIащ икIи зэхэткъуащ витринэ хуэдэу мастерхэр, хабзэхэр, унагъо ремеслохэр зэрылъын папщIэ дуней псом щыпсэу адыгэ диаспорам деж." 
                : language === "en" 
                ? "SiGup acts as a global digital assembly and showcase for Circassian artisans, farmers, traditional costume designers, native book authors, and organic curators globally." 
                : "Платформа Сигуп разработана как единая цифровая палата и витрина для ремесленников, фермеров, авторов редких книг, кавказских парфюмеров и иных предпринимателей черкесской диаспоры по всему миру."}
            </p>
            <p>
              {language === "en" 
                ? "Our mission is to help unique family brands directly reach their supporters and patrons while keeping the Caucasian heritage fully preserved: legendary Circassian smoked cheeses, authentic gold embroidery, leather saddles, and handmade silver daggers." 
                : language === "kbd"
                ? "Дэ ди мурадщ унагъо маркэхэмрэ мастерхэмрэ я лъэужьхэр тхъумэну — адыгэ кхъуей, дыщэпс тедзэным, джатэ бэракъхэр, кIэпхъхэмрэ пшынахэмрэ."
                : "Мы стремимся помочь уникальным маркам находить своих ценителей, сохраняя неприкосновенным великое кавказское наследие. Это легендарное черкесское сыроварение, чеканное серебро, искусное шитье золотыми нитями и резьба по вековому дереву."}
            </p>
          </div>

          {/* Calm values representation */}
          <div>
            <h3 className="text-lg font-serif font-bold text-[#244D33] tracking-wide mb-5">
              {language === "kbd" ? "Ди лъапIэныгъэхэр" : language === "en" ? "Our Core Values" : "Наши ценности и философия"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <motion.div
                whileHover={{ scale: 1.015, y: -2 }}
                className="p-5 rounded-2xl bg-[#FCFBF9]/80 border border-[#eeeae1]/60 flex gap-4.5 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F0F4EF] flex items-center justify-center shrink-0">
                  <Landmark className="w-5 h-5 text-[#244D33]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#244D33] uppercase tracking-wider">
                    {language === "kbd" ? "Хабзэ тхъумэн" : language === "en" ? "Heritage Accuracy" : "Историческая точность"}
                  </h4>
                  <p className="text-xs text-[#588B67] mt-1.5 leading-relaxed font-light">
                    {language === "en" 
                      ? "Preserving deep heirloom geometries, ancient culinary secrets, and physical handcrafted methods." 
                      : language === "kbd" 
                      ? "Адыгэ орнаментхэмрэ, рецептхэмрэ, IэщIагъэ бэракъыр дэ тхъумэжыр." 
                      : "Сохраняем подлинные орнаменты, старинные кулинарные рецепты и ручные методы обработки кожи и металлов."}
                  </p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.015, y: -2 }}
                className="p-5 rounded-2xl bg-[#FCFBF9]/80 border border-[#eeeae1]/60 flex gap-4.5 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F0F4EF] flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-[#244D33]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#244D33] uppercase tracking-wider">
                    {language === "kbd" ? "Шыпкъагъэ уасэ" : language === "en" ? "Curated Quality" : "Отобранное качество"}
                  </h4>
                  <p className="text-xs text-[#588B67] mt-1.5 leading-relaxed font-light">
                    {language === "en" 
                      ? "Every single project is hand-vetted by our authentic heritage curators, completely avoiding automated chaos." 
                      : language === "kbd" 
                      ? "Карточкэ псори дэ тхьэв проверяйт тщIы, автоматическэ роботхэм хэмылъу." 
                      : "Каждый проект в каталоге проходит человеческую, а не автоматическую модерацию, исключая рыночный хаос."}
                  </p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.015, y: -2 }}
                className="p-5 rounded-2xl bg-[#FCFBF9]/80 border border-[#eeeae1]/60 flex gap-4.5 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F0F4EF] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-[#244D33]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#244D33] uppercase tracking-wider">
                    {language === "kbd" ? "Уасэншэ зэпыщIын" : language === "en" ? "Peer Trust" : "Прямое доверие"}
                  </h4>
                  <p className="text-xs text-[#588B67] mt-1.5 leading-relaxed font-light">
                    {language === "en" 
                      ? "Zero platform commissions. Connect directly with makers via Telegram and WhatsApp." 
                      : language === "kbd" 
                      ? "Процентхэр хэмылъ. Фыхуитщ мастерхэм зэрыфхъуэну Telegram е WhatsApp-кIэ." 
                      : "Никаких комиссий и посредников. Гости связываются с авторами напрямую в WhatsApp и Telegram."}
                  </p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.015, y: -2 }}
                className="p-5 rounded-2xl bg-[#FCFBF9]/80 border border-[#eeeae1]/60 flex gap-4.5 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F0F4EF] flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5 text-[#244D33]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#244D33] uppercase tracking-wider">
                    {language === "kbd" ? "ЗэпыщIыныныгъэ" : language === "en" ? "Global Unity" : "Связь поколений"}
                  </h4>
                  <p className="text-xs text-[#588B67] mt-1.5 leading-relaxed font-light">
                    {language === "en" 
                      ? "Connecting homeland creators with diaspora communities in Turkey, Jordan, Europe, and the Middle East." 
                      : language === "kbd" 
                      ? "Тыркуе, Шамием, Иорданием, Германием щыпсэу ди соотечественникхэр зэщIэгъэувын." 
                      : "Интегрируем соотечественников из Турции, Сирии, Иордании, ОАЭ, Германии и других уголков мира."}
                  </p>
                </div>
              </motion.div>

            </div>
          </div>

          <div className="flex flex-col gap-4 text-xs sm:text-sm text-stone-500 font-light border-t border-[#eeeae1] pt-6">
            <p>
              {language === "en" 
                ? "The project operates in a high-fidelity interactive MVP context. Future roadmap goals include an ethnographic crafts dictionary, booking for mountain eco-tours, and digital escrow safeguards." 
                : language === "kbd" 
                ? "Проектыр MVP хуэдэу функционирует махуэ къэс. КъэкIуэну уахтэм дэ тщIынущ онлайн-словарь адыгэ IэщIагъэхэмкIэ." 
                : "Проект функционирует в режиме интерактивного MVP высокого разрешения. В рамках дорожной карты планируется добавление интерактивного словаря ремесел, безопасной сделки, а также онлайн-бронирования этно-туров."}
            </p>
          </div>

          <div className="border-t border-[#eeeae1] pt-6 mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <motion.button
              whileHover={{ scale: 1.02, x: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={onBack}
              id="about-back-btn"
              className="text-xs font-bold text-[#244D33] hover:text-[#c79e61] flex items-center gap-2 tracking-wider uppercase cursor-pointer bg-transparent border-none outline-none"
            >
              <MoveLeft className="w-4 h-4 text-[#c79e61]" />
              <span>{language === "en" ? "Return to Showcase" : language === "kbd" ? "Каталогым деж кIуэжын" : "Вернуться в каталог"}</span>
            </motion.button>

            <span className="text-[10px] font-mono tracking-widest uppercase text-stone-400">
              {language === "en" ? "Version 1.2 • Poetry of Sacred Peaks" : language === "kbd" ? "Версие 1.2 • Къурш бгы лъапэ" : "Версия 1.2 • Поэзия Горных Высот"}
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
