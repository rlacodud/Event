console.log('load');

var transformEl = document.querySelector('.transform-wrap');

var section = document.querySelectorAll('section');

var horizontalSectionWrap1 = document.querySelector('.horizontal-section-wrap1');
var horizontalSectionWrap2 = document.querySelector('.horizontal-section-wrap2');
var horizontalArticle1 = document.querySelectorAll('.horizontal-section-wrap1 article');
var horizontalArticle2 = document.querySelectorAll('.horizontal-section-wrap2 article');

var contents = document.querySelectorAll('.contents');
var vertical = document.querySelectorAll('.vertical');
var horizontal = document.querySelectorAll('.horizontal');

/* 제어용 변수 선언 */
var index = 0;
var indexY = 0;
var indexX = 0;
var transY = 0;
var transX = 0;
var scrollCheck = true;
window.onload = function(){
  function onScrollW(e){
    if(e.wheelDelta < 0 && index < contents.length -1){ // 아래로 스크롤 감지
      index++;
      scrollCheck = true;
      if(index <= 2){
        indexY++;
      }else if(index > 2 && index <= 09){
        indexX++;
      }else if(index > 09 && index <= 16){
        indexY++;
      }
      // else if(index > 12 && index <= 13){
      //   indexX++;
      // }
    }else if(e.wheelDelta > 0 && index > 0){ // 위로 스크롤 감지
      index--;
      scrollCheck = false;
      if(index < 2){
        indexY--;
      }else if(index >= 2 && index < 09){
        indexX--;
      }else if(index >= 09 && index <= 16){
        indexY--;
      }
    }
    transY = indexY * -100;
    transformEl.style.transform = "translateY(" + transY + "vh)";
    transformEl.style.transition = "all 0.8s ease";

    transX = indexX * -100;
    horizontalSectionWrap1.style.transform = "translateX(" + transX + "vw)";
    horizontalSectionWrap1.style.transition = "all 0.8s ease";
    horizontalSectionWrap2.style.transform = "translateX(" + transX + "vw)";
    horizontalSectionWrap2.style.transition = "all 0.8s ease";

    console.log(index, indexX , indexY);
  }
  
  function horizontalWidthSetting(){
    horizontalSectionWrap1.style.width = (100 * horizontalArticle1.length) + "vw"; 
    horizontalSectionWrap2.style.width = (100 * horizontalArticle2.length) + "vw";
    // horizontalSection의 가로 크기를 내부에 있는 section의 갯수에 따라 크기 조정
  }

  function addEvent(){
    window.addEventListener('mousewheel', onScrollW);
  }

  function init(){
    horizontalWidthSetting();
    addEvent();
  }
  init();
}



