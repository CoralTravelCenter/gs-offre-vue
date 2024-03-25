function hotelIdFormulaeForRow(row_idx) {
    return `=VLOOKUP(A${ row_idx },IMPORTRANGE("12obWDe25k7pEMkXeqCh_5juRMeNT3Pc84yuoeXdlrXc","name-id!A:B"),2,true)`;
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
                    sheet.getRange(row_idx, 2, 1, 1).setValue(hotelIdFormulaeForRow(row_idx));
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


function pullState() {
    return {
        activeSheetName: SpreadsheetApp.getActiveSheet().getName(),
        selectionRange: 'selectionRange',
        activeCell : 'activeCell'
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

    sheet.getRange('A2:B2').setValues([['XANADU MAKADI BAY', hotelIdFormulaeForRow(2)]]);

    sheet.setFrozenRows(1);
}