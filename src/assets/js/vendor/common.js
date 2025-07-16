$(function () {
  var ui = {};
  gsap.registerPlugin(ScrollTrigger);

  if (!$("#fullpage")) {
    gsap.fromTo(
      "#btnTop",
      { autoAlpha: 0, y: 50 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "body",
          start: "top -100", // 100px 이상 스크롤되면
          toggleActions: "play none none reverse", // markers: true
        },
      }
    );

    document.querySelector("#btnTop").addEventListener("click", (e) => {
      e.preventDefault();
      gsap.to(window, { scrollTo: 0, duration: 0.8, ease: "power2.out" });
    });
  }

  document.querySelectorAll('[data-js="es-tab"]').forEach((tabContainer) => {
    const buttons = tabContainer.querySelectorAll("button");
    const panel = tabContainer.nextElementSibling; // 바로 다음에 .es-tab-panel이 있다고 가정
    const contents = panel.querySelectorAll(".es-tab-content");
    if (!panel || !panel.classList.contains("es-tab-panel")) {
    } else {
      buttons.forEach((button) => {
        button.addEventListener("click", () => {
          // 버튼 상태 변경
          buttons.forEach((btn) => btn.setAttribute("aria-selected", "false"));
          button.setAttribute("aria-selected", "true");

          // 콘텐츠 토글
          const targetId = button.getAttribute("data-tab").replace("#", "");
          contents.forEach((content) => {
            if (content.id === targetId) {
              content.classList.remove("hidden");
            } else {
              content.classList.add("hidden");
            }
          });
        });
      });
    }
  });

  (function () {
    let currentTooltip = null;
    /**
     * 툴팁 열기
     * @param {Object} options - 옵션 객체
     * @param {HTMLElement} options.target - 툴팁 기준 대상 (버튼)
     * @param {string} [options.title] - 툴팁 제목 (옵션, 없으면 data-title 사용)
     * @param {string} [options.content] - 툴팁 내용 (옵션, 없으면 data-content 사용)
     * @param {HTMLElement} [options.container] - 툴팁을 삽입할 컨테이너 (기본: id="tooltip-root", 없으면 document.body)
     * @param {string|Array} [options.classes] - 추가로 넣을 클래스 (문자열 또는 배열)
     * @param {string} [options.width] - tooltip의 width (예: "300px", "50%")
     * @param {string} [options.height] - tooltip의 height (예: "200px")
     */
    window.openTooltip = function (options) {
      const target = options.target;
      if (!target) {
        return;
      }
      if (!options || !options.target) {
        return;
      }

      const title = target.hasAttribute("data-title")
        ? target.getAttribute("data-title")
        : typeof options.title !== "undefined"
        ? options.title
        : "제목 없음";

      const content = target.hasAttribute("data-content")
        ? target.getAttribute("data-content")
        : typeof options.content !== "undefined"
        ? options.content
        : "내용 없음";

      const container =
        options.container ||
        document.getElementById("tooltip-root") ||
        document.body;

      // 이미 툴팁이 열려 있으면 닫고, 같은 대상이면 리턴
      if (currentTooltip) {
        const prevTarget = currentTooltip.target;
        closeTooltip();
        if (prevTarget === target) {
          return;
        }
      }

      // 툴팁 생성
      const tooltip = document.createElement("div");
      tooltip.className = "tooltip";

      // 추가 클래스 옵션이 있으면 적용 (문자열 또는 배열)
      if (options.classes) {
        if (Array.isArray(options.classes)) {
          options.classes.forEach((cls) => tooltip.classList.add(cls));
        } else {
          tooltip.classList.add(options.classes);
        }
      }

      tooltip.innerHTML = `
            <div class="tooltip-container">
                <div class="tooltip-header">
                    <h4 id="tooltip-title">${title}</h4>
                </div>
                <div id="tooltip-body">
                    <div class="tooltip-content">${content}</div>
                </div>
                <button id="close-tooltip" title="닫기"><i></i></button>
            </div>
            `;
      container.appendChild(tooltip);

      target.setAttribute("aria-pressed", "true");

      const tooltipContent = tooltip
        .querySelector("#tooltip-body")
        .querySelector(".tooltip-content");
      if (options.width) {
        tooltipContent.style.width = options.width;
      }
      if (options.height) {
        tooltipContent.style.height = options.height;
      }

      // 툴팁 위치 설정 (target 버튼의 아래쪽에 위치)
      const rect = target.getBoundingClientRect();
      tooltip.style.position = "absolute";
      tooltip.style.top = `${rect.bottom + window.scrollY}px`;
      //tooltip.style.left = `${rect.left + window.scrollX}px`;
      tooltip.style.left = `${
        rect.right + window.scrollX - tooltip.offsetWidth
      }px`;

      requestAnimationFrame(() => {
        const rect = target.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        tooltip.style.position = "absolute";
        tooltip.style.top = `${rect.bottom + window.scrollY}px`;

        // 툴팁이 왼쪽으로 삐져나가면 자동 조정
        let left = rect.right + window.scrollX - tooltipRect.width;
        if (left < 0) {
          left = rect.left + window.scrollX;
        } // 너무 왼쪽이면 버튼 기준으로

        tooltip.style.left = `${left}px`;
      });

      // 닫기 버튼 이벤트 추가
      const closeButton = tooltip.querySelector("#close-tooltip");
      closeButton.addEventListener("click", closeTooltip);
      closeButton.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          closeTooltip();
        }
      });

      // ESC키로 닫기, 바깥 클릭 감지
      document.addEventListener("keydown", handleEscapeKey);
      document.addEventListener("click", handleOutsideClick);

      currentTooltip = { tooltip, target };

      // 툴팁 열리면 닫기 버튼으로 포커스 이동
      closeButton.focus();
    };

    /**
     * 툴팁 닫기
     */
    window.closeTooltip = function () {
      if (currentTooltip) {
        currentTooltip.tooltip.remove();
        currentTooltip.target.focus(); // 툴팁을 연 버튼으로 포커스 이동
        currentTooltip.target.setAttribute("aria-pressed", "false");
        currentTooltip = null;
        document.removeEventListener("click", handleOutsideClick);
        document.removeEventListener("keydown", handleEscapeKey);
        window.addEventListener("resize", closeTooltip);
      }
    };

    /**
     * ESC 키로 툴팁 닫기
     */
    function handleEscapeKey(event) {
      if (event.key === "Escape") {
        closeTooltip();
      }
    }

    /**
     * 툴팁 외부 클릭 감지
     */
    function handleOutsideClick(event) {
      if (
        currentTooltip &&
        !currentTooltip.tooltip.contains(event.target) &&
        !currentTooltip.target.contains(event.target)
      ) {
        closeTooltip();
      }
    }
  })();

  /**
   * UI 토글 함수
   * @param {String} toggleID - 토글될 요소의 data-toggle-id
   * @param {String} action - 'open' 또는 'close'
   * @param {HTMLElement} btn - 토글 버튼 요소
   * @param {Object} opt - 옵션 (ani: 애니메이션 여부)
   */
  ui.toggle = function (toggleID, action, btn, opt) {
    var elm = $("[data-toggle-id=" + toggleID + "]");
    var $btn = $(btn);

    if (action) {
      if (action === "open") {
        $btn.addClass("active");
        elm.removeClass("toggle-hidden");
      } else if (action === "close") {
        $btn.removeClass("active");
        elm.addClass("toggle-hidden");
      }
    } else {
      // 토글 상태에 따라 처리
      if (!elm.hasClass("toggle-hidden")) {
        if (opt && opt.ani) {
          elm.stop().slideUp(250);
        }
        $btn.removeClass("active");
        elm.addClass("toggle-hidden");
      } else {
        if (opt && opt.ani) {
          elm.stop().slideDown(250);
        }
        $btn.addClass("active");
        elm.removeClass("toggle-hidden");
      }
    }
  };

  /**
   * 탭 네비게이션 초기화 함수
   * @param {jQuery} $nav - 탭 네비게이션 요소
   */
  var tabNav = function ($nav) {
    var tabIds = [];
    var callbackName = $nav.data("callback");
    var callback =
      typeof window[callbackName] === "function" ? window[callbackName] : null;

    // 모든 탭 콘텐츠를 닫는 함수
    var toggleAllHidden = function () {
      $.each(tabIds, function (_, id) {
        ui.toggle(id, "close");
      });
    };

    // 이 nav 안 모든 버튼에 클릭 핸들러 등록
    $nav.find("button").each(function () {
      var $btn = $(this);
      var id = $btn.data("id");

      // 열거할 탭 아이디 수집
      if (tabIds.indexOf(id) < 0) {
        tabIds.push(id);
      }

      $btn.on("click", function () {
        var targetId = $btn.data("id");

        // ★ 이 data-id 버튼을 포함한 모든 nav만 골라낸다
        var $syncNavs = $("[data-js=tabNav]").filter(function () {
          return $(this).find('button[data-id="' + targetId + '"]').length > 0;
        });

        // 1) 해당 nav들에서만 active 제거
        $syncNavs.find("> li").removeClass("active");

        // 2) 해당 nav들에서 같은 data-id 버튼의 부모(li)에만 active 추가
        $syncNavs
          .find('button[data-id="' + targetId + '"]')
          .parent()
          .addClass("active");

        // 콘텐츠 토글
        toggleAllHidden();
        ui.toggle(targetId, "open");

        if (callback) {
          callback(targetId, $btn);
        }
      });
    });
  };

  var uiSetTabNav = function () {
    $("[data-js=tabNav]").each(function () {
      var $this = $(this);
      if (!$this.hasClass("hastabnav")) {
        $this.addClass("hastabnav");
        tabNav($this);
      }
    });
  };

  uiSetTabNav();

  // 토글 이벤트 핸들러
  $(".single_toggle").click(function () {
    $(this).toggleClass("active");
  });

  $(".plural_toggle").click(function () {
    $(this).toggleClass("active").siblings().removeClass("active");
  });

  $(".plural_on").click(function () {
    $(this).addClass("active").siblings().removeClass("active");
  });
  $(".parent_toggle").click(function () {
    $(this).parent().toggleClass("active");
  });

  $(".parents_toggle").click(function () {
    $(this).parent().toggleClass("active").siblings().removeClass("active");
  });

  // 상세검색 토글
  $(".detail-search-btn").click(function () {
    $(this).toggleClass("on");
    $(".detail--search, .detail-search-dimmed").toggleClass("on");
  });

  // 로그인 모달 관련
  $(".position-btn").click(function () {
    $(".login-wrap").addClass("on");
  });
  $("#modal-login .modal--close").click(function () {
    $(".login-wrap").removeClass("on");
  });
});

