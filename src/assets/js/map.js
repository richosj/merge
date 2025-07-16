// use a script tag or an external JS file
document.addEventListener("DOMContentLoaded", () => {

    // GSAP 및 ScrollTrigger 플러그인 등록
    gsap.registerPlugin(ScrollTrigger);

    /* ------------------------------------------
        Lenis 
    --------------------------------------------- */
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const lenis = new Lenis({
        duration: isMobile ? 1.5 : 2,
        easing: isMobile
            ? (t) => t // 모바일에서는 간단한 선형 easing
            : (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // 초기 스크롤 정지 후 1초 뒤에 재시작
    lenis.stop();
    setTimeout(() => {
        gsap.timeline({
            onComplete: () => {
                lenis.start();
            },
        });
    }, 1000);

    /* ------------------------------------------
        섹션 애니메이션 가로 스크롤 애니메이션

    --------------------------------------------- */
    ScrollTrigger.matchMedia({
        // 데스크탑 (최소 768px 이상)
        "(min-width: 768px)": function() {
            const sections = gsap.utils.toArray(".section--Effect--hide");
            sections.forEach((section, index) => {
                const isLastSection = index === sections.length - 1;
                const textElements = section.querySelectorAll(".text-scrolling");

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: section,
                        start: "top top",
                        end: "bottom top",
                        scrub: 0.8,
                        pin: true,
                        pinSpacing: isLastSection ? true : false,
                    },
                });

                tl.from(section, {
                        opacity: 0,
                        y: 50,
                        duration: 0.8,
                        ease: "power2.out",
                    })
                    .from(textElements, {
                        opacity: 0,
                        y: 30,
                        duration: 0.6,
                        ease: "power2.out",
                        stagger: 0.2,
                    })
                    .to(textElements, {
                        opacity: 0,
                        y: -30,
                        duration: 0.6,
                        ease: "power2.in",
                    })
                    .to(section, {
                        opacity: 0,
                        y: -50,
                        scale: 1.1,
                        duration: isLastSection ? 1.5 : 1,
                        ease: "power2.in",
                        onComplete: () => {
                            ScrollTrigger.refresh();
                        },
                    });
            });

            // 3-2. 가로 스크롤 애니메이션 (.section--horizontal)
            const horizontalSection = document.querySelector(".section--horizontal");
            if (horizontalSection) {
                gsap.to(horizontalSection, {
                    x: () => -(horizontalSection.scrollWidth - window.innerWidth),
                    ease: "none",
                    scrollTrigger: {
                        trigger: horizontalSection,
                        start: "top top",
                        end: () => `+=${horizontalSection.scrollWidth - window.innerWidth}`,
                        scrub: true,
                        pin: true,
                        anticipatePin: 1,
                        invalidateOnRefresh: true,
                    },
                });
            }
        },

        // 모바일 (최대 767px 이하)
        "(max-width: 767px)": function() {
            // 섹션 애니메이션 (.section--Effect--hide)
            const sections = gsap.utils.toArray(".section--Effect--hide");
            sections.forEach((section, index) => {
                const isLastSection = index === sections.length - 1;
                const textElements = section.querySelectorAll(".text-scrolling");

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: section,
                        start: "top top",
                        end: "bottom top",
                        scrub: 1,
                        pin: true,
                        pinSpacing: isLastSection ? true : false,
                    },
                });

                tl.from(section, {
                        opacity: 0,
                        y: 50,
                        duration: 0.8,
                        ease: "power2.out",
                    })
                    .from(textElements, {
                        opacity: 0,
                        y: 30,
                        duration: 0.6,
                        ease: "power2.out",
                        stagger: 0.2,
                    })
                    .to(textElements, {
                        opacity: 0,
                        y: -30,
                        duration: 0.6,
                        ease: "power2.in",
                    })
                    .to(section, {
                        opacity: 0,
                        y: -50,
                        scale: 1.1,
                        duration: isLastSection ? 1.5 : 1,
                        ease: "power2.in",
                        onComplete: () => {
                            // 모바일에서는 별도 pin 넣어야함 추 후 적용
                        },
                    });
            });

            // 가로 스크롤 애니메이션 (.section--horizontal)
            const horizontalSection = document.querySelector(".section--horizontal");
            if (horizontalSection) {
                gsap.to(horizontalSection, {
                    x: () => -(horizontalSection.scrollWidth - window.innerWidth),
                    ease: "none",
                    scrollTrigger: {
                        trigger: horizontalSection,
                        start: "top top",
                        end: () => `+=${horizontalSection.scrollWidth - window.innerWidth}`,
                        scrub: true,
                        pin: true,
                        invalidateOnRefresh: true,
                    },
                });
            }
        }
    });

    /* ------------------------------------------
        텍스트 애니메이션 
    --------------------------------------------- */
    const typingElements = gsap.utils.toArray(".text-typing");

    typingElements.forEach((text, index) => {
        const splitText = new SplitType(text, { types: "chars" });

        gsap.from(splitText.chars, {
            scrollTrigger: {
                trigger: text,
                start: "top 70%",
                end: "top 50%",
                toggleActions: "play none none none",
            },
            opacity: 0,
            y: 30,
            stagger: 0.15,
            ease: "power2.out",
            delay: index * 1,
        });
    });

    gsap.to(".text-grdient", {
        duration: 10,
        backgroundPosition: "300% 0",
        repeat: -1,
        yoyo: true,
        ease: "linear",
    });

    /* ------------------------------------------
        특정 섹션 확대 효과 (클래스: .section--first)
    --------------------------------------------- */
    gsap.to(".section--first", {
        scrollTrigger: {
            trigger: ".section--first",
            start: "top top",
            end: "bottom top",
            scrub: 2,
        },
        scale: 1.2,
        ease: "none"
    });

    /* ------------------------------------------
        숫자 카운트 애니메이션 (클래스: .gsap-count)
    --------------------------------------------- */
    document.querySelectorAll(".section--Effect--hide").forEach((section) => {
        // 해당 섹션 내에 gsap-count 요소들을 선택
        const counters = section.querySelectorAll(".gsap-count");
    
        counters.forEach((counter) => {
        counter.innerText = "0";
        const targetNumber = parseInt(
            counter.getAttribute("data-target").replace(/,/g, ""),
            10
        );
        const obj = { value: 0 };
    
        gsap.to(obj, {
            duration: 3,
            value: targetNumber,
            ease: "power1.inOut",
            onUpdate: function () {
            counter.innerText = Math.floor(obj.value).toLocaleString();
            },
            scrollTrigger: {
            trigger: section,       // 각 섹션을 트리거로 지정
            start: "top top",       // 섹션 진입과 동시에 애니메이션 시작
            toggleActions: "play none none none",
            },
        });
    });
    });


    // 크기 변경 시 전체 ScrollTrigger 새로고침
    window.addEventListener("resize", () => {
        ScrollTrigger.refresh();
    });

    // ==========================================
    // 헤더 스크롤 이벤트
    // ==========================================

    function headers() {
        var header = document.querySelector('.main-header');
        var breadcrumb = document.querySelector('.breadcrumb');
        var breadcrumbTop = header.offsetHeight;
        var lastScrollY = window.pageYOffset || document.documentElement.scrollTop;

        // 스크롤 방향에 따라 헤더 상태 업데이트
        function updateScrollDirection() {
            var currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
            var isScrollingDown = currentScrollY > lastScrollY;
            
            // body에 mm-open 클래스가 있으면 항상 header에 'up' 클래스 추가
            if (document.body.classList.contains('mm-open')) {
                header.classList.add('up');
                lastScrollY = currentScrollY;
                return; // mm-open 상태에서는 나머지 로직을 건너뜁니다.
            }
            
            if (header.classList.contains('_sub') && breadcrumb) {
                if (currentScrollY >= breadcrumbTop) {
                    if (isScrollingDown) {
                        header.classList.add('hide');
                        header.classList.remove('up');
                    } else {
                        header.classList.remove('hide');
                        if (currentScrollY > 0) {
                            header.classList.add('up');
                        } else {
                            header.classList.remove('up');
                        }
                    }
                } else {
                    header.classList.remove('hide', 'up');
                }
            } else {
                if (isScrollingDown) {
                    header.classList.add('hide');
                    header.classList.remove('up');
                } else {
                    header.classList.remove('hide');
                    if (currentScrollY > 0) {
                        header.classList.add('up');
                    } else {
                        header.classList.remove('up');
                    }
                }
            }
            lastScrollY = currentScrollY;
        }

        // 초기 스크롤 상태 반영
        document.addEventListener('DOMContentLoaded', function () {
            lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
            
            // body에 mm-open 클래스가 있는 경우 'up' 클래스를 무조건 추가
            if (document.body.classList.contains('mm-open')) {
                header.classList.add('up');
            } else if (header.classList.contains('_sub') && breadcrumb) {
                var _breadcrumbTop = breadcrumb.getBoundingClientRect().top + window.scrollY;
                if (lastScrollY >= _breadcrumbTop) {
                    header.classList.add('up', 'hide');
                } else {
                    header.classList.remove('up', 'hide');
                }
            } else {
                if (lastScrollY > 50) {
                    header.classList.add('up', 'hide');
                } else {
                    header.classList.remove('up', 'hide');
                }
            }
        });

        // 스크롤 이벤트 리스너 추가
        window.addEventListener('scroll', updateScrollDirection);
    }

    headers();
});

