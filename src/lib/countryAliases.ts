// Alternative names and common variations for countries
// Keys are ISO_A2 codes (or synthetic codes for countries without official ISO codes)
export const COUNTRY_ALIASES: Record<string, string[]> = {
  // Americas
  US: [
    "usa",
    "united states",
    "america",
    "united states of america",
    "u.s.a",
    "u.s",
  ],
  GB: ["uk", "united kingdom", "britain", "great britain", "england", "u.k"],
  PR: ["puerto rico"],

  // Countries with synthetic ISO codes (no official ISO)
  SYN_NORTHERN_CYPRUS: [
    "northern cyprus",
    "north cyprus",
    "n cyprus",
    "turkish cyprus",
    "trnc",
  ],
  SYN_SOMALILAND: ["somaliland", "republic of somaliland"],

  // African countries
  CD: [
    "drc",
    "congo",
    "democratic republic of the congo",
    "dr congo",
    "congo-kinshasa",
    "dem. rep. of congo",
    "dem rep of congo",
    "dem. rep. congo",
  ],
  CG: [
    "congo",
    "republic of the congo",
    "congo-brazzaville",
    "republic of congo",
  ],
  SS: ["south sudan", "s. sudan", "s sudan"],
  SZ: ["eswatini", "swaziland"],
  TZ: ["tanzania", "united republic of tanzania"],
  CI: ["ivory coast", "cote d ivoire", "cote divoire", "cote", "côte d'ivoire"],
  GM: ["gambia", "the gambia"],

  // Asian countries
  KR: ["south korea", "korea", "republic of korea", "s. korea"],
  KP: ["north korea", "dprk", "democratic peoples republic of korea"],
  TW: ["taiwan", "republic of china", "chinese taipei"],
  LA: ["laos"],
  SY: ["syria"],
  IR: ["iran"],
  VN: ["vietnam"],
  MM: ["myanmar", "burma"],
  BN: ["brunei"],
  PS: ["palestine", "state of palestine"],

  // European countries
  CZ: ["czechia", "czech republic"],
  MK: ["macedonia", "north macedonia", "republic of north macedonia"],
  BA: ["bosnia", "bosnia and herzegovina"],
  NL: ["netherlands", "holland"],
  CH: ["switzerland"],
  VA: ["vatican", "vatican city", "holy see"],
  RS: ["serbia", "republic of serbia"],
  TR: ["turkey", "turkiye", "türkiye"],
  XK: ["kosovo"],

  // Other
  RU: ["russia", "russian federation"],
  VE: ["venezuela"],
  BO: ["bolivia"],
  CV: ["cape verde", "cabo verde"],
  FM: ["micronesia", "federated states of micronesia"],
  CF: ["car", "central african republic"],
  DO: ["dominican republic", "dominican rep"],
  GQ: ["equatorial guinea", "eq guinea"],
  TL: ["timor leste", "east timor", "timor-leste"],
  AE: ["uae", "united arab emirates"],
  BS: ["bahamas", "the bahamas"],
  GN: ["guinea"],
  GW: ["guinea bissau", "guinea-bissau"],
};
