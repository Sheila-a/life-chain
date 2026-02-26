export const formatReadableDate = (isoString) => {
  if (!isoString) return "";

  const date = new Date(isoString);
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "long" });
  const year = date.getFullYear();

  const getOrdinalSuffix = (n) => {
    const j = n % 10,
      k = n % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  };

  const suffix = getOrdinalSuffix(day);

  return `${day}${suffix} ${month}, ${year}`;
};

// export const capitalize = (str) =>
//   str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

export const capitalize = (str) => {
  if (!str) return "";

  const spaced = str.replace(/[_-]+/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2");

  return spaced
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const toCamelCase = (str) => {
  return str
    ? str
        .toLowerCase()
        .split(" ")
        .map((word, index) =>
          index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1),
        )
        .join("")
    : "";
};

export function formatToTimeString(
  isoString,
  { utc = true, spaceBeforeAmPm = false } = {},
) {
  if (!isoString) return "";

  const date = new Date(isoString);
  const hours = utc ? date.getUTCHours() : date.getHours();
  const minutes = utc ? date.getUTCMinutes() : date.getMinutes();

  const h12 = hours % 12 || 12;
  const ampm = hours >= 12 ? "PM" : "AM";
  const hh = String(h12).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");

  return spaceBeforeAmPm ? `${hh}:${mm} ${ampm}` : `${hh}:${mm}${ampm}`;
}

export function getComplianceStatus(score) {
  if (score >= 75 && score <= 100) {
    return "Compliant";
  } else if (score >= 50 && score < 75) {
    return "Partially Compliant";
  } else {
    return "Non Compliant";
  }
}

export const hasRole = (role, auth) => auth?.role === role;
export const hasPermission = (perm, auth) => auth?.permissions?.includes(perm);

export function formatToYYYYMMDD(dateStr) {
  const cleaned = dateStr.replace(/(\d+)(st|nd|rd|th)/, "$1");

  const date = new Date(cleaned);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getCountdown(dueDate) {
  const now = new Date().getTime();
  const target = new Date(dueDate).getTime();

  let diff = Math.max(0, target - now); // prevent negatives

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  diff %= 1000 * 60 * 60 * 24;

  const hours = Math.floor(diff / (1000 * 60 * 60));
  diff %= 1000 * 60 * 60;

  const minutes = Math.floor(diff / (1000 * 60));
  diff %= 1000 * 60;

  const seconds = Math.floor(diff / 1000);

  return {
    days,
    hours,
    minutes,
    seconds,
  };

  // return `${days}:${hours}:${minutes}:${seconds}`;
}

export const formatTransactionDate = (isoDate) => {
  const date = new Date(isoDate);
  const now = new Date();

  // Normalize to local midnight
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfToday.getDate() - 1);

  // Time formatter (03:38 PM)
  const time = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Today
  if (date >= startOfToday) {
    return `Today, ${time}`;
  }

  // Yesterday
  if (date >= startOfYesterday && date < startOfToday) {
    return `Yesterday, ${time}`;
  }

  // Older dates → 5 Jan, 03:38 PM
  const formattedDate = date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });

  return `${formattedDate}, ${time}`;
};

export function extractMonthAndWeek(str) {
  const monthMap = {
    january: "01",
    february: "02",
    march: "03",
    april: "04",
    may: "05",
    june: "06",
    july: "07",
    august: "08",
    september: "09",
    october: "10",
    november: "11",
    december: "12",
  };

  const regex =
    /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+Week\s+(\d+).*?(\d{4})$/i;

  const match = str.match(regex);

  if (!match) return null;

  const [, monthName, week, year] = match;

  const monthNumber = monthMap[monthName.toLowerCase()];

  return [`${year}-${monthNumber}`, Number(week)];
  // ['2026-02', 3]
}

export function formatMonth(yyyyMm) {
  if (!yyyyMm) return "";

  const [, month] = yyyyMm.split("-");

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return months[Number(month) - 1];
  // January
}
