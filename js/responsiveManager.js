/**
 * ResponsiveManager 클래스 - 게임의 반응형 기능 관리
 */
class ResponsiveManager {
    /**
     * ResponsiveManager 초기화
     * @param {HTMLCanvasElement} canvas - 게임 캔버스 요소
     * @param {HTMLElement} container - 게임 컨테이너 요소
     * @param {Object} options - 추가 설정 옵션
     */
    constructor(canvas, container, options = {}) {
        // 기본 요소
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.container = container;
        
        // 기본 설정
        this.options = Object.assign({
            baseWidth: 450,        // 기본 디자인 너비
            baseHeight: 640,       // 기본 디자인 높이
            maxWidth: 800,         // 최대 너비
            minWidth: 280,         // 최소 너비
            aspectRatio: 9/16,     // 종횡비 (기본 16:9, 높이/너비)
            pixelPerfect: true,    // 픽셀 완벽성
            smallScreenThreshold: 768, // 작은 화면 기준점
            smallScreenWidth: 320,  // 작은 화면에서 사용할 최대 너비
            debug: false           // 디버그 모드
        }, options);
        
        // 현재 크기 정보
        this.size = {
            width: 0,
            height: 0,
            scale: 1,
            aspectRatio: this.options.aspectRatio
        };
        
        // 화면 방향 (portrait/landscape)
        this.orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
        
        // 전체 화면 상태
        this.isFullscreen = false;
        
        // 터치 이벤트 지원 여부
        this.hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // 초기화
        this.setupEventListeners();
        this.createFullscreenButton();
        this.setupTouchHandling();
        this.resize();
    }
    
    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 창 크기 변경 이벤트
        window.addEventListener('resize', this.resize.bind(this));
        
        // 방향 변경 이벤트 (모바일)
        window.addEventListener('orientationchange', () => {
            // orientationchange 이벤트 발생 후 약간의 딜레이를 두고 resize 호출
            // (일부 브라우저에서 orientationchange 직후 올바른 크기를 보고하지 않는 문제 해결)
            setTimeout(this.resize.bind(this), 200);
        });
        
