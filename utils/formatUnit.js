const FRACTIONS = [
  { value: 1 / 4, label: "1/4" },
  { value: 1 / 3, label: "1/3" },
  { value: 1 / 2, label: "1/2" },
  { value: 2 / 3, label: "2/3" },
  { value: 3 / 4, label: "3/4" },
];

function getFractionLabel(quantity) {
  const number = Number(quantity);

  if (!Number.isFinite(number)) {
    return null;
  }

  const match = FRACTIONS.find(
    (fraction) => Math.abs(number - fraction.value) < 0.015,
  );

  return match?.label || null;
}

export function formatQuantity(quantity) {
  const number = Number(quantity);

  if (!Number.isFinite(number)) {
    return quantity;
  }

  if (Number.isInteger(number)) {
    return String(number);
  }

  /*
   * Fraction pure :
   * 0.5  -> 1/2
   * 0.25 -> 1/4
   */
  const directFraction = getFractionLabel(number);

  if (directFraction) {
    return directFraction;
  }

  /*
   * Nombre mixte :
   * 1.5  -> 1 1/2
   * 2.25 -> 2 1/4
   */
  const integerPart = Math.floor(number);
  const decimalPart = number - integerPart;

  const fractionPart = getFractionLabel(decimalPart);

  if (integerPart > 0 && fractionPart) {
    return `${integerPart} ${fractionPart}`;
  }

  return String(Number(number.toFixed(2)));
}

export function pluralizeUnit(unit, quantity) {
  const number = Number(quantity);

  /*
   * En français, une quantité <= 1 reste généralement
   * au singulier dans notre affichage :
   * 1 pièce
   * 1/2 pièce
   * 0.75 boîte
   */
  if (!Number.isFinite(number) || number <= 1) {
    return unit;
  }

  const plurals = {
    pièce: "pièces",
    boîte: "boîtes",
    sachet: "sachets",
    tranche: "tranches",
    pot: "pots",
    bouteille: "bouteilles",
    paquet: "paquets",
    verre: "verres",
    gousse: "gousses",
    pincée: "pincées",
    botte: "bottes",
    poignée: "poignées",

    "c. à soupe": "c. à soupe",
    "c. à café": "c. à café",

    g: "g",
    kg: "kg",
    ml: "ml",
    cl: "cl",
    l: "l",
  };

  return plurals[unit] || unit;
}

export function formatQuantityUnit(quantity, unit) {
  return `${formatQuantity(quantity)} ${pluralizeUnit(unit, quantity)}`;
}
