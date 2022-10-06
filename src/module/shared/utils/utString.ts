import pwdGenerator from "generate-password";

export const utGetYMDHPath = (): string => {
  const d = new Date();
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}/${d.getHours()}`;
};

export const utGeneratePwd = (): string => pwdGenerator.generate({
  numbers: true,
  lowercase: false,
  uppercase: false,
  length: 8,
});

export const utSanitizeText = (text = ""): string => (text || "").trim();

export const utStringBooleanToBoolean = (
  stringBoolean: "true" | "false",
): boolean => stringBoolean && String(stringBoolean)
  .toLowerCase() === "true";

export const utGetAllAlphabets = (): string[] => [
  ...Array(26),
].map((_, idx) => String.fromCharCode(65 + idx));

export const utGetAlphanumericsOnly = (text: string = ""): string => text.toLowerCase().replace(/[^a-zA-Z0-9]+/g, "-");

export const utEscapeSingleQuotes = (text: string): string => text.replace(/'/g, "''");

export const utIsValidJson = (jsonString: string): boolean => {
  try {
    const value = JSON.parse(jsonString);
    if (!value) return false;
  } catch (e) {
    return false;
  }
  return true;
};

export const utFormatNumericValueForDb = (value: string, format: string): string => {
  let formattedValue;
  if (format === ",sep.decimal") {
    formattedValue = value.toString().replace(/,/g, "");
  } else {
    const sepRemoved = value.toString().replace(/\./g, "");
    formattedValue = sepRemoved.replace(/,/g, ".");
  }
  return formattedValue;
};

export const utFormatNumericValueWithUserPref = (value: string | number, prefFmt?: string): string => {
  let formattedValue = value;
  if (prefFmt) {
    const formatWithDecSep = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 20 }).format(value as number);
    const formatWithCommaSep = new Intl.NumberFormat("en-US", { maximumFractionDigits: 20 }).format(value as number);
    formattedValue = prefFmt === ",sep.decimal" ? formatWithCommaSep : formatWithDecSep;
  }
  return formattedValue as string;
};