        // 전체 화면 상태 변경 감지
        document.addEventListener('fullscreenchange', this.handleFullscreenChange.bind(this));
        document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange.bind(this));
        document.addEventListener('mozfullscreenchange', this.handleFullscreenChange.bind(this));
        document.addEventListener('MSFullscreenChange', this.handleFullscreenChange.bind(this));
    }
    
    /**
     * 터치 이벤트 처리 설정
     */
    setupTouchHandling() {
        if (!this.hasTouchSupport) return;
        
        // 모바일에서 pinch-zoom 및 스크롤 방지
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault(); // 멀티터치 제스처 방지 (핀치 줌 등)
            }
        }, { passive: false });
        
        // 더블 탭 줌 방지
        let lastTap = 0;
        document.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            
            if (tapLength < 500 && tapLength > 0) {
                e.preventDefault(); // 더블 탭 방지
            }
            
            lastTap = currentTime;
        }, { passive: false });
        
        // 터치 액션 방지 CSS 설정
        const style = document.createElement('style');
        style.textContent = `
            body, #gameCanvas, .container {
                touch-action: none;
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                -khtml-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
                -webkit-tap-highlight-color: transparent;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * 전체 화면 버튼 생성
     */
    createFullscreenButton() {
        // 모바일이 아니면 버튼 생성하지 않음
        if (!this.hasTouchSupport && !this.options.alwaysShowFullscreenButton) {
            return;
        }
        
        // 기존 버튼이 있는지 확인
        let fullscreenBtn = document.getElementById('fullscreen-button');
        
        // 기존 버튼이 없으면 새로 생성
        if (!fullscreenBtn) {
            fullscreenBtn = document.createElement('button');
            fullscreenBtn.id = 'fullscreen-button';
            fullscreenBtn.className = 'game-button';
            fullscreenBtn.innerHTML = '⛶';
            fullscreenBtn.setAttribute('aria-label', '전체 화면 전환');
            
            // 버튼 클릭 이벤트
            fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
            
            // 터치 이벤트에 대한 추가 처리
            if (this.hasTouchSupport) {
                fullscreenBtn.addEventListener('touchstart', (e) => {
                    e.preventDefault(); // 기본 터치 이벤트 취소
                    this.toggleFullscreen();
                }, { passive: false });
            }
            
            // 컨테이너에 버튼 추가
            this.container.appendChild(fullscreenBtn);
        }
    }
    
    /**
     * 전체 화면 토글
     */
    toggleFullscreen() {
        if (!this.isFullscreen) {
            // 전체 화면으로 전환
            if (this.container.requestFullscreen) {
                this.container.requestFullscreen();
            } else if (this.container.mozRequestFullScreen) {
                this.container.mozRequestFullScreen();
            } else if (this.container.webkitRequestFullscreen) {
                this.container.webkitRequestFullscreen();
            } else if (this.container.msRequestFullscreen) {
                this.container.msRequestFullscreen();
            }
        } else {
            // 전체 화면 종료
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }
    
    /**
     * 전체 화면 상태 변경 처리
     */
    handleFullscreenChange() {
        this.isFullscreen = !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement
        );
        
        // 전체 화면 상태에 맞게 버튼 업데이트
        const fullscreenBtn = document.getElementById('fullscreen-button');
        if (fullscreenBtn) {
            fullscreenBtn.innerHTML = this.isFullscreen ? '⮌' : '⛶';
        }
        
        // 전체화면 클래스 토글
        if (this.isFullscreen) {
            document.body.classList.add('fullscreen-active');
        } else {
            document.body.classList.remove('fullscreen-active');
        }
        
        // 크기 조정 (강제 업데이트)
        this.resize(true);
    }
    
    /**
     * 캔버스 크기 조정
     * @param {boolean} forceUpdate - 강제 업데이트 여부
     */
    resize(forceUpdate = false) {
        // 현재 화면 방향 확인
        const newOrientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
        const orientationChanged = this.orientation !== newOrientation;
        
        // 방향 업데이트
        this.orientation = newOrientation;
        
        // 컨테이너 크기 가져오기
        const containerWidth = this.container.clientWidth;
        const containerHeight = this.container.clientHeight;
        
        // 작은 화면 여부 확인
        const isSmallScreen = window.innerWidth <= this.options.smallScreenThreshold;
        
        // 게임 크기 계산
        let gameWidth, gameHeight;
        
        if (this.orientation === 'portrait') {
            // 세로 방향 - 너비에 맞춤
            gameWidth = isSmallScreen 
                ? Math.min(containerWidth, this.options.smallScreenWidth) 
                : Math.min(containerWidth, this.options.maxWidth);
            gameHeight = Math.round(gameWidth / this.options.aspectRatio);
            
            // 높이가 컨테이너를 넘어가면 조정
            if (gameHeight > containerHeight) {
                gameHeight = containerHeight;
                gameWidth = Math.round(gameHeight * this.options.aspectRatio);
            }
        } else {
            // 가로 방향 - 높이에 맞춤
            gameHeight = containerHeight;
            gameWidth = Math.round(gameHeight * this.options.aspectRatio);
            
            // 너비가 컨테이너를 넘어가면 조정
            if (gameWidth > containerWidth) {
                gameWidth = containerWidth;
                gameHeight = Math.round(gameWidth / this.options.aspectRatio);
            }
        }
        
        // 최소 크기 보장
        gameWidth = Math.max(gameWidth, this.options.minWidth);
        gameHeight = Math.max(gameHeight, this.options.minWidth * this.options.aspectRatio);
        
        // 크기가 변경되었거나 강제 업데이트인 경우에만 실행
        if (forceUpdate || this.size.width !== gameWidth || this.size.height !== gameHeight || orientationChanged) {
            // 픽셀 완벽성을 위해 정수로 반올림
            gameWidth = Math.floor(gameWidth);
            gameHeight = Math.floor(gameHeight);
            
            // 캔버스 크기 설정
            this.canvas.width = gameWidth;
            this.canvas.height = gameHeight;
            
            // 렌더링 설정
            this.ctx.imageSmoothingEnabled = !this.options.pixelPerfect;
            
            // 크기 정보 저장
            this.size.width = gameWidth;
            this.size.height = gameHeight;
            this.size.scale = gameWidth / this.options.baseWidth;
            
            // 디버그 모드면 콘솔에 정보 출력
            if (this.options.debug) {
                console.log('화면 크기 변경:', {
                    width: gameWidth,
                    height: gameHeight,
                    scale: this.size.scale,
                    orientation: this.orientation,
                    containerSize: {width: containerWidth, height: containerHeight},
                    isFullscreen: this.isFullscreen,
                    isSmallScreen
                });
            }
            
            // 상태 업데이트 이벤트 발생
            this.dispatchResizeEvent();
            
            return true; // 크기가 변경됨
        }
        
        return false; // 크기 변경 없음
    }
    
    /**
     * 리사이즈 이벤트 발생
     */
    dispatchResizeEvent() {
        // 커스텀 이벤트 생성
        const event = new CustomEvent('game-resize', {
            detail: {
                width: this.size.width,
                height: this.size.height,
                scale: this.size.scale,
                orientation: this.orientation,
                isFullscreen: this.isFullscreen
            }
        });
        
        // 이벤트 디스패치
        window.dispatchEvent(event);
    }
    
    /**
     * 현재 게임 크기 정보 가져오기
     * @returns {Object} 게임 크기 정보
     */
    getSize() {
        return this.size;
    }
    
    /**
     * 현재 화면 방향 가져오기
     * @returns {string} 화면 방향 ('portrait' 또는 'landscape')
     */
    getOrientation() {
        return this.orientation;
    }
    
    /**
     * 전체 화면 여부 확인
     * @returns {boolean} 전체 화면 상태
     */
    isInFullscreen() {
        return this.isFullscreen;
    }
    
    /**
     * 터치 지원 여부 확인
     * @returns {boolean} 터치 지원 여부
     */
    isTouchSupported() {
        return this.hasTouchSupport;
    }
} 