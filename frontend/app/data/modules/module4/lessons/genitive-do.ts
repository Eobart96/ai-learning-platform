import { defineModule4Lesson } from "../lessonFactory";

export const genitiveDoLesson = defineModule4Lesson("genitive-do", 6, {
    summary: "Do + Genitív отвечает на Kam? и показывает движение внутрь здания, к месту или помещение предмета внутрь контейнера.",
    model: "Kam? + do + Genitív: do školy, do obchodu, do mesta, do tašky.",
    goals: ["Задавать Kam?", "Выражать движение внутрь с do", "Употреблять частотные формы Genitívu", "Описывать помещение предмета внутрь"],
    rules: [
      "После do всегда нужен Genitív: škola → do školy; obchod → do obchodu; mesto → do mesta.",
      "Учите пары Kde/Kam: v škole → do školy; v hoteli → do hotela; v meste → do mesta.",
      "Города имеют частотные формы: do Bratislavy, do Prahy, do Viedne; названия во множественном числе: do Košíc, Tatier, Álp.",
      "Контейнеры используют ту же модель: do tašky, do vrecka, do chladničky, do auta.",
      "Idem domov означает «иду домой», а Idem do domu — «иду внутрь здания».",
      "Некоторые места закреплены за na: na poštu, не do poštu.",
    ],
    examples: [
      { slovak: "Idem do školy.", russian: "Я иду в школу." },
      { slovak: "Vraciame sa do hotela.", russian: "Мы возвращаемся в отель." },
      { slovak: "Cestujem do Bratislavy.", russian: "Я еду в Братиславу." },
      { slovak: "Dávam knihu do tašky.", russian: "Я кладу книгу в сумку." },
      { slovak: "Nastupujem do auta.", russian: "Я сажусь в машину." },
    ],
    primaryTitle: "Частотные формы после do",
    primaryTable: { headers: ["Тип", "Nominatív", "Genitív", "Сочетание"], rows: [["женский на -a", "škola / banka", "školy / banky", "do školy / banky"], ["женский, мягкая модель", "práca / nemocnica", "práce / nemocnice", "do práce / nemocnice"], ["мужской", "obchod / dom / park", "obchodu / domu / parku", "do obchodu / domu / parku"], ["мужской", "hotel", "hotela", "do hotela"], ["средний", "mesto / centrum", "mesta / centra", "do mesta / centra"], ["средний", "kino / divadlo / auto", "kina / divadla / auta", "do kina / divadla / auta"]] },
    secondaryTitle: "Города, контейнеры и особые пары",
    secondaryTable: { headers: ["Исходная форма", "Направление", "Пример"], rows: [["Bratislava / Praha / Viedeň", "do Bratislavy / Prahy / Viedne", "Cestujem do Prahy."], ["Košice / Tatry / Alpy", "do Košíc / Tatier / Álp", "Ideme do Košíc."], ["taška / vrecko", "do tašky / vrecka", "Vložím kľúče do vrecka."], ["chladnička / auto", "do chladničky / auta", "Dám mlieko do chladničky."], ["domov", "без предлога", "Idem domov."], ["dom", "do domu", "Idem do domu."]] },
    boundaryItems: ["Som v škole. → Idem do školy.", "Som v hoteli. → Vraciame sa do hotela.", "Som na pošte. → Idem na poštu.", "v Košiciach → do Košíc; v Tatrách → do Tatier."],
    mistake: "Не оставляйте словарную форму после do и не переносите do на места с na: do školy, do hotela, но na poštu.",
    task: "Опишите маршрут четырьмя местами с do и добавьте одну фразу о помещении предмета внутрь.",
    productionPrompt: "Переведите: «Я еду в Братиславу».", productionAnswer: "Cestujem do Bratislavy.", productionHint: "Название города получает форму Bratislavy после do.",
  });
