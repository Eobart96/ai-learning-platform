import { defineModule4Lesson } from "../lessonFactory";

export const locativeVNaLesson = defineModule4Lesson("locative-v-na", 3, {
    summary: "Lokál после v/vo и na отвечает на Kde? и описывает местонахождение, а не направление движения. Предлог и форму места лучше учить единым блоком.",
    model: "Kde? + v/vo или na + Lokál: v škole, vo vlaku, na pošte, na stole.",
    goals: ["Задавать Kde?", "Выбирать v/vo или na", "Употреблять частотные формы Lokálu", "Описывать место в единственном и множественном числе"],
    rules: [
      "V/vo обычно обозначает нахождение внутри, в городе или помещении: v škole, v banke, v meste.",
      "Na используется с поверхностями и закреплёнными учреждениями/местами: na stole, na pošte, na stanici, na Slovensku.",
      "Vo облегчает произношение перед v-, f- и трудными сочетаниями: vo vlaku, vo firme, vo vode.",
      "Окончание нельзя надёжно угадать по последней букве: hotel → v hoteli, park → v parku, námestie → na námestí.",
      "Во множественном числе частотны -och, -ách/-iach: v obchodoch, v školách, na uliciach, v mestách.",
      "Не выбирайте предлог по русскому переводу: v škole, но na univerzite и na Slovensku.",
    ],
    examples: [
      { slovak: "Som v škole.", russian: "Я в школе." },
      { slovak: "Sedím vo vlaku.", russian: "Я сижу в поезде." },
      { slovak: "Som na pošte.", russian: "Я на почте." },
      { slovak: "Kniha je na stole.", russian: "Книга на столе." },
      { slovak: "Priatelia bývajú v Košiciach.", russian: "Друзья живут в Кошице." },
    ],
    primaryTitle: "Частотные формы единственного числа",
    primaryTable: { headers: ["Тип", "Nominatív", "Lokál", "Сочетание"], rows: [["женский на -a", "škola / banka", "škole / banke", "v škole / banke"], ["женский, мягкая модель", "práca / ulica", "práci / ulici", "v práci / na ulici"], ["мужской", "obchod / hotel / park", "obchode / hoteli / parku", "v obchode / hoteli / parku"], ["средний", "mesto / auto", "meste / aute", "v meste / aute"], ["особые частотные", "Slovensko / námestie", "Slovensku / námestí", "na Slovensku / námestí"]] },
    secondaryTitle: "Vo и множественное число",
    secondaryTable: { headers: ["Сигнал", "Форма", "Примеры"], rows: [["простая форма", "v", "v škole, v práci, v meste"], ["удобное произношение", "vo", "vo vlaku, vo vode, vo firme"], ["мужской, мн. ч.", "-och", "v obchodoch, hoteloch"], ["женский, мн. ч.", "-ách/-iach", "v školách, na uliciach"], ["средний, мн. ч.", "-ách", "v mestách, autách"], ["город во мн. ч.", "-iach", "v Košiciach"]] },
    boundaryItems: ["Som v škole. отвечает на Kde?.", "Idem do školy. отвечает на Kam?.", "v škole, но vo vlaku", "na pošte, na stanici, na Slovensku — учите готовыми сочетаниями."],
    mistake: "Не оставляйте словарную форму после предлога и не смешивайте место с направлением: Som v škole, не v škola и не do školy.",
    task: "Опишите, где находятся пять людей или предметов; используйте v, vo, na и одну форму множественного числа.",
    productionPrompt: "Переведите: «Мы в школе».", productionAnswer: "Sme v škole.", productionHint: "Местонахождение отвечает на Kde? и использует v škole.",
  });
