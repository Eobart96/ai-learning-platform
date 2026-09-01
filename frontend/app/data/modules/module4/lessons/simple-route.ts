import { defineModule4Lesson } from "../lessonFactory";

export const simpleRouteLesson = defineModule4Lesson("simple-route", 10, {
    summary: "Понятный маршрут соединяет вежливый вопрос, последовательные команды и точный ориентир возле цели.",
    model: "Prepáčte, kde je...? / Ako sa tam dostanem? Затем: najprv, potom, ďalej, nakoniec + choďte rovno, odbočte doľava/doprava.",
    goals: ["Спрашивать дорогу", "Понимать команды маршрута", "Различать положение и направление", "Объяснять путь в 4–6 шагах"],
    rules: [
      "Положение: vedľa + Genitív, oproti + Datív, pri + Lokál, pred/za/medzi + Inštrumentál.",
      "Naľavo/napravo описывают положение, doľava/doprava — направление поворота.",
      "Вежливые команды незнакомому человеку учатся целиком: Choďte, Pokračujte, Odbočte, Prejdite, Vystúpte.",
      "Связывайте шаги словами najprv, potom, ďalej и nakoniec.",
      "Точный ориентир завершает маршрут: vedľa banky, oproti hotelu, medzi bankou a poštou, na rohu.",
      "Расстояние: Je to blízko/ďaleko. Je to asi päť minút pešo.",
    ],
    examples: [
      { slovak: "Prepáčte, ako sa dostanem na poštu?", russian: "Извините, как мне добраться до почты?" },
      { slovak: "Choďte rovno.", russian: "Идите прямо." },
      { slovak: "Odbočte doľava.", russian: "Поверните налево." },
      { slovak: "Pošta je vedľa banky.", russian: "Почта рядом с банком." },
      { slovak: "Je to asi päť minút pešo.", russian: "Это примерно пять минут пешком." },
    ],
    primaryTitle: "Где находится ориентир",
    primaryTable: { headers: ["Модель", "Падеж", "Пример"], rows: [["vedľa + G", "Genitív", "Pošta je vedľa banky."], ["naľavo/napravo od + G", "Genitív", "Hotel je naľavo od parku."], ["oproti + D", "Datív", "Banka je oproti hotelu."], ["pri + L", "Lokál", "Zastávka je pri stanici."], ["pred/za + I", "Inštrumentál", "Auto je pred domom."], ["medzi + I", "Inštrumentál", "Lekáreň je medzi bankou a poštou."], ["na rohu", "готовая модель", "Kaviareň je na rohu."]] },
    secondaryTitle: "Команды и последовательность",
    secondaryTable: { headers: ["Функция", "Команда", "Расширение"], rows: [["прямо", "Choďte rovno.", "asi 200 metrov"], ["продолжить", "Pokračujte rovno.", "po tejto ulici"], ["поворот", "Odbočte doľava/doprava.", "na prvej križovatke"], ["пересечь", "Prejdite cez ulicu.", "pri banke"], ["пройти мимо", "Prejdite okolo parku.", "potom pokračujte rovno"], ["выйти", "Vystúpte na druhej zastávke.", "potom choďte pešo"], ["порядок", "najprv → potom → ďalej → nakoniec", "четыре последовательных шага"]] },
    boundaryItems: ["naľavo/napravo — где", "doľava/doprava — куда", "rovno — наречие, не rovný", "vedľa banky — Genitív", "oproti hotelu — Datív", "medzi bankou a poštou — Inštrumentál"],
    mistake: "Не заменяйте наречия прилагательными и проверяйте управление ориентира: Choďte rovno; odbočte doprava; vedľa banky.",
    task: "Объясните путь в 4–6 предложениях: назовите исходную точку, повороты, последовательность и ориентир у цели.",
    productionPrompt: "Переведите: «Идите прямо, потом поверните направо».", productionAnswer: "Choďte rovno, potom odbočte doprava.", productionHint: "Используйте две вежливые команды и свяжите их через potom.",
  });
