const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function formatTime(time, format) {
  let temp = '0000000000' + time
  let len = format.length
  return temp.substr(-len)
}
function formatTimeByNew(value,format) {
  const formateArr = ['Y', 'M', 'D', 'h', 'm', 's'];
  let returnArr = [];
  if(value) {
    let date
    if(value < 1000000000000){
      date = new Date(value * 1000) // 时间戳为秒：10位数
    }else{
      date = new Date(value)    // 时间戳为毫秒：13位数
    }
      let year = date.getFullYear()
      let month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
      let day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()
      let hour = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()
      let minute = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()
      let second = date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds()
      returnArr.push(year, month, day, hour, minute, second)
      returnArr = returnArr.map(formatNumber);
      for (var i in returnArr) {
        format = format.replace(formateArr[i], returnArr[i]);
      }
      return format;
      //return `${year}-${month}-${day} ${hour}:${minute}:${second}`
  } else {
      return ''
  }
}

module.exports = {
  formatTime: formatTime,
  formatTimeByNew:formatTimeByNew,
  getNowTime:getNowTime,
  getNowTime2:getNowTime2
}

function getNowTime(){
var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var day = now.getDate();
   var h = now.getHours();
  var m = now.getMinutes();
  var s = now.getSeconds();
  if (month < 10) {
    month = '0' + month;
  };
  if (day < 10) {
    day = '0' + day;
  };
  if (h < 10) {
    h = '0' + h;
  };
  if (m < 10) {
    m = '0' + m;
  };
  if (s < 10) {
    s = '0' + s;
  };
 
  var formatDate =  year + '-' + month + '-' + day+ ' ' + h+ ':' + m+ ':' + s;
  return formatDate;

} 

function getNowTime2(){
  var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    if (month < 10) {
      month = '0' + month;
    };
    if (day < 10) {
      day = '0' + day;
    };
   
    var formatDate =  year + '-' + month + '-' + day;
    return formatDate;
  
  } 