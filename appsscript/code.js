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

// Number.prototype.isBetween = function (min, max) {
//     return this >= min && this <= max;
// };

function intersectDataRanges(sheet, ...ranges) {
    return ranges.reduce((intersection, range) => {
        if (intersection) {
            const iRangeRowStart = Math.max(intersection.getRow(), range.getRow());
            const iRangeRowEnd = Math.min(intersection.getLastRow(), range.getLastRow());
            const iRangeColumnStart = Math.max(intersection.getColumn(), range.getColumn());
            const iRangeColumnEnd = Math.min(intersection.getLastColumn(), range.getLastColumn());
            let intersection_range;
            try {
                intersection_range = sheet.getRange(iRangeRowStart, iRangeColumnStart, iRangeRowEnd - iRangeRowStart + 1, iRangeColumnEnd - iRangeColumnStart + 1);
            } catch (ex) {}
            return intersection_range;
        }
    }, sheet.getDataRange());
}

function fillRangeWithSameValue(rangeA1, value) {
    const sheet = SpreadsheetApp.getActiveSheet();
    const range = sheet.getRange(rangeA1);
    const rows_in_range = range.getLastRow() - range.getRow() + 1;
    const columns_in_range = range.getLastColumn() - range.getColumn() + 1;
    const values4range = new Array(rows_in_range).fill(new Array(columns_in_range).fill(value));
    range.setValues(values4range);
}

function pullState() {
    const activeSheet = SpreadsheetApp.getActiveSheet();
    const activeRange = activeSheet.getActiveRange();
    const selectionHeaders = getHeadersInRange(activeRange);
    let timeframeValues, timeframeRange;
    const timeframeColumnIdx = selectionHeaders.indexOf('timeframe');
    if (~timeframeColumnIdx) {
        timeframeRange = intersectDataRanges(activeSheet, activeRange, activeSheet.getRange(2, timeframeColumnIdx + activeRange.getColumn(), activeSheet.getLastRow() - 1, 1));
        timeframeValues = timeframeRange?.getValues()[0];
    }
    let nightsValues, nightsRange;
    const nightsColumnIdx = selectionHeaders.indexOf('nights');
    if (~nightsColumnIdx) {
        nightsRange = intersectDataRanges(activeSheet, activeRange, activeSheet.getRange(2, nightsColumnIdx + activeRange.getColumn(), activeSheet.getLastRow() - 1, 1));
        nightsValues = nightsRange?.getValues()[0];
    }
    return {
        isActiveSheetEmpty: activeSheet.getDataRange().isBlank(),
        activeSheetName:  activeSheet.getName(),
        selectionRange:   activeRange.getA1Notation(),
        selectionHeaders,
        timeframeRange: timeframeRange?.getA1Notation(),
        timeframeValues,
        nightsRange: nightsRange?.getA1Notation(),
        nightsValues,
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