// jQuery UI Datepicker 기본 설정 (한국어)
$.datepicker.setDefaults({
  closeText: "닫기",
  prevText: "이전달",
  nextText: "다음달",
  currentText: "오늘",
  monthNames: [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ],
  monthNamesShort: [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ],
  dayNames: [
    "일요일",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일",
  ],
  dayNamesShort: ["일", "월", "화", "수", "목", "금", "토"],
  dayNamesMin: ["일", "월", "화", "수", "목", "금", "토"],
  weekHeader: "주",
  dateFormat: "yy.m.d",
  firstDay: 0,
  isRTL: false,
  showMonthAfterYear: true,
  yearSuffix: "년",
});

// Datepicker 초기화 (오늘 이후 날짜만 선택)
$(".datepicker").datepicker({
  minDate: 0,
});

// 모달 처리 객체 (ModalHandler)
const ModalHandler = {
  open: function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = "block";
      modal.classList.add("active");
    }
  },

  close: function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = "none";
      modal.classList.remove("active");
    }
  },

  initializeCloseButtons: function () {
    document.querySelectorAll(".close-btn").forEach((button) => {
      button.addEventListener("click", function () {
        const modal = this.closest(".modal-wrap");
        if (modal) {
          modal.style.display = "none";
          modal.classList.remove("active");
        }
      });
    });
  },
};

