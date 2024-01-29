const puzzlerPassDataCols = "C:K";
const graphicsFldr = "./files/graphics";
const fontsFldr = "./files/fonts";
const headerFont = `${fontsFldr}/PixelNES.otf`;
const tableFont = `${fontsFldr}/8bitOperatorPlus8-Bold.ttf`;
const headerImgPath = `${graphicsFldr}/puzzlerpassHeader.png`;
const headers = [
    "Rank",
    "Username",
    "Avatar",
    "EXP",
    "Tier",
    "To Next Tier",
    "Next Reward",
    "Avatars",
    "EXP Multiplier",
];
const colWidth = [90, 300, 300, 100, 100, 175, 400, 75, 175];
const centered = [true,false,false,true,true,true,false,true,true];
const borderColor = `#000000`; //border color
const titleRow = `#000000`; //header row color
const headerHeight = 50; //header height
const edgeMargin = headerHeight * 0.5;
const titleRowFont = `#FFFFFF`; //header font color
const titleFontSizeInt = 14; //header font size
const titleFontSize = "bold " + titleFontSizeInt + "px HeaderFont"; //header font

const defaultFontSizeInt = 20; //default font size
const defaultFontSize = defaultFontSizeInt + "px TableFont"; //default font
const defaultFont = `#fcfcfc`; //default font color
const evenRowFontSize = "bold " + defaultFontSizeInt + "px TableFont"; //alternating row font
const evenRowFont = `#fcfcfc`; //alternating font color

const rowHeight = defaultFontSizeInt * 2.5; //row height
const defaultColor = "#b03c31"; //default row color
const evenRow = "#d1473a"; //alternating row color
const highlightedRowColor = "#FFFF00"; //for highlighting user (if found)

const leaderboardTable = {
    puzzlerPassDataCols,
    graphicsFldr,
    fontsFldr,
    headerFont,
    tableFont,
    headerImgPath,
    headers,
    colWidth,
    centered,
    borderColor,
    titleRow,
    headerHeight,
    edgeMargin,
    titleRowFont,
    titleFontSizeInt,
    titleFontSize,
    defaultFontSizeInt,
    defaultFontSize,
    defaultFont,
    evenRowFontSize,
    evenRowFont,
    rowHeight,
    defaultColor,
    evenRow,
    highlightedRowColor

};

export default leaderboardTable;
