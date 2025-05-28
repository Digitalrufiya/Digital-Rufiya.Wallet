const SHEET_NAME = 'Donations';

function doGet(e) {
  if (e.parameter.action === 'getLeaderboard') {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues().slice(1); // skip header

    const result = data.map(row => ({
      name: row[1],
      points: parseInt(row[2]),
      date: row[3]
    }));

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput("Invalid request");
}

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const body = JSON.parse(e.postData.contents);
  const name = body.name;
  const points = parseInt(body.points);
  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");

  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === name && rows[i][3] === today) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, message: "You already donated today." }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  sheet.appendRow([new Date(), name, points, today]);

  return ContentService
    .createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