// 모달 닫기 버튼 초기화
ModalHandler.initializeCloseButtons();

// Snb Menu: 사이드 네비게이션 드롭다운 메뉴 처리
document.addEventListener("DOMContentLoaded", function () {
  const menuButtons = document.querySelectorAll(".snb-button");

  menuButtons.forEach((button) => {
    // 버튼 바로 다음 요소(드롭다운 메뉴)를 선택
    const dropdown = button.nextElementSibling;

    button.addEventListener("click", function () {
      const isActive = button.classList.contains("active");

      // 모든 메뉴 버튼과 드롭다운 초기화
      menuButtons.forEach((btn) => btn.classList.remove("active"));
      document.querySelectorAll(".snb-depth").forEach((menu) => {
        menu.classList.remove("visible");
        menu.classList.add("hidden");
      });

      // 현재 버튼이 비활성 상태라면 활성화 후 드롭다운 표시
      if (!isActive) {
        button.classList.add("active");
        dropdown.classList.remove("hidden");
        dropdown.classList.add("visible");
      }
    });
  });
});

// New_Sub
gsap.registerPlugin(ScrollTrigger);

var Business = Business || {};

Business.utils = {
  portfolio: function (scrollTrue) {
    const mm = gsap.matchMedia();
    const $portList = $(".data-section_wrap");

    let windowInnerHaifWidth, innerRight;

    function setupVariables() {
      windowInnerHaifWidth = ($(window).width() - 980) / 2;
      innerRight = $(window).width() - 50;
    }

    function scrollMotion() {
      ScrollTrigger.getAll().forEach((st) => st.kill());
      $portList.find("li").removeClass("motion");
      gsap.set($portList.find("li"), { clearProps: "all" });

      $portList.addClass("scroll-motion-on").removeClass("scroll-motion-off");

      $portList.find("li").each(function (idx, target) {
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: $(".data-section")[0],
            start: "center center",
            end: () => "+=" + $portList.find("ul").width(),
            pin: true,
            scrub: 1,
            snap: false,
            onUpdate: () => {
              if (innerRight > $(target).offset().left) {
                $(target).addClass("motion");
              } else {
                $(target).removeClass("motion");
              }
            },
          },
        });

        timeline
          .to($(".motion_blank"), { duration: 0.2, x: -100 })
          .to($(target), {
            x: -($portList.find("ul").width() - 980),
            ease: "none",
            duration: 1,
          })
          .to(
            $(".progress_wrap").find(".progress"),
            {
              width: "100%",
              duration: 1,
            },
            "0.2"
          )
          .to($(".motion_blank"), { duration: 0.2, x: 0 });
      });

      ScrollTrigger.refresh();
    }

    function clearMotion() {
      ScrollTrigger.getAll().forEach((st) => st.kill());
      $portList.find("li").removeClass("motion");
      gsap.set($portList.find("li"), { clearProps: "all" });
      $portList.addClass("scroll-motion-off").removeClass("scroll-motion-on");
    }

    mm.add("(min-width: 1024px)", () => {
      setupVariables();
      if (scrollTrue) {
        scrollMotion();
      }

      return () => {
        clearMotion();
      };
    });

    $(window).on("load resize", () => {
      setupVariables();
      ScrollTrigger.refresh();
    });

    $portList.find(".data-heading").on("click", function () {
      const windowWidth = $(window).width();
      $(this).closest("li").addClass("unfold").removeClass("fold");
      $(this)
        .closest("li")
        .siblings("li")
        .addClass("fold")
        .removeClass("unfold");

      if (windowWidth > 1024) {
        $(this)
          .closest("li")
          .siblings("li")
          .find(".scroll")
          .mCustomScrollbar("scrollTo", "top", {
            scrollInertia: 0,
          });
      }
    });
  },

  init: function () {
    Business.utils.portfolio(true);
  },
};

