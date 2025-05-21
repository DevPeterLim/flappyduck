/**
 * 게임 상태 관리 클래스 - 게임의 다양한 상태와 전환을 관리합니다.
 */
class GameStateManager {
    /**
     * 게임 상태 상수
     */
    static State = {
        LOADING: 'loading',  // 에셋 로딩 중
        START: 'start',      // 시작 화면
        PLAYING: 'playing',  // 게임 플레이 중
        PAUSED: 'paused',    // 일시 정지
        GAME_OVER: 'gameOver' // 게임 오버
    };
    
    /**
     * 게임 상태 관리자 초기화
     * @param {Object} screens - 게임 화면 요소 (시작, 게임 오버, 일시정지 등)
     * @param {Function} onStateChange - 상태 변경 시 호출할 콜백 함수
     */
    constructor(screens, onStateChange = null) {
        if (window.GameDebug) {
            window.GameDebug.log("GameStateManager 초기화");
        }
        
        // 화면 요소
        this.screens = screens || {};
        
        // 현재 상태
        this.currentState = GameStateManager.State.LOADING;
        
        // 이전 상태 (일시정지에서 복귀 시 사용)
        this.previousState = null;
        
        // 상태 변경 콜백
        this.onStateChange = onStateChange;
        
        // 상태별 진입/종료 액션
        this.stateActions = {
            [GameStateManager.State.LOADING]: {
                enter: () => this.enterLoadingState(),
                exit: () => this.exitLoadingState()
            },
            [GameStateManager.State.START]: {
                enter: () => this.enterStartState(),
                exit: () => this.exitStartState()
            },
            [GameStateManager.State.PLAYING]: {
                enter: () => this.enterPlayingState(),
                exit: () => this.exitPlayingState()
            },
            [GameStateManager.State.PAUSED]: {
                enter: () => this.enterPausedState(),
                exit: () => this.exitPausedState()
            },
            [GameStateManager.State.GAME_OVER]: {
                enter: () => this.enterGameOverState(),
                exit: () => this.exitGameOverState()
            }
        };
        
        // 디버그 로그
        if (window.GameDebug) {
            window.GameDebug.log("GameStateManager 초기화 완료", {
                initialState: this.currentState,
                uiElements: Object.keys(this.screens)
            });
        }
    }
    
    /**
     * 현재 게임 상태 가져오기
     * @returns {string} 현재 게임 상태
     */
    getState() {
        return this.currentState;
    }
    
    /**
     * 특정 상태인지 확인
     * @param {string} state - 확인할 상태
     * @returns {boolean} 현재 상태가 확인할 상태와 일치하는지 여부
     */
    isState(state) {
        return this.currentState === state;
    }
    
    /**
     * 게임 상태 변경
     * @param {string} newState - 새 게임 상태
     * @returns {boolean} 상태 변경 성공 여부
     */
    changeState(newState) {
        // 유효한 상태인지 확인
        if (!Object.values(GameStateManager.State).includes(newState)) {
            if (window.GameDebug) {
                window.GameDebug.error(`유효하지 않은 게임 상태: ${newState}`);
            }
            return false;
        }
        
        try {
            if (window.GameDebug) {
                window.GameDebug.log(`상태 변경 시도: ${this.currentState} -> ${newState}`);
            }
            
            // 이전 상태
            const oldState = this.currentState;
            
            // 상태가 같으면 무시
            if (oldState === newState) {
                if (window.GameDebug) {
                    window.GameDebug.log(`상태가 이미 ${newState}임 - 변경 무시`);
                }
                return true;
            }
            
            // 이전 상태 저장
            this.previousState = oldState;
            
            // 이전 상태 종료 액션 실행
            if (this.stateActions[oldState] && this.stateActions[oldState].exit) {
                if (window.GameDebug) {
                    window.GameDebug.log(`${oldState} 상태 종료 액션 실행`);
                }
                try {
                    this.stateActions[oldState].exit();
                } catch (error) {
                    if (window.GameDebug) {
                        window.GameDebug.error(`${oldState} 종료 액션 실행 중 오류 발생`, error);
                    }
                }
            }
            
            // 새 상태로 변경
            this.currentState = newState;
            
            // 새 상태 진입 액션 실행
            if (this.stateActions[newState] && this.stateActions[newState].enter) {
                if (window.GameDebug) {
                    window.GameDebug.log(`${newState} 상태 진입 액션 실행`);
                }
                try {
                    this.stateActions[newState].enter();
                } catch (error) {
                    if (window.GameDebug) {
                        window.GameDebug.error(`${newState} 진입 액션 실행 중 오류 발생`, error);
                    }
                }
            }
            
            // 콜백 함수 호출
            if (typeof this.onStateChange === 'function') {
                if (window.GameDebug) {
                    window.GameDebug.log("상태 변경 콜백 호출", {
                        oldState,
                        newState
                    });
                }
                
                try {
                    this.onStateChange(newState, oldState);
                } catch (callbackError) {
                    if (window.GameDebug) {
                        window.GameDebug.error("상태 변경 콜백 실행 중 오류 발생", callbackError);
                    }
                }
            } else if (window.GameDebug) {
                window.GameDebug.warn("상태 변경 콜백이 함수가 아님", {
                    callbackType: typeof this.onStateChange
                });
            }
            
            // 상태 변경 이벤트 발생
            try {
                const stateChangeEvent = new CustomEvent('gameStateChange', {
                    detail: {
                        oldState: oldState,
                        newState: newState
                    },
                    bubbles: true
                });
                
                window.dispatchEvent(stateChangeEvent);
                
                if (window.GameDebug) {
                    window.GameDebug.log("상태 변경 이벤트 발생", {
                        oldState,
                        newState
                    });
                }
            } catch (eventError) {
                if (window.GameDebug) {
                    window.GameDebug.error("상태 변경 이벤트 발생 중 오류", eventError);
                }
            }
            
            if (window.GameDebug) {
                window.GameDebug.log(`상태 변경 완료: ${oldState} -> ${newState}`);
            }
            
            return true;
        } catch (error) {
            if (window.GameDebug) {
                window.GameDebug.error("상태 변경 중 오류 발생", error);
            }
            return false;
        }
    }
    
