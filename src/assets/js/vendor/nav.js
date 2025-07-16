// ==========================================
// 1. 유틸리티 함수
// ==========================================
$.exists = function (selector) {
  return $(selector).length > 0;
};

// ==========================================
// 2. PC GNB 관련 코드
// ==========================================

// GNB 관련 요소 선택
var $gnb = $("#gnb");
var $gnbList = $gnb.children("ul");
var $gnbItem = $gnbList.children("li");
var $gnb_dep2 = $gnbItem.children(".gnb--dep02");
var $gnbBg = $(".gnb-overlay-bg");
var gnbLength = $gnbItem.length;

// 문서 로드 시 초기화
$(document).ready(function () {
  if ($gnb.is(".total-menu")) {
    openTotalMenu();
  } else if ($gnb.is(".each-menu")) {
    openEachMenu();
  }

  $gnb_dep2.hover(
    function () {
      $(this).parent("li").addClass("on");
    },
    function () {
      $gnbItem.removeClass("on");
    }
  );
  if ($.exists(".sub-prev-page-btn") || $.exists(".sub-next-page-btn")) {
    checkPrevNextLink();
  }
});

// 전체 GNB 메뉴 함수 (total-menu)
function openTotalMenu() {
  $gnbItem.children("a").on("mouseenter focus", function () {
    $gnbItem.removeClass("on");
    $("#header").addClass("gnb-open");
    $(this).parent("li").addClass("on");
    if (!$gnb.is(".open")) {
      $gnb.addClass("open");
      $gnbBg.addClass("open");
    }
  });

  $gnbList.on("mouseleave", gnb_return);
  $gnbList.find("a").last().on("focusout", gnb_return);

  function gnb_return() {
    $("#header").removeClass("gnb-open");
    $gnb.removeClass("open");
    $gnbItem.removeClass("on");
    $gnbBg.removeClass("open");
  }
}

// ==========================================
// 3. 모바일 메뉴
// ==========================================

// 모바일 버튼 클릭 이벤트
$(".mobile-button").on("click", function () {
  if ($(".header--top").is(".schActive")) {
    $(".header--top").removeClass("schActive");
    return false;
  }

  if ($body.is(".mm-open")) {
    $body.removeClass("mm-open");
  } else {
    $body.addClass("mm-open");
  }
});

// 모바일 GNB
let $body = $("body"),
  $window = $(window),
  $windowWidth = $window.width();

$(".lv1-li > a").on("click", function () {
  let $li = $(this).parent("li");
  if ($li.hasClass("active")) {
    $li.removeClass("active");
  } else {
    $li.siblings("li").removeClass("active");
    $li.addClass("active");
  }
  return false;
});

// ==========================================
// 4. LNB (Breadcrumb)
// ==========================================

$("#breadcrumb .toggle").on("click", function () {
  let $li = $(this).parent("li");
  if (!$li.hasClass("active")) {
    $li.addClass("active").siblings("li").removeClass("active");
  } else {
    $li.removeClass("active");
  }
  return false;
});

// 헤더 함수 정의 및 실행
function headers() {
  var header = document.querySelector(".main-header");
  var tabSticky = document.querySelector(".tab--stiky");
  var breadcrumb = document.querySelector(".breadcrumb");
  var breadcrumbTop = header.offsetHeight;
  var lastScrollY = window.pageYOffset || document.documentElement.scrollTop;

  function updateScrollDirection() {
    var currentScrollY =
      window.pageYOffset || document.documentElement.scrollTop;
    var isScrollingDown = currentScrollY > lastScrollY;

    // body에 mm-open 클래스가 있으면 항상 header/tab에 'up' 클래스
    if (document.body.classList.contains("mm-open")) {
      header.classList.add("up");
      tabSticky && tabSticky.classList.add("up");
      lastScrollY = currentScrollY;
      return;
    }

    if (header.classList.contains("_sub") && breadcrumb) {
      if (currentScrollY >= breadcrumbTop) {
        if (isScrollingDown) {
          header.classList.add("hide");
          header.classList.remove("up");
          tabSticky && tabSticky.classList.add("hide");
          tabSticky && tabSticky.classList.remove("up");
        } else {
          header.classList.remove("hide");
          header.classList.add(
            currentScrollY > 0 ? "up" : "up",
            currentScrollY > 0 ? "" : ""
          );
          tabSticky && tabSticky.classList.remove("hide");
          tabSticky &&
            tabSticky.classList.add(currentScrollY > 0 ? "up" : "up");
        }
      } else {
        header.classList.remove("hide", "up");
        tabSticky && tabSticky.classList.remove("hide", "up");
      }
    } else {
      if (isScrollingDown) {
        header.classList.add("hide");
        header.classList.remove("up");
        tabSticky && tabSticky.classList.add("hide");
        tabSticky && tabSticky.classList.remove("up");
      } else {
        header.classList.remove("hide");
        header.classList.toggle("up", currentScrollY > 0);
        tabSticky && tabSticky.classList.remove("hide");
        tabSticky && tabSticky.classList.toggle("up", currentScrollY > 0);
      }
    }

    lastScrollY = currentScrollY;
  }

  // 초기 스크롤 상태 반영
  document.addEventListener("DOMContentLoaded", function () {
    lastScrollY = window.pageYOffset || document.documentElement.scrollTop;

    // body.mm-open
    if (document.body.classList.contains("mm-open")) {
      header.classList.add("up");
      tabSticky && tabSticky.classList.add("up");
    }
    // 서브페이지 + breadcrumb
    else if (header.classList.contains("_sub") && breadcrumb) {
      var _breadcrumbTop =
        breadcrumb.getBoundingClientRect().top + window.scrollY;
      if (lastScrollY >= _breadcrumbTop) {
        header.classList.add("up", "hide");
        tabSticky && tabSticky.classList.add("up", "hide");
      } else {
        header.classList.remove("up", "hide");
        tabSticky && tabSticky.classList.remove("up", "hide");
      }
    }
    // 기본 페이지
    else {
      if (lastScrollY > 50) {
        header.classList.add("up", "hide");
        tabSticky && tabSticky.classList.add("up", "hide");
      } else {
        header.classList.remove("up", "hide");
        tabSticky && tabSticky.classList.remove("up", "hide");
      }
    }
  });

  // 스크롤 이벤트 리스너 추가
  window.addEventListener("scroll", updateScrollDirection);
}

headers();