Business.utils.init();

function setupCountAnimation() {
  document.querySelectorAll(".count").forEach((el) => {
    const targetStr = el.dataset.target.replace(/,/g, "");
    const target = parseFloat(targetStr);
    const hasDecimal = targetStr.includes(".");

    ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      onEnter: () => {
        const obj = { value: 0 };
        gsap.to(obj, {
          value: target,
          duration: 2,
          ease: "power1.out",
          onUpdate() {
            let displayValue = hasDecimal
              ? obj.value.toFixed(1)
              : Math.floor(obj.value);
            el.textContent = Number(displayValue).toLocaleString();
          },
        });
      },
    });
  });
}

// 한 페이지에 여러 메뉴가 있는 구조로 함수로 변경하고 각 함수에서 호출 해야됨 (개발팀 수정 - 0619)
//setupCountAnimation();

// let scrolled = false;
// window.addEventListener('wheel', (e) => {
//     const firstPage = document.getElementById('first-video');
//     if (!scrolled && e.deltaY > 0 && window.scrollY < window.innerHeight) {
//         scrolled = true;
//         window.scrollTo({
//             top: firstPage.offsetHeight,
//             behavior: 'smooth'
//         });
//         setTimeout(() => scrolled = false, 1000);
//     }
// });

// js import 순서에 따라서 실행되지 않는 부분과 선택 시 하위 메뉴 선택되도록 수정 (개발팀 수정 - 0619)
$(document).ready(function () {
  document
    .querySelectorAll(".first--video--tab li button")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const id = $(button).data("id");
        $("button[data-id='" + id + "']").trigger("click");
        const firstPage = document.getElementById("first-video");
        if (window.scrollY < firstPage.offsetHeight) {
          window.scrollTo({
            top: firstPage.offsetHeight,
            behavior: "smooth",
          });
        }
      });
    });
});

function setupFadeUpWithObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target;

        if (entry.isIntersecting) {
          // 애니메이션 실행
          gsap.fromTo(
            el,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: "power2.out",
              onComplete: () => {
                // 상태를 복구해서 다시 나갔다 들어올 때도 동작하도록
                el.style.opacity = "";
                el.style.transform = "";
              },
            }
          );
        } else {
          // 뷰포트 벗어났을 때 초기화
          el.style.opacity = 0;
          el.style.transform = "translateY(20px)";
        }
      });
    },
    {
      threshold: 0.1,
    }
  );

  document.querySelectorAll(".fade-up").forEach((el) => {
    // 초기 상태 세팅
    el.style.opacity = 0;
    el.style.transform = "translateY(20px)";
    observer.observe(el);
  });
}

window.addEventListener("load", setupFadeUpWithObserver);

window.addEventListener("resize", () => {
  ScrollTrigger.refresh();
});



// 차트 드롭다운
document.querySelectorAll('li > label > .arrow').forEach(function(span) {
  span.addEventListener('click', function(e) {
    const li = this.closest('li');
    li.classList.toggle('active');
    e.stopPropagation();
  });
});