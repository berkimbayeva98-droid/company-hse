const DB = {
  welding: {
    name: "Сварочный цех",
    level: 3, // High
    hazards: ["Открытое пламя", "УФ-излучение", "Токсичные аэрозоли", "Поражение током", "Брызги металла"],
    frp: ["FRP-01", "FRP-07", "FRP-09"],
    permit: "Наряд-допуск на огневые работы",
    ppe: ["Маска сварщика Ш-5+", "Огнестойкий костюм", "Краги сварщика", "Респиратор для сварки", "Диэлектрические перчатки"]
  },
  electrical: {
    name: "Электроустановки / Электромонтаж",
    level: 3, // High
    hazards: ["Поражение током (в т.ч. до 10 кВ)", "Дуговое КЗ", "Случайная подача напряжения", "Термические ожоги"],
    frp: ["FRP-01 (LOTO - обязательно)", "FRP-06", "FRP-07"],
    permit: "Наряд-допуск на электроработы",
    ppe: ["Диэлектрические перчатки", "Диэлектрические боты", "Каска защитная", "Защитные очки", "Огнестойкий костюм"],
    conflict: { with: "welding", msg: "⛔ КРИТИЧЕСКОЕ СОВМЕЩЕНИЕ: Одновременные огневые и электроработы! Требуется согласование ОТиПБ. Оформление в одном бланке наряда-допуска СТРОГО ЗАПРЕЩЕНО." }
  },
  metallurgical: {
    name: "Металлургический цех / Плавильное отделение",
    level: 3,
    hazards: ["Расплавленный металл", "Высокие температуры (до 1400°C)", "Токсичные газы (SO2, CO)", "Взрыв при контакте с влагой"],
    frp: ["FRP-01", "FRP-07", "FRP-08", "FRP-09"],
    permit: "Наряд на огневые работы + допуск в опасную зону",
    ppe: ["Алюминизированный костюм", "Щиток для лица термостойкий", "Термостойкие боты", "СИЗОД (респиратор/противогаз)"]
  },
  concentrator: {
    name: "Обогатительная фабрика",
    level: 2, // Medium
    hazards: ["Вращающиеся механизмы и конвейеры", "Пыль (опасность силикоза)", "Шум >85 дБ", "Химреагенты (флотация)"],
    frp: ["FRP-01", "FRP-02", "FRP-09", "FRP-10"],
    permit: "Наряд-допуск при работе у механизмов",
    ppe: ["Каска защитная", "Беруши / наушники", "Респиратор P3", "Защитные очки", "Перчатки химстойкие"]
  },
  zinc: {
    name: "Цинковый завод / Электролиз",
    level: 3,
    hazards: ["Серная кислота (H2SO4)", "Выделение водорода (взрывоопасно)", "Поражение током (ванны)", "Химические ожоги"],
    frp: ["FRP-01", "FRP-07", "FRP-09"],
    permit: "Допуск в химически опасную зону",
    ppe: ["Кислотостойкий суконный костюм", "Защитный щиток", "Кислотостойкие перчатки", "Кислотостойкие сапоги", "СИЗОД"]
  },
  height: {
    name: "Работы на высоте (h > 1.8м)",
    level: 3,
    hazards: ["Падение с высоты человека", "Падение инструментов/материалов вниз"],
    frp: ["FRP-06"],
    permit: "Наряд-допуск на работы на высоте",
    ppe: ["Страховочная привязь (индивидуальная система)", "Каска с подбородочным ремнем", "Нескользящая обувь", "Ограждение нижней зоны"]
  },
  confined: {
    name: "Замкнутые пространства",
    level: 4, // Critical
    hazards: ["Недостаток кислорода", "Наличие токсичных скоплений газов", "Затрудненная эвакуация"],
    frp: ["FRP-05"],
    permit: "Наряд-допуск на работы в ЗП",
    ppe: ["Изолирующий дыхательный аппарат", "Страховочная система спасения", "Средства связи", "Обязательный наблюдающий снаружи!"]
  }
};

