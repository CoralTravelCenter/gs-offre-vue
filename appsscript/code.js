function hotelIdFormulaeForRow(row_idx) {
    return `=VLOOKUP(A${ row_idx },IMPORTRANGE("12obWDe25k7pEMkXeqCh_5juRMeNT3Pc84yuoeXdlrXc","name-id!A:B"),2,true)`;
}

function hotelIdQueryForRow(row_idx) {
    return `=IFERROR(JOIN(" | ",QUERY(IMPORTRANGE("12obWDe25k7pEMkXeqCh_5juRMeNT3Pc84yuoeXdlrXc","name-id!A:B"),"select Col2 where Col1 = '"&A${ row_idx }&"'")),"---")`;
}

function onOpen() {
    SpreadsheetApp.getUi()
        .createAddonMenu()
        .addItem('B2C Hotel Offers', 'openInterface')
        .addToUi();
    openInterface();
}

function onEdit(e) {
    const editedRange = e?.range;
    if (editedRange) {
        const sheet = editedRange.getSheet();
        // Logger.log(editedRange.getA1Notation());
        if (editedRange.getColumn() === 1) {
            for (let row_idx = editedRange.getRow(); row_idx <= editedRange.getLastRow(); row_idx++) {
                if (sheet.getRange(row_idx, 1, 1, 1).getValue()) {
                    sheet.getRange(row_idx, 2, 1, 1).setValue(hotelIdQueryForRow(row_idx));
                } else {
                    sheet.getRange(row_idx, 2, 1, 1).setValue('');
                }
            }
        }
    }
}

function onSelectionChange(e) {
    // e.range
}

function openInterface() {
    const sidebar_html = HtmlService.createHtmlOutputFromFile('index');
    sidebar_html.setTitle('B2C Hotel Offers')
    SpreadsheetApp.getUi().showSidebar(sidebar_html);
}

function getHeadersInRange(range) {
    const sheet = range.getSheet();
    const headers = [];
    for (let col = range.getColumn(); col <= range.getLastColumn(); col++) {
        headers.push(sheet.getRange(1, col, 1, 1).getValue());
    }
    return headers;
}
function pullState() {
    const activeSheet = SpreadsheetApp.getActiveSheet();
    const activeRange = activeSheet.getActiveRange();
    const selectionHeaders = getHeadersInRange(activeRange);
    if (selectionHeaders.includes('timeframe')) {

    }
    if (selectionHeaders.includes('nights')) {

    }
    return {
        activeSheetName:  activeSheet.getName(),
        selectionRange:   activeRange.getA1Notation(),
        selectionHeaders,
        // activeCell :      'activeCell'
    };
}

function isActiveSheetEmpty() {
    return SpreadsheetApp.getActiveSheet().getDataRange().isBlank();
}

function initActiveSheet() {
    const sheet = SpreadsheetApp.getActiveSheet();

    sheet.getRange('A1:D1').setValues([['name', 'id', 'timeframe', 'nights']]);

    const headerStyle = SpreadsheetApp.newTextStyle().setBold(true).setForegroundColor('white').build();
    sheet.getRange('1:1').setTextStyle(headerStyle).setBackground('black');

    sheet.getRange('A2:B2').setValues([['XANADU MAKADI BAY', hotelIdQueryForRow(2)]]);

    sheet.setFrozenRows(1);

    // define conditional formatting for ID column
    const idsColumnRange = sheet.getRange('B:B');
    idsColumnRange.setHorizontalAlignment('center');
    const missing_id_rule = SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo('---')
        .setBackground('red')
        .setRanges([idsColumnRange])
        .build();
    const multiple_id_rule = SpreadsheetApp.newConditionalFormatRule()
        .whenTextContains('|')
        .setBackground('yellow')
        .setRanges([idsColumnRange])
        .build();
    let cfRules = sheet.getConditionalFormatRules();
    cfRules.push(missing_id_rule);
    cfRules.push(multiple_id_rule);
    sheet.setConditionalFormatRules(cfRules);

}