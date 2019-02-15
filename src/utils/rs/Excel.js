
export function exportExcel(JSONData, FileName, ShowLabel) {
  let arrData = typeof JSONData !== 'object' ? JSON.parse(JSONData) : JSONData;
  let table = '<table>';
  let row = "<tr>";
  for (let i = 0, l = ShowLabel.length; i < l; i += 1) {
    row += `<th style='text-align:${ShowLabel[i].align||'left'}'>` + ShowLabel[i].value + '</th>';
  }
  table += row + "</tr>";
  for (let i = 0; i < arrData.length; i += 1) {
    let row = "<tr>";
    for (let index in arrData[i]) {
      let value = arrData[i][index].value === "." ? "" : arrData[i][index].value;
      row +=value? `<td style='${arrData[i][index].style}' ${arrData[i][index].rowspan?`rowspan=${arrData[i][index].rowspan}`:''}>` + value + '</td>':'<td></td>';
    }
    table += row + "</tr>";
  }
  table += "</table>";
  let excelFile = "<html  " +
    "xmlns:v='urn:schemas-microsoft-com:vml'" +
    "xmlns:o='urn:schemas-microsoft-com:office:office' " +
    "xmlns:x='urn:schemas-microsoft-com:office:excel' " +
    "xmlns:m='http://schemas.microsoft.com/office/2004/12/omml' " +
    "xmlns='http://www.w3.org/TR/REC-html40'>";
  excelFile += '<meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">';
  excelFile += '<meta http-equiv="content-type" content="application/vnd.ms-excel';
  excelFile += '; charset=UTF-8">';
  excelFile += "<head>";
  excelFile += "<!--[if gte mso 9]>";
  excelFile += "<xml>";
  excelFile += "<x:ExcelWorkbook>";
  excelFile += "<x:ExcelWorksheets>";
  excelFile += "<x:ExcelWorksheet>";
  excelFile += "<x:Name>";
  excelFile += "{worksheet}";
  excelFile += "</x:Name>";
  excelFile += "<x:WorksheetOptions>";
  excelFile += "<x:DisplayGridlines/>";
  excelFile += "</x:WorksheetOptions>";
  excelFile += "</x:ExcelWorksheet>";
  excelFile += "</x:ExcelWorksheets>";
  excelFile += "</x:ExcelWorkbook>";
  excelFile += "</xml>";
  excelFile += "<![endif]-->";
  excelFile += "</head>";
  excelFile += "<body>";
  excelFile += table;
  excelFile += "</body>";
  excelFile += "</html>";
  let uri = 'data:application/vnd.ms-excel;charset=utf-8,' + encodeURIComponent(excelFile);
  let link = document.createElement("a");
  link.href = uri;
  link.style = "visibility:hidden";
  link.download = FileName + ".xls";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportCsv(jsonData,label, fileName) {
  //列标题，逗号隔开，每一个逗号就是隔开一个单元格
  let str = `${label}\n`;
  //增加\t为了不让表格显示科学计数法或者其他格式
  for(let i = 0 ; i < jsonData.length ; i++ ){
    for(let item in jsonData[i]){
      str+=`${jsonData[i][item] + '\t'},`;
    }
    str+='\n';
  }
  //encodeURIComponent解决中文乱码
  let uri = 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(str);
  //通过创建a标签实现
  var link = document.createElement("a");
  link.href = uri;
  //对下载的文件命名
  link.download =  `${fileName}.csv`;
  document.body.appendChild(link);
  link.click();

}