const levelsMap = {
  1: { text: "🟢 НИЗКИЙ РИСК", cls: "risk-low" },
  2: { text: "🟡 СРЕДНИЙ РИСК", cls: "risk-med" },
  3: { text: "🟠 ВЫСОКИЙ РИСК", cls: "risk-high" },
  4: { text: "🔴 КРИТИЧЕСКИЙ РИСК", cls: "risk-critical" }
};

document.addEventListener("DOMContentLoaded", () => {
  const checkboxes = document.querySelectorAll("#workTypesGroup input[type='checkbox']");
  const saveBtn = document.getElementById("saveBtn");
  const resultContent = document.getElementById("resultContent");
  const placeholder = document.querySelector(".placeholder-text");
  
  const ui = {
    badge: document.getElementById("riskBadge"),
    zones: document.getElementById("outZones"),
    hazards: document.getElementById("outHazards"),
    ppe: document.getElementById("outPpe"),
    frp: document.getElementById("outFrp"),
    permits: document.getElementById("outPermits"),
    conflicts: document.getElementById("conflictsContainer")
  };

  function update() {
    const selected = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
    
    if (selected.length === 0) {
      placeholder.classList.remove("hidden");
      resultContent.classList.add("hidden");
      saveBtn.disabled = true;
      return;
    }

    placeholder.classList.add("hidden");
    resultContent.classList.remove("hidden");
    saveBtn.disabled = false;

    let maxLevel = 1;
    const items = selected.map(k => DB[k]);
    
    const data = {
      names: [], hazards: new Set(), ppe: new Set(), frp: new Set(), permits: new Set(), alerts: []
    };

    items.forEach(item => {
      data.names.push(item.name);
      item.hazards.forEach(vh => data.hazards.add(vh));
      item.ppe.forEach(vp => data.ppe.add(vp));
      item.frp.forEach(vf => data.frp.add(vf));
      data.permits.add(item.permit);
      if (item.level > maxLevel) maxLevel = item.level;
    });

    if (selected.length > 1 && maxLevel < 4) {
       maxLevel++;
       data.alerts.push("⚠️ Внимание: Совмещение нескольких видов работ/зон автоматически повышает общую категорию риска.");
    }

    if (selected.includes("welding") && selected.includes("electrical")) {
       maxLevel = 4;
       data.alerts.push(DB.electrical.conflict.msg);
    }

    if (data.permits.size > 1) {
       data.alerts.push("⛔ ЗАПРЕТ: Оформление двух разных нарядов в одном бланке запрещено! Выпишите раздельно.");
    }

    const riskInfo = levelsMap[maxLevel];
    ui.badge.className = `risk-badge ${riskInfo.cls}`;
    ui.badge.textContent = riskInfo.text;
    ui.zones.textContent = data.names.join(" + ");

    ui.hazards.innerHTML = Array.from(data.hazards).map(h => `<li>${h}</li>`).join("");
    ui.ppe.innerHTML = Array.from(data.ppe).map(p => `<li>${p}</li>`).join("");
    ui.permits.innerHTML = Array.from(data.permits).map(p => `<li>${p}</li>`).join("");
    ui.frp.innerHTML = Array.from(data.frp).map(f => `<span class="tag">${f}</span>`).join("");

    if (data.alerts.length > 0) {
      ui.conflicts.classList.remove("hidden");
      ui.conflicts.innerHTML = data.alerts.map(a => `<div>${a}</div>`).join("<br>");
    } else {
      ui.conflicts.classList.add("hidden");
      ui.conflicts.innerHTML = "";
    }
  }

  checkboxes.forEach(cb => cb.addEventListener("change", update));

  saveBtn.addEventListener("click", () => {
    window.print();
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(err => {
         console.log("Оффлайн-режим (Service Worker) не зарегистрирован: ", err);
      });
    });
  }
});
