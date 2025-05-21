/**
 * 웹 플래피버드 게임 메인 로직
 */
 
// 디버그 유틸리티 - 전역 접근 가능
window.GameDebug = {
    enabled: true,
    logs: [],
    maxLogs: 100,
    
    // 일반 로그 출력
    log: function(message, data) {
        if (!this.enabled) return;
        
        const logEntry = {
            type: 'log',
            time: new Date().toISOString(),
            message: message,
            data: data || null
        };
        
        console.log(`[GameDebug] ${logEntry.time} - ${message}`, data || '');
        this.logs.push(logEntry);
        
        // 로그 배열 최대 크기 제한
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
        
        // 로그 UI 업데이트 (UI가 존재하는 경우)
        this.updateLogUI();
    },
    
    // 경고 로그 출력
    warn: function(message, data) {
        if (!this.enabled) return;
        
        const logEntry = {
            type: 'warn',
            time: new Date().toISOString(),
            message: message,
            data: data || null
        };
        
        console.warn(`[GameDebug] ${logEntry.time} - ${message}`, data || '');
        this.logs.push(logEntry);
        
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
        
        this.updateLogUI();
    },
    
    // 에러 로그 출력
    error: function(message, data) {
        if (!this.enabled) return;
        
        const logEntry = {
            type: 'error',
            time: new Date().toISOString(),
            message: message,
            data: data || null
        };
        
        console.error(`[GameDebug] ${logEntry.time} - ${message}`, data || '');
        this.logs.push(logEntry);
        
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
        
        this.updateLogUI();
    },
    
    // DOM 요소 상태 추적 및 출력
    traceElement: function(element, description) {
        if (!this.enabled || !element) return;
        
        const isVisible = !(element.classList.contains('hidden'));
        const styles = window.getComputedStyle(element);
        const display = styles.getPropertyValue('display');
        const visibility = styles.getPropertyValue('visibility');
        const opacity = styles.getPropertyValue('opacity');
        
        this.log(`DOM 요소 상태 [${description || element.id || '익명'}]:`, {
            element: element,
            visible: isVisible,
            display: display,
            visibility: visibility, 
            opacity: opacity,
            classes: element.className,
            rect: element.getBoundingClientRect()
        });
    },
    
    // 이벤트 핸들러 추적
    traceEvent: function(event, handler, result) {
        if (!this.enabled) return;
        
        this.log(`이벤트 처리 [${event}]:`, {
            event: event,
            handler: handler.name || '익명 함수',
            result: result
        });
    },
    
    // 로그 UI 업데이트
    updateLogUI: function() {
        const logContainer = document.getElementById('debug-log-container');
        if (!logContainer) return;
        
        const logContent = document.getElementById('debug-log-content');
        if (!logContent) return;
        
        // 최신 로그 5개만 표시
        const recentLogs = this.logs.slice(-5);
        
        // 기존 내용 지우기
        logContent.innerHTML = '';
        
        // 로그 추가
        recentLogs.forEach(log => {
            const logElement = document.createElement('div');
            logElement.className = `debug-log-entry debug-log-${log.type}`;
            
            const timeSpan = document.createElement('span');
            timeSpan.className = 'debug-log-time';
            timeSpan.textContent = new Date(log.time).toLocaleTimeString();
            
            const messageSpan = document.createElement('span');
            messageSpan.className = 'debug-log-message';
            messageSpan.textContent = log.message;
            
            logElement.appendChild(timeSpan);
            logElement.appendChild(messageSpan);
            
            logContent.appendChild(logElement);
        });
        
        // 자동 스크롤
        logContent.scrollTop = logContent.scrollHeight;
    },
    
    // 디버그 콘솔 표시/숨김 토글
    toggleConsole: function() {
        const console = document.getElementById('debug-console');
        if (!console) return;
        
        if (console.classList.contains('hidden')) {
            console.classList.remove('hidden');
            this.log('디버그 콘솔 표시됨');
        } else {
            console.classList.add('hidden');
            this.log('디버그 콘솔 숨겨짐');
        }
    },
    
    // 모든 로그 지우기
    clearLogs: function() {
        this.logs = [];
        this.log('로그 초기화됨');
        this.updateLogUI();
    },
    
    getGameState: function() {
        if (window.game) {
            return {
                currentState: window.game.stateManager.currentState,
                bird: window.game.bird ? {
                    x: window.game.bird.x,
                    y: window.game.bird.y,
                    velocity: window.game.bird.velocity
                } : null,
                canvas: {
                    width: window.game.canvas.width,
                    height: window.game.canvas.height
                }
            };
        }
        return "게임 인스턴스를 찾을 수 없습니다.";
    }
};

// 게임 상태 상수
const GameState = {
    LOADING: 'loading',  // 에셋 로딩 중
    START: 'start',      // 시작 화면
    PLAYING: 'playing',  // 게임 플레이 중
    PAUSED: 'paused',    // 일시 정지
    GAME_OVER: 'gameOver' // 게임 오버
};