    /**
     * 이전 상태로 복귀 (일시정지에서 복귀 등)
     */
    returnToPreviousState() {
        if (this.previousState) {
            this.changeState(this.previousState);
        }
    }
    
    /**
     * 로딩 상태 진입 처리
     * @private
     */
    enterLoadingState() {
        this.hideAllScreens();
        // 로딩 화면 표시 (구현 필요시)
    }
    
    /**
     * 로딩 상태 종료 처리
     * @private
     */
    exitLoadingState() {
        // 로딩 화면 숨기기 (구현 필요시)
    }
    
    /**
     * 시작 상태 진입 처리
     * @private
     */
    enterStartState() {
        this.hideAllScreens();
        if (window.GameDebug) {
            window.GameDebug.log("시작 화면 표시 처리", this.screens);
        }
        
        if (this.screens.startScreen) {
            this.screens.startScreen.classList.remove('hidden');
            if (window.GameDebug) {
                window.GameDebug.log("시작 화면 표시됨");
                if (window.GameDebug.traceElement) {
                    window.GameDebug.traceElement(this.screens.startScreen, 'startScreen');
                }
            }
        } else {
            if (window.GameDebug) {
                window.GameDebug.error("startScreen 요소를 찾을 수 없음", this.screens);
            }
        }
        
        if (this.screens.scoreDisplay) {
            this.screens.scoreDisplay.classList.add('hidden');
            if (window.GameDebug) {
                window.GameDebug.log("점수 표시 숨김");
            }
        }
    }
    
    /**
     * 시작 상태 종료 처리
     * @private
     */
    exitStartState() {
        if (this.screens.startScreen) {
            this.screens.startScreen.classList.add('hidden');
            if (window.GameDebug) {
                window.GameDebug.log("시작 화면 숨김");
                if (window.GameDebug.traceElement) {
                    window.GameDebug.traceElement(this.screens.startScreen, 'startScreen (exitState)');
                }
            }
        }
    }
    
    /**
     * 플레이 상태 진입 처리
     * @private
     */
    enterPlayingState() {
        this.hideAllScreens();
        if (window.GameDebug) {
            window.GameDebug.log("플레이 상태 진입 - 점수 표시");
        }
        
        if (this.screens.scoreDisplay) {
            this.screens.scoreDisplay.classList.remove('hidden');
            if (window.GameDebug) {
                window.GameDebug.log("점수 표시 보임");
                if (window.GameDebug.traceElement) {
                    window.GameDebug.traceElement(this.screens.scoreDisplay, 'scoreDisplay');
                }
            }
        } else {
            if (window.GameDebug) {
                window.GameDebug.error("scoreDisplay 요소를 찾을 수 없음", this.screens);
            }
        }
    }
    
    /**
     * 플레이 상태 종료 처리
     * @private
     */
    exitPlayingState() {
        // 필요한 경우 구현
        if (window.GameDebug) {
            window.GameDebug.log("플레이 상태 종료");
        }
    }
    
    /**
     * 일시정지 상태 진입 처리
     * @private
     */
    enterPausedState() {
        if (this.screens.pauseScreen) {
            this.screens.pauseScreen.classList.remove('hidden');
            if (window.GameDebug) {
                window.GameDebug.log("일시정지 화면 표시");
                if (window.GameDebug.traceElement) {
                    window.GameDebug.traceElement(this.screens.pauseScreen, 'pauseScreen');
                }
            }
        }
    }
    
    /**
     * 일시정지 상태 종료 처리
     * @private
     */
    exitPausedState() {
        if (this.screens.pauseScreen) {
            this.screens.pauseScreen.classList.add('hidden');
            if (window.GameDebug) {
                window.GameDebug.log("일시정지 화면 숨김");
            }
        }
    }
    
    /**
     * 게임 오버 상태 진입 처리
     * @private
     */
    enterGameOverState() {
        if (this.screens.gameOverScreen) {
            this.screens.gameOverScreen.classList.remove('hidden');
            if (window.GameDebug) {
                window.GameDebug.log("게임 오버 화면 표시");
                if (window.GameDebug.traceElement) {
                    window.GameDebug.traceElement(this.screens.gameOverScreen, 'gameOverScreen');
                }
            }
        }
    }
    
    /**
     * 게임 오버 상태 종료 처리
     * @private
     */
    exitGameOverState() {
        if (this.screens.gameOverScreen) {
            this.screens.gameOverScreen.classList.add('hidden');
            if (window.GameDebug) {
                window.GameDebug.log("게임 오버 화면 숨김");
            }
        }
    }
    
    /**
     * 모든 게임 화면 숨기기
     * @private
     */
    hideAllScreens() {
        if (window.GameDebug) {
            window.GameDebug.log("모든 화면 숨기기", Object.keys(this.screens));
        }
        
        Object.values(this.screens).forEach(screen => {
            if (screen && screen.classList) {
                screen.classList.add('hidden');
                if (window.GameDebug && window.GameDebug.traceElement) {
                    window.GameDebug.traceElement(screen, `${screen.id || 'screen'} (hiding)`);
                }
            }
        });
    }
} 