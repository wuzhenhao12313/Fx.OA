const LoadingService = {}

const show = (type, tip) => {
  const loading = document.getElementById('my-loading-service');
  const tipContainer = document.getElementById('my-loading-service-tip');
  let hasTip = '';
  switch (type) {
    case 'submit':
      hasTip = "正在往服务器提交数据,请稍后...";
      break;
    case 'load':
      hasTip = "正在从服务器加载数据,请稍后...";
      break;
  }
  tipContainer.innerHTML = tip === undefined ? hasTip : tip;
  loading.style.display = "block";
}

LoadingService.Start = (tip) => {
  show('submit', tip);
};

LoadingService.Done = (time) => {
  const loading = document.getElementById('my-loading-service');
  if (time) {
    setTimeout(() => {
      loading.style.display = "none";
    }, time);
  } else {
    loading.style.display = "none";
  }
}


export default LoadingService;