// 게임 설정
const GameConfig = {
    FPS_DISPLAY: true,     // FPS 표시 여부
    GRAVITY: 1200,         // 중력 (픽셀/초^2)
    JUMP_FORCE: -400,      // 점프 힘 (음수 = 위로 이동)
    BIRD_WIDTH: 40,        // 새 너비
    BIRD_HEIGHT: 30,       // 새 높이
    PIPE_SPEED: 180,       // 파이프 이동 속도 (픽셀/초)
    PIPE_SPAWN_INTERVAL: 1.5, // 파이프 스폰 간격 (초)
    PIPE_WIDTH: 60,        // 파이프 너비
    PIPE_GAP: 160,         // 파이프 간격 (상하 파이프 사이)
    GROUND_HEIGHT: 50      // 지면 높이
};

// 게임 클래스
class FlappyBirdGame {
    /**
     * 게임 초기화
     */
    constructor() {
        GameDebug.log("게임 생성자 호출 - 초기화 시작");
        
        try {
            // 캔버스 설정
            this.canvas = document.getElementById('gameCanvas');
            if (!this.canvas) {
                throw new Error("캔버스 요소를 찾을 수 없습니다");
            }
            
            this.ctx = this.canvas.getContext('2d', { alpha: false }); // alpha: false로 성능 향상
            
            // UI 요소
            this.startScreen = document.getElementById('start-screen');
            this.gameOverScreen = document.getElementById('game-over-screen');
            this.pauseScreen = document.getElementById('pause-screen');
            this.scoreDisplay = document.getElementById('score-display');
            this.finalScore = document.getElementById('final-score').querySelector('span');
            this.highScore = document.getElementById('high-score').querySelector('span');
            this.startButton = document.getElementById('start-button');
            this.restartButton = document.getElementById('restart-button');
            this.audioControl = document.getElementById('audio-control');
            
            // UI 요소 검증
            if (!this.startButton) {
                throw new Error("시작 버튼 요소를 찾을 수 없습니다");
            }
            
            GameDebug.log("UI 요소 초기화 완료");
            
            // 게임 상태 관리자 초기화
            this.stateManager = new GameStateManager({
                startScreen: this.startScreen,
                gameOverScreen: this.gameOverScreen,
                pauseScreen: this.pauseScreen,
                scoreDisplay: this.scoreDisplay
            }, this.onStateChange.bind(this));
            
            // 점수 시스템 초기화
            this.scoreSystem = new ScoreSystem(
                this.scoreDisplay,
                this.finalScore,
                this.highScore
            );
            
            // 오디오 매니저 초기화
            this.audioManager = new AudioManager();
            
            // 게임 요소
            this.bird = null;          // 새 객체
            
            // 충돌 감지 시스템
            this.collisionSystem = new CollisionSystem({
                groundHeight: GameConfig.GROUND_HEIGHT
            });
            
            // 반응형 관리자 초기화
            this.responsiveManager = new ResponsiveManager(
                this.canvas, 
                document.querySelector('.container'),
                {
                    baseWidth: 450,
                    baseHeight: 640,
                    aspectRatio: 9/16,
                    smallScreenThreshold: 768,
                    smallScreenWidth: 320,
                    debug: true // 디버그 모드 활성화
                }
            );
            
            // 디버그 모드
            this.debug = false;
            
            // 이벤트 리스너
            this.setupEventListeners();
            
            // 반응형 이벤트 리스너
            window.addEventListener('game-resize', (e) => this.handleResize(e.detail));
            
            // 에셋 로딩
            this.loadAssets();
            
            GameDebug.log("게임 초기화 완료");
        } catch (error) {
            GameDebug.error("게임 초기화 중 오류 발생", error);
        }
    }
    
    /**
     * 게임 상태 변경 이벤트 핸들러
     * @param {string} newState - 새 게임 상태
     * @param {string} oldState - 이전 게임 상태
     */
    onStateChange(newState, oldState) {
        GameDebug.log(`게임 상태 변경: ${oldState} -> ${newState}`);
        
        // 상태에 따른 게임 로직 처리
        switch (newState) {
            case GameStateManager.State.PLAYING:
                GameDebug.log("PLAYING 상태로 전환: 게임 루프 시작");
                // 게임 루프 시작
                if (!GameLoop.isRunning()) {
                    GameLoop.start(
                        (deltaTime, fps) => this.update(deltaTime, fps),
                        (fps) => this.render(fps)
                    );
                    GameDebug.log("게임 루프 시작됨");
                } else {
                    GameDebug.log("게임 루프가 이미 실행 중");
                }
                break;
                
            case GameStateManager.State.PAUSED:
                GameDebug.log("PAUSED 상태로 전환: 게임 루프 일시정지");
                // 게임 루프 일시정지
                if (GameLoop.isRunning()) {
                    GameLoop.stop();
                    GameDebug.log("게임 루프 정지됨");
                }
                
                // 일시정지 화면 렌더링
                this.renderPauseScreen();
                break;
                
            case GameStateManager.State.GAME_OVER:
                GameDebug.log("GAME_OVER 상태로 전환: 게임 루프 정지");
                // 게임 루프 정지
                if (GameLoop.isRunning()) {
                    GameLoop.stop();
                    GameDebug.log("게임 루프 정지됨");
                }
                break;
                
            case GameStateManager.State.START:
                GameDebug.log("START 상태로 전환: 시작 화면 표시");
                break;
        }
    }
    
    /**
     * 크기 변경 이벤트 처리
     * @param {Object} sizeInfo - 크기 정보 객체
     */
    handleResize(sizeInfo) {
        GameDebug.log("화면 크기 변경 감지", sizeInfo);
        
        // 게임 요소 크기 업데이트
        if (this.pipeManager) {
            this.pipeManager.resize(sizeInfo.width, sizeInfo.height);
        }
        
        if (this.backgroundManager) {
            this.backgroundManager.resize(sizeInfo.width, sizeInfo.height);
        }
        
        // 게임 상태에 따라 리렌더링
        if (this.stateManager.isState(GameStateManager.State.START)) {
            this.showStartScreen();
        } else if (!this.stateManager.isState(GameStateManager.State.LOADING)) {
            this.render(GameLoop.getFPS());
        }
    }
    
    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        GameDebug.log("이벤트 리스너 설정 시작");
        
        try {
            // 시작 버튼
            const startButton = document.getElementById('start-button');
            if (startButton) {
                GameDebug.log("시작 버튼 요소 찾음", startButton);
                
                // 'this' 컨텍스트 저장 (게임 인스턴스 참조)
                const self = this;
                
                startButton.addEventListener('click', function(e) {
                    GameDebug.log("시작 버튼 클릭됨", {
                        button: startButton,
                        buttonState: {
                            visible: !startButton.classList.contains('hidden'),
                            display: window.getComputedStyle(startButton).display,
                            disabled: startButton.disabled
                        },
                        currentState: self.stateManager.getState()
                    });
                    
                    self.startGame();
                });
                
                // 터치 이벤트 추가
                startButton.addEventListener('touchstart', function(e) {
                    // 기본 터치 동작 방지 (더블 탭으로 인한 확대 방지)
                    e.preventDefault();
                    
                    GameDebug.log("시작 버튼 터치됨", {
                        touches: e.touches.length,
                        currentState: self.stateManager.getState()
                    });
                    
                    self.startGame();
                });
            } else {
                GameDebug.error("시작 버튼 요소를 찾을 수 없음");
            }
            
            // 게임 재시작 버튼
            this.restartButton = document.getElementById('restart-button');
            if (this.restartButton) {
                GameDebug.log("재시작 버튼 요소 찾음", this.restartButton);
                
                // 클릭 이벤트
                this.restartButton.addEventListener('click', (e) => {
                    GameDebug.log("재시작 버튼 클릭됨", e);
                    this.resetGame();
                });
                
                // 터치 이벤트 추가
                this.restartButton.addEventListener('touchstart', (e) => {
                    // 기본 터치 동작 방지
                    e.preventDefault();
                    
                    GameDebug.log("재시작 버튼 터치됨", {
                        touches: e.touches.length
                    });
                    
                    this.resetGame();
                });
            }
            
            // 점프 컨트롤 (클릭 또는 탭)
            this.canvas.addEventListener('click', (e) => {
                GameDebug.log("캔버스 클릭됨", {
                    state: this.stateManager.currentState,
                    x: e.clientX,
                    y: e.clientY
                });
                
                if (this.stateManager.isState(GameStateManager.State.PLAYING)) {
                    this.jump();
                } else {
                    GameDebug.log("점프 무시 - 게임 상태가 PLAYING이 아님");
                }
            });
            
            // 모바일 터치 컨트롤 추가
            this.canvas.addEventListener('touchstart', (e) => {
                // 기본 터치 동작 방지 (스크롤 방지)
                e.preventDefault();
                
                GameDebug.log("캔버스 터치됨", {
                    state: this.stateManager.currentState,
                    touches: e.touches.length,
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY
                });
                
                if (this.stateManager.isState(GameStateManager.State.PLAYING)) {
                    this.jump();
                } else if (this.stateManager.isState(GameStateManager.State.START)) {
                    GameDebug.log("시작 화면에서 터치 - 게임 시작");
                    this.startGame();
                } else if (this.stateManager.isState(GameStateManager.State.GAME_OVER)) {
                    this.resetGame();
                }
            });
            
            // 점프 컨트롤 (키보드)
            document.addEventListener('keydown', (e) => {
                GameDebug.log("키 입력 감지", {
                    key: e.key,
                    code: e.code,
                    state: this.stateManager.currentState
                });
                
                // 스페이스바로 점프
                if (e.code === 'Space' || e.key === ' ') {
                    if (this.stateManager.isState(GameStateManager.State.PLAYING)) {
                        this.jump();
                    } else if (this.stateManager.isState(GameStateManager.State.START)) {
                        GameDebug.log("시작 화면에서 스페이스바 - 게임 시작");
                        this.startGame();
                    } else if (this.stateManager.isState(GameStateManager.State.GAME_OVER)) {
                        this.resetGame();
                    }
                    
                    // 스페이스바 스크롤 방지
                    e.preventDefault();
                }
                
                // ESC로 일시정지
                if (e.code === 'Escape' || e.key === 'Escape') {
                    if (this.stateManager.isState(GameStateManager.State.PLAYING)) {
                        this.pauseGame();
                    } else if (this.stateManager.isState(GameStateManager.State.PAUSED)) {
                        this.resumeGame();
                    }
                }
                
                // 디버그 모드 토글 (D 키)
                if (e.code === 'KeyD' || e.key === 'd') {
                    this.debug = !this.debug;
                    // 충돌 시스템에 디버그 모드 상태 전달
                    this.collisionSystem.setDebug(this.debug);
                    GameDebug.log(`디버그 모드 ${this.debug ? '활성화' : '비활성화'}`);
                }
            });
            
            // 오디오 컨트롤
            this.audioControl.addEventListener('click', () => {
                this.updateAudioControl();
            });
            
            // 볼륨 슬라이더
            const volumeSlider = document.getElementById('volume-slider');
            if (volumeSlider) {
                // 초기 볼륨 설정
                volumeSlider.value = this.audioManager.getVolume() * 100;
                
                // 볼륨 변경 이벤트
                volumeSlider.addEventListener('input', (e) => {
                    const volume = e.target.value / 100;
                    this.audioManager.setVolume(volume);
                });
            }
            
            // 디버그 콘솔 토글 (F2 키)
            document.addEventListener('keydown', function(e) {
                if (e.key === 'F2') {
                    GameDebug.toggleConsole();
                    e.preventDefault();
                }
            });
            
            GameDebug.log("이벤트 리스너 설정 완료");
        } catch (error) {
            GameDebug.error("이벤트 리스너 설정 중 오류 발생", error);
        }
    }
    
    /**
     * 게임 에셋 로딩
     */
    loadAssets() {
        GameDebug.log("게임 에셋 로딩 시작");
        
        // 게임에 필요한 이미지 파일 목록
        const imageFiles = {
            'bird1': 'assets/images/bird-1.svg',
            'bird2': 'assets/images/bird-2.svg',
            'bird3': 'assets/images/bird-3.svg',
            'birdSprite': 'assets/images/bird-sprite.svg',
            'background': 'assets/images/background.svg',
            'ground': 'assets/images/ground.svg',
            'pipeTop': 'assets/images/pipe-top.svg',
            'pipeBottom': 'assets/images/pipe-bottom.svg'
        };
        
        // 게임에 필요한 오디오 파일 목록
        const soundFiles = {
            'flap': 'assets/sounds/flap.wav',
            'score': 'assets/sounds/score.wav',
            'hit': 'assets/sounds/hit.wav',
            'bgMusic': 'assets/sounds/background-music.mp3'
        };
        
        // 로딩 진행률 표시
        AssetLoader.onProgress((progress) => {
            const percent = Math.round(progress * 100);
            GameDebug.log(`에셋 로딩 진행률: ${percent}%`);
            
            // 로딩 진행률 화면에 표시
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#87CEEB';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // 로딩 바 그리기
            const barWidth = this.canvas.width * 0.7;
            const barHeight = 30;
            const barX = (this.canvas.width - barWidth) / 2;
            const barY = this.canvas.height / 2;
            
            // 로딩 바 배경
            this.ctx.fillStyle = '#ddd';
            this.ctx.fillRect(barX, barY, barWidth, barHeight);
            
            // 로딩 진행률 표시
            this.ctx.fillStyle = '#4CAF50';
            this.ctx.fillRect(barX, barY, barWidth * progress, barHeight);
            
            // 로딩 진행률 텍스트
            RenderUtils.drawText(
                this.ctx,
                `${percent}%`,
                this.canvas.width / 2,
                barY + barHeight + 30,
                '20px Arial',
                'white',
                'center'
            );
            
            // 로딩 텍스트
            RenderUtils.drawText(
                this.ctx,
                "에셋 로딩 중...",
                this.canvas.width / 2,
                barY - 30,
                '24px Arial',
                'white',
                'center'
            );
        });
        
        // 로딩 완료 처리
        AssetLoader.onComplete(() => {
            GameDebug.log('모든 에셋 로딩 완료!');
            
            // 오디오 매니저에 사운드 추가
            for (const key in soundFiles) {
                const sound = AssetLoader.getSound(key);
                if (sound) {
                    this.audioManager.addSound(key, sound);
                }
            }
            
            // 로딩 완료 후 시작 화면으로 전환
            this.initGameObjects();
            this.stateManager.changeState(GameStateManager.State.START);
            this.showStartScreen();
            
            // 음소거 상태 업데이트
            this.updateAudioControl(true); // 초기 설정만, 자동 재생 방지
        });
        
        // 모든 에셋 로드 시작
        AssetLoader.loadAll(imageFiles, soundFiles).catch(error => {
            GameDebug.error('에셋 로딩 오류:', error);
            // 에러 발생 시 간단한 에러 메시지 표시
            RenderUtils.drawText(
                this.ctx,
                "에셋 로딩 오류가 발생했습니다!",
                this.canvas.width / 2,
                this.canvas.height / 2,
                '18px Arial',
                'red',
                'center'
            );
        });
    }
    
    /**
     * 게임 객체 초기화
     */
    initGameObjects() {
        GameDebug.log("게임 객체 초기화 시작");
        
        try {
            // 새 객체 초기화 (Bird 클래스 사용)
            const birdImages = [
                AssetLoader.getImage('bird1'),
                AssetLoader.getImage('bird2'),
                AssetLoader.getImage('bird3')
            ];
            
            const birdConfig = {
                width: GameConfig.BIRD_WIDTH,
                height: GameConfig.BIRD_HEIGHT,
                gravity: GameConfig.GRAVITY,
                jumpForce: GameConfig.JUMP_FORCE
            };
            
            this.bird = new Bird(
                this.canvas.width / 3,  // 가로 위치 (왼쪽에서 1/3 지점)
                this.canvas.height / 2, // 세로 위치 (화면 중앙)
                birdImages,
                birdConfig
            );
            
            // 배경 매니저 초기화 - 클래스 존재 여부 먼저 확인
            const backgroundImages = {
                background: AssetLoader.getImage('background'),
                ground: AssetLoader.getImage('ground')
            };
            
            // BackgroundManager 클래스가 있는지 확인
            if (typeof BackgroundManager === 'function') {
                this.backgroundManager = new BackgroundManager(
                    this.canvas.width,
                    this.canvas.height,
                    backgroundImages,
                    GameConfig.GROUND_HEIGHT,
                    GameConfig.PIPE_SPEED
                );
                GameDebug.log("배경 매니저 초기화 완료");
            } else {
                GameDebug.error("BackgroundManager 클래스를 찾을 수 없습니다. js/backgroundManager.js 파일이 제대로 로드되었는지 확인하세요.");
                // 기본 배경 렌더링을 위한 더미 객체 생성
                this.backgroundManager = {
                    update: function() {},
                    render: function(ctx) {
                        // 기본 배경 렌더링 (파란색 배경)
                        ctx.fillStyle = '#87CEEB';
                        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                        
                        // 기본 지면 렌더링 (녹색 사각형)
                        ctx.fillStyle = '#8FBC8F';
                        ctx.fillRect(0, ctx.canvas.height - GameConfig.GROUND_HEIGHT, 
                                   ctx.canvas.width, GameConfig.GROUND_HEIGHT);
                    },
                    renderBackground: function(ctx) {
                        // 기본 배경만 렌더링
                        ctx.fillStyle = '#87CEEB';
                        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                    },
                    renderGround: function(ctx) {
                        // 기본 지면만 렌더링
                        ctx.fillStyle = '#8FBC8F';
                        ctx.fillRect(0, ctx.canvas.height - GameConfig.GROUND_HEIGHT, 
                                   ctx.canvas.width, GameConfig.GROUND_HEIGHT);
                    }
                };
                GameDebug.log("더미 배경 매니저 생성됨");
            }
            
            // 파이프 매니저 초기화
            const pipeImages = {
                topImage: AssetLoader.getImage('pipeTop'),
                bottomImage: AssetLoader.getImage('pipeBottom')
            };
            
            const pipeConfig = {
                pipeWidth: GameConfig.PIPE_WIDTH,
                pipeGap: GameConfig.PIPE_GAP,
                pipeSpawnInterval: GameConfig.PIPE_SPAWN_INTERVAL,
                pipeSpeed: GameConfig.PIPE_SPEED
            };
            
            // PipeManager 클래스가 있는지 확인
            if (typeof PipeManager === 'function') {
                this.pipeManager = new PipeManager(
                    this.canvas.width,
                    this.canvas.height,
                    GameConfig.GROUND_HEIGHT,
                    pipeConfig,
                    pipeImages
                );
                GameDebug.log("파이프 매니저 초기화 완료");
            } else {
                GameDebug.error("PipeManager 클래스를 찾을 수 없습니다. js/pipeManager.js 파일이 제대로 로드되었는지 확인하세요.");
                // 더미 파이프 매니저 생성
                this.pipeManager = {
                    pipes: [],
                    update: function() {},
                    render: function() {},
                    reset: function() {},
                    checkScoring: function() { return 0; }
                };
                GameDebug.log("더미 파이프 매니저 생성됨");
            }
            
            GameDebug.log("게임 객체 초기화 완료", {
                canvasSize: { width: this.canvas.width, height: this.canvas.height },
                birdPosition: { x: this.bird.x, y: this.bird.y }
            });
        } catch (error) {
            GameDebug.error("게임 객체 초기화 중 오류 발생", error);
            
            // 오류 발생 시 기본 객체 설정
            if (!this.bird) {
                this.bird = {
                    x: this.canvas.width / 3,
                    y: this.canvas.height / 2,
                    update: function() {},
                    render: function() {},
                    reset: function() {},
                    jump: function() { return { shouldPlaySound: false }; },
                    getBounds: function() { return { x: 0, y: 0, width: 0, height: 0 }; }
                };
            }
            
            if (!this.backgroundManager) {
                this.backgroundManager = {
                    update: function() {},
                    render: function(ctx) {
                        ctx.fillStyle = '#87CEEB';
                        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                    },
                    renderBackground: function(ctx) {
                        ctx.fillStyle = '#87CEEB';
                        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                    },
                    renderGround: function(ctx) {}
                };
            }
            
            if (!this.pipeManager) {
                this.pipeManager = {
                    pipes: [],
                    update: function() {},
                    render: function() {},
                    reset: function() {},
                    checkScoring: function() { return 0; }
                };
            }
        }
    }
    
    /**
     * 새 점프 메서드
     */
    jump() {
        // Bird 클래스의 jump 메서드 호출
        const jumpResult = this.bird.jump();
        
        // 점프 사운드 재생
        if (jumpResult.shouldPlaySound) {
            this.audioManager.play('flap');
        }
        
        GameDebug.log("새 점프", {
            position: { x: this.bird.x, y: this.bird.y },
            velocity: this.bird.velocity
        });
    }
    
    /**
     * 시작 화면 표시
     */
    showStartScreen() {
        GameDebug.log("시작 화면 표시");
        
        try {
            // 게임 상태 변경
            if (this.stateManager) {
                this.stateManager.changeState(GameStateManager.State.START);
            } else {
                GameDebug.error("상태 관리자가 초기화되지 않았습니다");
            }
            
            // 게임 요소 리셋
            this.initGameObjects();
            
            // 배경과 지면 렌더링
            if (this.backgroundManager) {
                try {
                    this.backgroundManager.render(this.ctx);
                } catch (renderError) {
                    GameDebug.error("배경 렌더링 중 오류 발생", renderError);
                    // 기본 배경 렌더링
                    this.ctx.fillStyle = '#87CEEB';
                    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                    // 기본 지면 렌더링
                    this.ctx.fillStyle = '#8FBC8F';
                    this.ctx.fillRect(0, this.canvas.height - GameConfig.GROUND_HEIGHT, 
                                   this.canvas.width, GameConfig.GROUND_HEIGHT);
                }
            } else {
                GameDebug.warn("배경 매니저가 없어 기본 배경 렌더링");
                // 기본 배경 렌더링
                this.ctx.fillStyle = '#87CEEB';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                // 기본 지면 렌더링
                this.ctx.fillStyle = '#8FBC8F';
                this.ctx.fillRect(0, this.canvas.height - GameConfig.GROUND_HEIGHT, 
                                   this.canvas.width, GameConfig.GROUND_HEIGHT);
            }
            
            // 게임 제목
            RenderUtils.drawText(
                this.ctx,
                '웹 플래피버드',
                this.canvas.width / 2,
                80,
                '#4CAF50',
                '36px Arial',
                'center',
                'rgba(0,0,0,0.7)'
            );
            
            // 새 이미지 그리기 (Bird 클래스의 render 메서드 사용)
            if (this.bird) {
                try {
                    this.bird.render(this.ctx, this.debug);
                } catch (birdRenderError) {
                    GameDebug.error("새 렌더링 중 오류 발생", birdRenderError);
                    // 기본 새 렌더링
                    this.ctx.fillStyle = 'yellow';
                    this.ctx.beginPath();
                    this.ctx.arc(this.canvas.width / 3, this.canvas.height / 2, 20, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            } else {
                GameDebug.warn("새 객체가 없어 기본 새 렌더링");
                // 기본 새 렌더링
                this.ctx.fillStyle = 'yellow';
                this.ctx.beginPath();
                this.ctx.arc(this.canvas.width / 3, this.canvas.height / 2, 20, 0, Math.PI * 2);
                this.ctx.fill();
            }
        } catch (error) {
            GameDebug.error("시작 화면 표시 중 오류 발생", error);
            
            // 오류 발생 시 최소한의 시작 화면 표시
            this.ctx.fillStyle = '#87CEEB';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            RenderUtils.drawText(
                this.ctx,
                '웹 플래피버드',
                this.canvas.width / 2,
                80,
                '#4CAF50',
                '36px Arial',
                'center',
                'rgba(0,0,0,0.7)'
            );
            
            RenderUtils.drawText(
                this.ctx,
                '리소스 로딩 중 오류가 발생했습니다',
                this.canvas.width / 2,
                this.canvas.height / 2,
                'red',
                '20px Arial',
                'center'
            );
        }
    }
    
    /**
     * 게임 시작
     */
    startGame() {
        GameDebug.log("게임 시작 함수 호출됨");
        
        try {
            // 게임 상태 변경
            this.stateManager.changeState(GameStateManager.State.PLAYING);
            
            // 점수 시스템 초기화
            this.scoreSystem.reset();
            
            // 게임 요소 초기화
            this.initGameObjects();
            this.pipeManager.reset();
            
            // 배경 음악 재생
            if (!this.audioManager.isMuted()) {
                this.audioManager.playBackgroundMusic('bgMusic');
            }
            
            GameDebug.log("게임 시작 완료", {
                state: this.stateManager.currentState,
                score: this.scoreSystem.getCurrentScore()
            });
        } catch (error) {
            GameDebug.error("게임 시작 중 오류 발생", error);
        }
    }
    
    /**
     * 게임 일시정지
     */
    pauseGame() {
        GameDebug.log("게임 일시정지 함수 호출됨");
        
        if (this.stateManager.isState(GameStateManager.State.PLAYING)) {
            this.stateManager.changeState(GameStateManager.State.PAUSED);
            
            // 배경 음악 일시정지
            this.audioManager.stopBackgroundMusic();
            
            GameDebug.log("게임이 일시정지됨");
        } else {
            GameDebug.log("게임 일시정지 무시 - 현재 상태가 PLAYING이 아님");
        }
    }
    
    /**
     * 일시정지 화면 렌더링
     */
    renderPauseScreen() {
        // 어두운 배경 오버레이
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 일시정지 텍스트
        RenderUtils.drawText(
            this.ctx,
            '일시정지',
            this.canvas.width / 2,
            this.canvas.height / 2,
            '36px Arial',
            'white',
            'center'
        );
        
        RenderUtils.drawText(
            this.ctx,
            'ESC를 눌러 계속하기',
            this.canvas.width / 2,
            this.canvas.height / 2 + 40,
            '18px Arial',
            'white',
            'center'
        );
    }
    
    /**
     * 게임 재개
     */
    resumeGame() {
        GameDebug.log("게임 재개 함수 호출됨");
        
        if (this.stateManager.isState(GameStateManager.State.PAUSED)) {
            this.stateManager.changeState(GameStateManager.State.PLAYING);
            
            // 배경 음악 재개
            if (!this.audioManager.isMuted()) {
                this.audioManager.playBackgroundMusic('bgMusic');
            }
            
            GameDebug.log("게임 재개됨");
        } else {
            GameDebug.log("게임 재개 무시 - 현재 상태가 PAUSED가 아님");
        }
    }
    
    /**
     * 게임 재설정
     */
    resetGame() {
        GameDebug.log("게임 재설정 함수 호출됨");
        
        // 점수 시스템 초기화
        this.scoreSystem.reset();
        
        // Bird 객체 초기화
        if (this.bird) {
            this.bird.reset(this.canvas.width / 3, this.canvas.height / 2);
        }
        
        this.startGame();
    }
    
    /**
     * 게임 상태 업데이트
     * @param {number} deltaTime - 경과 시간 (초)
     * @param {number} fps - 현재 FPS
     */
    update(deltaTime, fps) {
        if (!this.stateManager.isState(GameStateManager.State.PLAYING)) return;
        
        // 새 업데이트
        this.updateBird(deltaTime);
        
        // 파이프 업데이트
        this.updatePipes(deltaTime);
        
        // 배경 업데이트
        this.backgroundManager.update(deltaTime);
        
        // 충돌 검사
        this.checkCollisions();
        
        // 점수 업데이트
        this.updateScoring();
        
        // 점수 애니메이션 업데이트
        this.scoreSystem.updateAnimation(deltaTime);
    }
    
    /**
     * 새 업데이트
     * @param {number} deltaTime - 경과 시간 (초)
     */
    updateBird(deltaTime) {
        // Bird 클래스의 update 메서드 호출
        this.bird.update(deltaTime);
    }
    
    /**
     * 파이프 업데이트
     * @param {number} deltaTime - 경과 시간 (초)
     */
    updatePipes(deltaTime) {
        // PipeManager의 update 메서드 호출
        this.pipeManager.update(deltaTime);
    }
    
    /**
     * 충돌 검사
     */
    checkCollisions() {
        // 충돌 시스템의 checkCollisions 메서드 호출
        const collision = this.collisionSystem.checkCollisions(
            this.bird,
            this.pipeManager,
            this.canvas.height
        );
        
        // 충돌이 감지되면 게임 오버 및 시각적 효과
        if (collision) {
            this.collisionSystem.startCollisionEffect(collision);
            this.gameOver();
            return true;
        }
        
        return false;
    }
    
    /**
     * 점수 업데이트
     */
    updateScoring() {
        // Bird 클래스의 getBounds 메서드 호출
        const birdBounds = this.bird.getBounds();
        
        // PipeManager의 checkScoring 메서드 호출
        const scoreGained = this.pipeManager.checkScoring(birdBounds);
        
        if (scoreGained > 0) {
            // ScoreSystem의 addScore 메서드 호출
            this.scoreSystem.addScore(scoreGained);
            
            // 점수 획득 사운드 재생
            this.audioManager.play('score');
        }
    }
    
    /**
     * 게임 렌더링
     * @param {number} fps - 현재 FPS
     */
    render(fps) {
        // 배경 클리어
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 배경 및 지면 렌더링
        this.backgroundManager.renderBackground(this.ctx);
        
        // 파이프 렌더링
        this.renderPipes();
        
        // 지면 렌더링
        this.backgroundManager.renderGround(this.ctx);
        
        // 새 렌더링
        this.renderBird();
        
        // 디버그 정보 표시
        if (this.debug) {
            this.renderDebugInfo(fps);
        }
        
        // 충돌 영역 디버그 렌더링
        this.collisionSystem.renderDebugColliders(
            this.ctx,
            this.bird,
            this.pipeManager,
            this.canvas.width,
            this.canvas.height
        );
        
        // 충돌 효과 렌더링
        this.collisionSystem.renderCollisionEffect(this.ctx);
        
        // 일시정지 상태에서는 일시정지 메시지 표시
        if (this.stateManager.isState(GameStateManager.State.PAUSED)) {
            this.renderPauseScreen();
        }
    }
    
    /**
     * 새 렌더링
     */
    renderBird() {
        // Bird 클래스의 render 메서드 호출
        this.bird.render(this.ctx, this.debug);
    }
    
    /**
     * 파이프 렌더링
     */
    renderPipes() {
        // PipeManager의 render 메서드 호출
        this.pipeManager.render(this.ctx, this.debug);
    }
    
    /**
     * 디버그 정보 렌더링
     */
    renderDebugInfo(fps) {
        const debugInfo = [
            `Bird Position: (${Math.round(this.bird.x)}, ${Math.round(this.bird.y)})`,
            `Bird Velocity: ${Math.round(this.bird.velocity)}`,
            `Bird Rotation: ${this.bird.rotation.toFixed(2)}`,
            `Score: ${this.scoreSystem.getCurrentScore()}`,
            `High Score: ${this.scoreSystem.getHighScore()}`,
            `Pipes: ${this.pipeManager.pipes.length}`,
            `Pipe Timer: ${this.pipeManager.timer.toFixed(2)}/${this.pipeManager.pipeSpawnInterval}`,
            `FPS: ${fps.toFixed(2)}`
        ];
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(10, 30, 220, 20 * debugInfo.length + 10);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'left';
        
        debugInfo.forEach((info, index) => {
            this.ctx.fillText(info, 20, 45 + index * 20);
        });
    }
    
    /**
     * 게임 오버 처리
     */
    gameOver() {
        // 게임 상태 변경
        this.stateManager.changeState(GameStateManager.State.GAME_OVER);
        
        // 점수 시스템에서 최종 처리
        const isNewHighScore = this.scoreSystem.finalizeScore();
        
        // 배경 음악 정지
        this.audioManager.stopBackgroundMusic();
        
        // 게임 오버 사운드 재생
        this.audioManager.play('hit');
    }
    
    /**
     * 오디오 컨트롤 업데이트
     * @param {boolean} initialSetup - 초기 설정 여부
     */
    updateAudioControl(initialSetup = false) {
        // 초기 설정이 아닌 경우 음소거 상태 토글
        if (!initialSetup) {
            this.audioManager.toggleMute();
        }
        
        const isMuted = this.audioManager.isMuted();
        
        // UI 업데이트
        const audioOn = this.audioControl.querySelector('.audio-on');
        const audioOff = this.audioControl.querySelector('.audio-off');
        
        if (isMuted) {
            audioOn.classList.add('hidden');
            audioOff.classList.remove('hidden');
            
            // 모든 오디오 정지
            this.audioManager.stopAll();
        } else {
            audioOn.classList.remove('hidden');
            audioOff.classList.add('hidden');
            
            // 게임 플레이 중이라면 배경 음악 재개
            if (!initialSetup && this.stateManager.isState(GameStateManager.State.PLAYING)) {
                this.audioManager.playBackgroundMusic('bgMusic');
            }
        }
    }
}

// 페이지 로드 시 게임 초기화
window.addEventListener('DOMContentLoaded', () => {
    window.game = new FlappyBirdGame();
}); 